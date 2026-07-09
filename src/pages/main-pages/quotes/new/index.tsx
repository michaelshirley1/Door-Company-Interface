import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { FormField, TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { Table } from '../../../../components/table';
import Loading from '../../../../components/loading';
import Button from '../../../../components/button';
import { Quote, QuoteStatus } from '../model';
import { getQuote, createQuote, updateQuote, deleteQuote } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';
import { DoorType } from '../../../side-pages/door-types/model';
import { HingeType } from '../../../side-pages/hinge-types/model';
import { HandleType } from '../../../side-pages/handle-types/model';
import { JambType } from '../../../side-pages/jamb-types/model';
import { getDoorTypes } from '../../../side-pages/door-types/api';
import { getHingeTypes } from '../../../side-pages/hinge-types/api';
import { getHandleTypes } from '../../../side-pages/handle-types/api';
import { getJambTypes } from '../../../side-pages/jamb-types/api';
import { OrderItem } from '../../jobs/model';
import QuoteItemModal from './item-modal';
import { generateQuotePdf } from '../../../../utils/jobPdf';
import { createOrder } from '../../orders/api';
import ReadOnlyField from '../../../../components/read-only-field';
import { formatCurrency, todayISO } from '../../../../shared/format';
import { getApiErrorMessage } from '../../../../api/errors';

const calcItemsTotal = (items: OrderItem[]): number =>
    items.reduce((sum, item) => sum + ((item.unitPrice ?? 0) * (item.quantity ?? 1)), 0);

const QuoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Quote | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [hingeTypes, setHingeTypes] = useState<HingeType[]>([]);
    const [handleTypes, setHandleTypes] = useState<HandleType[]>([]);
    const [jambTypes, setJambTypes] = useState<JambType[]>([]);
    const [addModal, setAddModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        quoteNumber:  '',
        customerId:   '',
        customerName: '',
        status:       'Draft' as QuoteStatus,
        validUntil:   '',
        createdBy:    '',
        notes:        '',
        siteAddress:  '',
        items:        [] as OrderItem[],
        jobId:        null as number | null,
        jobNumber:    null as string | null,
    });

    useEffect(() => {
        if (!id) { navigate('/quotes'); return; }

        Promise.all([
            getCustomers().then(setCustomers),
            getDoorTypes().then(setDoorTypes),
            getHingeTypes().then(setHingeTypes),
            getHandleTypes().then(setHandleTypes),
            getJambTypes().then(setJambTypes),
            getQuote(parseInt(id)).then(quote => {
                setExisting(quote);
                setForm({
                    quoteNumber:  quote.quoteNumber  ?? '',
                    customerId:   quote.customerId?.toString() ?? '',
                    customerName: quote.customerName ?? '',
                    status:       (quote.status as QuoteStatus) ?? 'Draft',
                    validUntil:   quote.validUntil   ?? '',
                    createdBy:    quote.createdBy    ?? '',
                    notes:        quote.notes        ?? '',
                    siteAddress:  quote.siteAddress  ?? '',
                    items:        quote.items        ?? [],
                    jobId:        quote.jobId        ?? null,
                    jobNumber:    quote.jobNumber    ?? null,
                });
            }),
        ])
            .catch(() => setError('Failed to load data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    const itemsTotal = calcItemsTotal(form.items);

    const getReturnPath = () => {
        if (form.jobId) return `/jobs/${form.jobId}/edit`;
        return '/quotes';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
        if (fieldErrors.customerId) setFieldErrors(prev => { const n = { ...prev }; delete n.customerId; return n; });
    };

    const buildSaveData = (): Omit<Quote, 'id'> => ({
        quoteNumber:  form.quoteNumber,
        customerId:   parseInt(form.customerId) || 0,
        customerName: form.customerName,
        status:       form.status,
        totalAmount:  itemsTotal || null,
        validUntil:   form.validUntil  || null,
        createdBy:    form.createdBy   || null,
        notes:        form.notes       || null,
        siteAddress:  form.siteAddress || null,
        items:        form.items,
        jobId:        form.jobId,
        jobNumber:    form.jobNumber,
    });

    const apiError = (err: unknown, prefix: string) =>
        setError(`${prefix}: ${getApiErrorMessage(err)}`);

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};
        if (!form.customerId) newErrors.customerId = 'Customer is required';
        if (Object.keys(newErrors).length > 0) { setFieldErrors(newErrors); return; }
        setFieldErrors({});
        setError(null);
        setSaving(true);
        const data = buildSaveData();
        const action = existing
            ? updateQuote(existing.id, { ...existing, ...data })
            : createQuote(data);
        action
            .then(() => navigate(getReturnPath()))
            .catch((err) => apiError(err, 'Failed to save'))
            .finally(() => setSaving(false));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteQuote(existing.id)
            .then(() => navigate(getReturnPath()))
            .catch((err) => apiError(err, 'Failed to delete'));
    };

    const handleCreateOrder = async () => {
        if (!existing) return;
        setError(null);
        setCreatingOrder(true);
        try {
            const order = await createOrder({
                quoteId:          existing.id,
                customerId:       existing.customerId,
                customerName:     existing.customerName,
                poNumber:         null,
                status:           'Received',
                jobId:            existing.jobId ?? null,
                jobNumber:        existing.jobNumber ?? null,
                siteAddress:      existing.siteAddress ?? null,
                siteDescription:  existing.siteDescription ?? null,
                orderDate:        todayISO(),
                expectedDelivery: null,
                totalAmount:      itemsTotal || null,
                notes:            null,
            });
            navigate(`/orders/${order.id}/edit`);
        } catch (err) {
            apiError(err, 'Failed to create order');
            setCreatingOrder(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!existing) return;
        generateQuotePdf({ ...existing, items: form.items }, { doorTypes, hingeTypes, handleTypes });
    };

    const handleSaveItem = (item: OrderItem, idx: number | null) => {
        if (idx !== null) {
            setForm(prev => ({ ...prev, items: prev.items.map((it, i) => i === idx ? item : it) }));
        } else {
            setForm(prev => ({ ...prev, items: [...prev.items, item] }));
        }
        setEditIndex(null);
        setAddModal(false);
    };

    const handleRemoveItem = (index: number) =>
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

    const workflowActions = existing ? (
        <>
            <Button variant="secondary" onClick={handleDownloadPdf} disabled={saving}>
                Download PDF
            </Button>
            {['Draft', 'Sent', 'Accepted'].includes(form.status) && (
                <Button variant="primary" onClick={handleCreateOrder} loading={creatingOrder} disabled={saving || creatingOrder}>
                    Create Order
                </Button>
            )}
        </>
    ) : undefined;

    if (loading) return <Loading />;

    return (
        <>
            <FormWrapper
                title={existing ? `Quote ${existing.quoteNumber}` : 'New Quote'}
                onSubmit={handleSubmit}
                onCancel={() => navigate(getReturnPath())}
                onDelete={existing ? handleDelete : undefined}
                extraActions={workflowActions}
                error={error}
                submitting={saving}
            >
                {form.jobNumber && (
                    <ReadOnlyField
                        label="From Job"
                        value={form.jobNumber}
                        onClick={() => form.jobId && navigate(`/jobs/${form.jobId}/edit`)}
                        title="Click to open job"
                    />
                )}

                {form.siteAddress && (
                    <ReadOnlyField label="Site Address" value={form.siteAddress} />
                )}

                <div className="form-row">
                    <TextField label="Quote Number" name="quoteNumber" value={form.quoteNumber} onChange={handleChange} placeholder="QTE-001" />
                    <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                        <option value="Expired">Expired</option>
                    </SelectField>
                </div>

                <div className="form-row">
                    <SelectField label="Customer" error={fieldErrors.customerId} name="customerId" value={form.customerId} onChange={handleCustomerChange}>
                        <option value="">Select customer...</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.companyName ?? c.name}</option>
                        ))}
                    </SelectField>
                    <TextField label="Created By" name="createdBy" value={form.createdBy} onChange={handleChange} placeholder="Staff member" />
                </div>

                <TextField label="Valid Until" type="date" name="validUntil" value={form.validUntil} onChange={handleChange} />

                <FormField label="Items">
                    <Table<OrderItem>
                        headers={[
                            { id: 'itemType',  title: 'Type' },
                            { id: 'room',      title: 'Room' },
                            { id: 'heightMm',  title: 'H (mm)' },
                            { id: 'widthMm',   title: 'W (mm)' },
                            { id: 'handSide',  title: 'Hang' },
                            { id: 'notes',     title: 'Notes' },
                            { id: 'quantity',  title: 'Qty',    render: (v) => v ?? 1 },
                            { id: 'unitPrice', title: 'Price',  render: (v) => formatCurrency(v) },
                            {
                                id: '_edit',
                                title: '',
                                render: (_v, _row, index) => (
                                    <Button variant="secondary" onClick={() => { setEditIndex(index!); setAddModal(true); }}>Edit</Button>
                                ),
                            },
                            {
                                id: '_remove',
                                title: '',
                                render: (_v, _row, index) => (
                                    <Button variant="danger" onClick={() => handleRemoveItem(index!)}>Remove</Button>
                                ),
                            },
                        ]}
                        rows={form.items}
                        onAddClick={() => setAddModal(true)}
                    />
                </FormField>

                {form.items.length > 0 && (
                    <div className="total-row">
                        <span className="total-row-label">TOTAL (excl. GST)</span>
                        <span className="total-row-amount">{formatCurrency(itemsTotal)}</span>
                    </div>
                )}

                <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} />
            </FormWrapper>

            <QuoteItemModal
                isOpen={addModal}
                sortOrder={form.items.length}
                doorTypes={doorTypes}
                hingeTypes={hingeTypes}
                handleTypes={handleTypes}
                jambTypes={jambTypes}
                editIndex={editIndex}
                initialItem={editIndex !== null ? form.items[editIndex] : null}
                onAdd={handleSaveItem}
                onClose={() => { setEditIndex(null); setAddModal(false); }}
            />
        </>
    );
};

export default QuoteFormPage;
