import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import Loading from '../../../../components/loading';
import { Invoice } from '../model';
import { getInvoice, createInvoice, updateInvoice, deleteInvoice } from '../api';
import { Job } from '../../jobs/model';
import { getJobs } from '../../jobs/api';
import ReadOnlyField from '../../../../components/read-only-field';
import { formatCurrency } from '../../../../shared/format';
import { getApiErrorMessage } from '../../../../api/errors';

interface QuoteConversionState {
    fromQuote?: {
        quoteId: number;
        quoteNumber: string;
        customerName: string;
        subtotal: number;
        notes: string | null;
    };
}

const InvoiceFormPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Invoice | undefined>();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        invoiceNumber: '',
        jobId:         '',
        jobNumber:     '',
        quoteId:       '',
        quoteNumber:   '',
        customerName:  '',
        status:        'Draft',
        subtotal:      '',
        taxRate:       '0.15',
        dueDate:       '',
        notes:         '',
    });

    useEffect(() => {
        const loads: Promise<unknown>[] = [getJobs().then(setJobs)];

        const state = location.state as QuoteConversionState | null;
        if (state?.fromQuote) {
            const q = state.fromQuote;
            setForm(prev => ({
                ...prev,
                quoteId:       q.quoteId.toString(),
                quoteNumber:   q.quoteNumber,
                invoiceNumber: `INV-${q.quoteNumber.replace(/^QTE-/, '')}`,
                subtotal:      q.subtotal.toFixed(2),
                notes:         q.notes ?? '',
            }));
        }

        if (id) {
            loads.push(
                getInvoice(parseInt(id)).then(invoice => {
                    setExisting(invoice);
                    setForm({
                        invoiceNumber: invoice.invoiceNumber ?? '',
                        jobId:         invoice.jobId?.toString() ?? '',
                        jobNumber:     invoice.jobNumber ?? '',
                        quoteId:       invoice.quoteId?.toString() ?? '',
                        quoteNumber:   invoice.quoteNumber ?? '',
                        customerName:  invoice.customerName ?? '',
                        status:        invoice.status ?? 'Draft',
                        subtotal:      invoice.subtotal?.toString() ?? '',
                        taxRate:       invoice.taxRate?.toString() ?? '0.15',
                        dueDate:       invoice.dueDate ?? '',
                        notes:         invoice.notes ?? '',
                    });
                })
            );
        }

        Promise.all(loads)
            .catch(() => setError('Failed to load data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id, location.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const j = jobs.find(j => j.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, jobId: e.target.value, jobNumber: j?.jobNumber ?? '' }));
    };

    const subtotal = parseFloat(form.subtotal) || 0;
    const taxRate = parseFloat(form.taxRate) || 0.15;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};
        if (!form.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
        if (Object.keys(newErrors).length > 0) { setFieldErrors(newErrors); return; }
        setFieldErrors({});
        setError(null);
        setSaving(true);
        const data = {
            invoiceNumber: form.invoiceNumber,
            jobId:         parseInt(form.jobId) || null,
            jobNumber:     form.jobNumber || null,
            quoteId:       parseInt(form.quoteId) || null,
            quoteNumber:   form.quoteNumber || null,
            customerName:  form.customerName,
            status:        form.status,
            subtotal,
            taxRate,
            taxAmount,
            total,
            amountPaid:    existing?.amountPaid ?? 0,
            dueDate:       form.dueDate || null,
            notes:         form.notes || null,
            issuedAt:      existing?.issuedAt ?? null,
            paidAt:        existing?.paidAt ?? null,
        };
        const action = existing
            ? updateInvoice(existing.id, { ...existing, ...data })
            : createInvoice(data);
        action
            .then(() => navigate('/invoices'))
            .catch((err) => setError(`Failed to save invoice: ${getApiErrorMessage(err)}`))
            .finally(() => setSaving(false));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteInvoice(existing.id)
            .then(() => navigate('/invoices'))
            .catch((err) => setError(`Failed to delete invoice: ${getApiErrorMessage(err)}`));
    };

    if (loading) return <Loading />;

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.invoiceNumber}` : 'New Invoice'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/invoices')}
            onDelete={existing ? handleDelete : undefined}
            error={error}
            submitting={saving}
        >
            <div className="form-row">
                <TextField label="Invoice Number" error={fieldErrors.invoiceNumber} name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="INV-006" />
                <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Void">Void</option>
                </SelectField>
            </div>

            {form.quoteNumber ? (
                <ReadOnlyField label="From Quote" value={form.quoteNumber} />
            ) : (
                <SelectField label="Job" name="jobId" value={form.jobId} onChange={handleJobChange}>
                    <option value="">Select job...</option>
                    {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.jobNumber ?? `Job #${j.id}`} — {j.customerName}</option>
                    ))}
                </SelectField>
            )}

            <div className="form-row">
                <TextField label="Subtotal (excl. GST)" type="number" name="subtotal" value={form.subtotal} onChange={handleChange} placeholder="0.00" />
                <TextField label="GST Rate" type="number" name="taxRate" value={form.taxRate} onChange={handleChange} step="0.01" placeholder="0.15" />
                <ReadOnlyField label="Total (incl. GST)" value={formatCurrency(total)} strong />
            </div>

            <TextField label="Pay By Date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />

            <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} />
        </FormWrapper>
    );
};

export default InvoiceFormPage;
