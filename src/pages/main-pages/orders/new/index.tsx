import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { FormField, TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import Loading from '../../../../components/loading';
import Button from '../../../../components/button';
import { PurchaseOrder } from '../model';
import { getOrder, updateOrder, deleteOrder, setItemDispatched } from '../api';
import { OrderItem } from '../../jobs/model';
import { DoorType } from '../../../side-pages/door-types/model';
import { HandleType } from '../../../side-pages/handle-types/model';
import { HingeType } from '../../../side-pages/hinge-types/model';
import { JambType, JambRequirement } from '../../../side-pages/jamb-types/model';
import { CavitySliderType } from '../../../side-pages/cavity-sliders/model';
import { TrackType } from '../../../side-pages/track-types/model';
import { getDoorTypes } from '../../../side-pages/door-types/api';
import { getHandleTypes } from '../../../side-pages/handle-types/api';
import { getHingeTypes } from '../../../side-pages/hinge-types/api';
import { getJambTypes, getJambRequirements } from '../../../side-pages/jamb-types/api';
import { getCavitySliders } from '../../../side-pages/cavity-sliders/api';
import { getTrackTypes } from '../../../side-pages/track-types/api';
import { createInvoice } from '../../invoices/api';
import ReadOnlyField from '../../../../components/read-only-field';
import { formatCurrency, todayISO } from '../../../../shared/format';
import { getApiErrorMessage } from '../../../../api/errors';
import { ORDER_STATUSES } from '../../../../shared/constants';
import { generateDispatchPdf } from '../../../../utils/jobPdf';
import { generateProductionPdf } from '../../../../utils/productionPdf';
import { useAuth } from '../../../../auth/AuthContext';

const STATUS_FLOW = ['Received', 'Confirmed', 'InProduction', 'Ready', 'Dispatched', 'Delivered'];
const NEXT_STATUS_LABEL: Record<string, string> = {
    Received: 'Mark Confirmed',
    Confirmed: 'Mark In Production',
    InProduction: 'Mark Ready',
    Ready: 'Mark Dispatched',
    Dispatched: 'Mark Delivered',
};

const OrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<PurchaseOrder | undefined>();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [handleTypes, setHandleTypes] = useState<HandleType[]>([]);
    const [hingeTypes, setHingeTypes] = useState<HingeType[]>([]);
    const [jambTypes, setJambTypes] = useState<JambType[]>([]);
    const [jambRequirements, setJambRequirements] = useState<JambRequirement[]>([]);
    const [cavitySliderTypes, setCavitySliderTypes] = useState<CavitySliderType[]>([]);
    const [trackTypes, setTrackTypes] = useState<TrackType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creatingInvoice, setCreatingInvoice] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        poNumber:         '',
        status:           'Received',
        expectedDelivery: '',
        notes:            '',
    });

    useEffect(() => {
        if (!id) { navigate('/orders'); return; }

        Promise.all([
            getDoorTypes().then(setDoorTypes),
            getHandleTypes().then(setHandleTypes),
            getHingeTypes().then(setHingeTypes),
            getJambTypes().then(setJambTypes),
            getJambRequirements().then(setJambRequirements),
            getCavitySliders().then(setCavitySliderTypes),
            getTrackTypes().then(setTrackTypes),
            getOrder(parseInt(id)).then(order => {
                setExisting(order);
                setItems(order.quote?.items ?? []);
                setForm({
                    poNumber:         order.poNumber         ?? '',
                    status:           order.status           ?? 'Received',
                    expectedDelivery: order.expectedDelivery ?? '',
                    notes:            order.notes            ?? '',
                });
            }),
        ])
            .catch(() => setError('Failed to load data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const apiError = (err: unknown, prefix: string) =>
        setError(`${prefix}: ${getApiErrorMessage(err)}`);

    const buildSaveData = (): PurchaseOrder => ({
        ...existing!,
        poNumber:         form.poNumber         || null,
        status:           form.status,
        expectedDelivery: form.expectedDelivery || null,
        notes:            form.notes            || null,
    });

    const handleSubmit = () => {
        if (!existing) return;
        setError(null);
        setSaving(true);
        updateOrder(existing.id, buildSaveData())
            .then(updated => setExisting(updated))
            .catch((err) => apiError(err, 'Failed to save'))
            .finally(() => setSaving(false));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteOrder(existing.id)
            .then(() => navigate(getReturnPath()))
            .catch((err) => apiError(err, 'Failed to delete'));
    };

    const getReturnPath = () => {
        if (existing?.jobId) return `/jobs/${existing.jobId}/edit`;
        return '/orders';
    };

    const transitionStatus = (newStatus: string) => {
        if (!existing) return;
        setError(null);
        setSaving(true);
        updateOrder(existing.id, { ...buildSaveData(), status: newStatus })
            .then(updated => {
                setExisting(updated);
                setForm(prev => ({ ...prev, status: newStatus }));
            })
            .catch((err) => apiError(err, 'Failed to update status'))
            .finally(() => setSaving(false));
    };

    const allDispatched = items.length > 0 && items.every(i => i.isDispatched);

    const handleToggleDispatched = (item: OrderItem, checked: boolean) => {
        if (!existing) return;
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isDispatched: checked } : i));
        setItemDispatched(existing.id, item.id, checked).catch(err => {
            apiError(err, 'Failed to update item');
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, isDispatched: !checked } : i));
        });
    };

    const handleAdvanceStatus = () => {
        const idx = STATUS_FLOW.indexOf(form.status);
        if (idx === -1 || idx === STATUS_FLOW.length - 1) return;
        transitionStatus(STATUS_FLOW[idx + 1]);
    };

    const handleCreateInvoice = async () => {
        if (!existing) return;
        setError(null);
        setCreatingInvoice(true);
        try {
            const quoteTotal = existing.quote?.totalAmount ?? existing.totalAmount ?? 0;
            const subtotal   = quoteTotal;
            const taxRate    = 0.15;
            const taxAmount  = Math.round(subtotal * taxRate * 100) / 100;
            const total      = Math.round((subtotal + taxAmount) * 100) / 100;
            const quoteNumber = existing.quote
                ? existing.quote.quoteNumber
                : null;
            const invoice = await createInvoice({
                invoiceNumber: '', 
                jobId:         existing.jobId,
                jobNumber:     existing.jobNumber,
                quoteId:       existing.quoteId,
                quoteNumber:   quoteNumber,
                customerName:  existing.customerName,
                status:        'Draft',
                subtotal,
                taxRate,
                taxAmount,
                total,
                amountPaid:    0,
                dueDate:       null,
                notes:         null,
                issuedAt:      todayISO(),
                paidAt:        null,
            });
            navigate(`/invoices/${invoice.id}/edit`);
        } catch (err) {
            apiError(err, 'Failed to create invoice');
            setCreatingInvoice(false);
        }
    };

    const handlePrintProduction = () => {
        if (!existing) return;
        generateProductionPdf(existing, { doorTypes, hingeTypes, handleTypes, jambTypes, jambRequirements, cavitySliderTypes, trackTypes });
    };

    const handlePrintDispatch = () => {
        if (!existing) return;
        generateDispatchPdf(existing, { doorTypes, hingeTypes, handleTypes });
    };

    const itemHeaders: HeaderItem<OrderItem>[] = [
        { id: 'itemType',  title: 'Type' },
        { id: 'room',      title: 'Room' },
        { id: 'heightMm',  title: 'H (mm)' },
        { id: 'widthMm',   title: 'W (mm)' },
        { id: 'handSide',  title: 'Hang' },
        { id: 'notes',     title: 'Notes' },
        { id: 'quantity',  title: 'Qty',    render: (v) => v ?? 1 },
        { id: 'unitPrice', title: 'Price',  render: (v) => formatCurrency(v) },
        ...(form.status === 'Dispatched' ? [{
            id: 'isDispatched' as keyof OrderItem,
            title: 'Sent',
            render: (_v: unknown, row: OrderItem) => (
                <input
                    type="checkbox"
                    checked={!!row.isDispatched}
                    onChange={e => handleToggleDispatched(row, e.target.checked)}
                />
            ),
        }] : []),
    ];

    const workflowActions = existing ? (
        <>
            {['Received', 'Confirmed', 'InProduction', 'Ready', 'Dispatched'].includes(form.status) && (
                <Button variant="secondary" onClick={handlePrintProduction} disabled={saving}>
                    Print Production Docket
                </Button>
            )}
            {['Ready', 'Dispatched', 'Delivered'].includes(form.status) && (
                <Button variant="secondary" onClick={handlePrintDispatch} disabled={saving}>
                    Print Dispatch Docket
                </Button>
            )}
            {form.status === 'Dispatched' && (
                <Button
                    variant="primary"
                    onClick={handleAdvanceStatus}
                    loading={saving}
                    disabled={saving || !allDispatched}
                    title={!allDispatched ? 'Tick every item as sent before marking delivered' : undefined}
                >
                    {NEXT_STATUS_LABEL[form.status]}
                </Button>
            )}
            {['Received', 'Confirmed', 'InProduction', 'Ready'].includes(form.status) && (
                <Button variant="primary" onClick={handleAdvanceStatus} loading={saving} disabled={saving}>
                    {NEXT_STATUS_LABEL[form.status]}
                </Button>
            )}
            {form.status === 'Delivered' && (
                <Button variant="primary" onClick={handleCreateInvoice} loading={creatingInvoice} disabled={saving || creatingInvoice}>
                    Create Invoice
                </Button>
            )}
        </>
    ) : undefined;

    if (loading) return <Loading />;

    return (
        <FormWrapper
            title={existing ? `Order ${existing.poNumber ?? `#${existing.id}`}` : 'Order'}
            onSubmit={handleSubmit}
            onCancel={() => navigate(getReturnPath())}
            onDelete={existing && isAdmin ? handleDelete : undefined}
            extraActions={workflowActions}
            error={error}
            submitting={saving}
        >
            {existing?.jobNumber && (
                <ReadOnlyField
                    label="From Job"
                    value={existing.jobNumber}
                    onClick={() => existing.jobId && navigate(`/jobs/${existing.jobId}/edit`)}
                    title="Click to open job"
                />
            )}

            {existing?.quote && (
                <ReadOnlyField
                    label="From Quote"
                    value={existing.quote.quoteNumber}
                    onClick={() => navigate(`/quotes/${existing.quoteId}/edit`)}
                    title="Click to open quote"
                />
            )}

            <div className="form-row">
                <ReadOnlyField label="PO Number" value={form.poNumber || 'Assigned on save'} />
                <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>
            </div>

            <div className="form-row">
                <ReadOnlyField label="Customer" value={existing?.customerName ?? ''} />
                {existing?.siteAddress && (
                    <ReadOnlyField label="Site Address" value={existing.siteAddress} />
                )}
            </div>

            <TextField label="Expected Delivery" type="date" name="expectedDelivery" value={form.expectedDelivery} onChange={handleChange} />

            {items.length > 0 && (
                <FormField label={form.status === 'Dispatched' ? 'Items (from Quote) — tick each item as it goes out' : 'Items (from Quote)'}>
                    <Table<OrderItem>
                        headers={itemHeaders}
                        rows={items}
                    />
                    {existing?.quote?.totalAmount != null && (
                        <div className="total-row">
                            <span className="total-row-label">TOTAL (excl. GST)</span>
                            <span className="total-row-amount">{formatCurrency(existing.quote.totalAmount)}</span>
                        </div>
                    )}
                </FormField>
            )}

            <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} />
        </FormWrapper>
    );
};

export default OrderFormPage;
