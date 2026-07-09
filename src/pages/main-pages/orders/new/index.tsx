import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { FormField, TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { Table } from '../../../../components/table';
import Loading from '../../../../components/loading';
import Button from '../../../../components/button';
import { PurchaseOrder } from '../model';
import { getOrder, updateOrder, deleteOrder } from '../api';
import { OrderItem } from '../../jobs/model';
import { DoorType } from '../../../side-pages/door-types/model';
import { HandleType } from '../../../side-pages/handle-types/model';
import { getDoorTypes } from '../../../side-pages/door-types/api';
import { getHandleTypes } from '../../../side-pages/handle-types/api';
import { createInvoice } from '../../invoices/api';
import ReadOnlyField from '../../../../components/read-only-field';
import { formatCurrency, todayISO } from '../../../../shared/format';
import { getApiErrorMessage } from '../../../../api/errors';

const OrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<PurchaseOrder | undefined>();
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [handleTypes, setHandleTypes] = useState<HandleType[]>([]);
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
            getOrder(parseInt(id)).then(order => {
                setExisting(order);
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
                invoiceNumber: `INV-${existing.poNumber ?? existing.id}`,
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

    const handlePrintDocket = (type: 'Production' | 'Dispatch') => {
        const items = existing?.quote?.items ?? [];
        const win = window.open('', '_blank');
        if (!win) return;
        const itemRows = items.map(item => {
            const dt = doorTypes.find(d => d.id === item.doorTypeId);
            const ht = handleTypes.find(h => h.id === item.handleTypeId);
            const typeName = dt?.name ?? item.itemType;
            const handleInfo = ht ? ` + ${ht.name}${ht.finish ? ` (${ht.finish})` : ''}` : '';
            return `<tr>
                <td>${item.room ?? '—'}</td>
                <td>${typeName}${handleInfo}</td>
                <td>${item.heightMm ?? '—'} × ${item.widthMm ?? '—'}</td>
                <td>${item.handSide ?? '—'}</td>
                <td>${item.quantity ?? 1}</td>
                <td>${item.notes ?? '—'}</td>
            </tr>`;
        }).join('');
        win.document.write(`
            <html><head><title>${type} Docket — ${existing?.poNumber ?? existing?.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
                h2 { margin-bottom: 4px; }
                p { margin: 2px 0; color: #555; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th { background: #f0f0f0; padding: 8px; text-align: left; font-size: 12px; border: 1px solid #ccc; }
                td { padding: 8px; font-size: 12px; border: 1px solid #ccc; }
            </style></head><body>
            <h2>${type} Docket</h2>
            <p><strong>Order:</strong> ${existing?.poNumber ?? `PO #${existing?.id}`}</p>
            <p><strong>Customer:</strong> ${existing?.customerName ?? '—'}</p>
            ${existing?.siteAddress ? `<p><strong>Site Address:</strong> ${existing.siteAddress}</p>` : ''}
            ${form.expectedDelivery ? `<p><strong>Expected Delivery:</strong> ${form.expectedDelivery}</p>` : ''}
            <table>
                <thead><tr><th>Room</th><th>Type</th><th>Size (H×W mm)</th><th>Hang</th><th>Qty</th><th>Notes</th></tr></thead>
                <tbody>${itemRows}</tbody>
            </table>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    const items: OrderItem[] = existing?.quote?.items ?? [];

    const workflowActions = existing ? (
        <>
            {['Received', 'Confirmed', 'InProduction', 'Ready'].includes(form.status) && (
                <Button variant="secondary" onClick={() => handlePrintDocket('Production')} disabled={saving}>
                    Print Production Docket
                </Button>
            )}
            {['Ready', 'Delivered'].includes(form.status) && (
                <Button variant="secondary" onClick={() => handlePrintDocket('Dispatch')} disabled={saving}>
                    Print Dispatch Docket
                </Button>
            )}
            {form.status === 'Received'     && <Button variant="primary" onClick={() => transitionStatus('Confirmed')}   loading={saving} disabled={saving}>Mark Confirmed</Button>}
            {form.status === 'Confirmed'    && <Button variant="primary" onClick={() => transitionStatus('InProduction')} loading={saving} disabled={saving}>Mark In Production</Button>}
            {form.status === 'InProduction' && <Button variant="primary" onClick={() => transitionStatus('Ready')}       loading={saving} disabled={saving}>Mark Ready</Button>}
            {form.status === 'Ready'        && <Button variant="primary" onClick={() => transitionStatus('Delivered')}   loading={saving} disabled={saving}>Mark Delivered</Button>}
            {form.status === 'Delivered'    && (
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
            onDelete={existing ? handleDelete : undefined}
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
                <TextField label="PO Number" name="poNumber" value={form.poNumber} onChange={handleChange} placeholder="PO-2026-001" />
                <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
                    <option value="Received">Received</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="InProduction">In Production</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
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
                <FormField label="Items (from Quote)">
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
                        ]}
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
