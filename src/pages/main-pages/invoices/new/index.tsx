import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { useAppContext } from '../../../../context/AppContext';

const InvoiceFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { invoices, jobs, addInvoice, updateInvoice, removeInvoice } = useAppContext();

    const existing = id ? invoices.find(i => i.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        invoiceNumber: existing?.invoiceNumber ?? '',
        jobId:         existing?.jobId?.toString() ?? '',
        jobNumber:     existing?.jobNumber ?? '',
        status:        existing?.status ?? 'Draft',
        subtotal:      existing?.subtotal?.toString() ?? '',
        taxRate:       existing?.taxRate?.toString() ?? '0.15',
        dueDate:       existing?.dueDate ?? '',
        notes:         existing?.notes ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const j = jobs.find(j => j.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, jobId: e.target.value, jobNumber: j?.jobNumber ?? '' }));
    };

    const handleSubmit = () => {
        const subtotal = parseFloat(form.subtotal) || 0;
        const taxRate = parseFloat(form.taxRate) || 0.15;
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
        const data = {
            invoiceNumber: form.invoiceNumber,
            jobId:         parseInt(form.jobId) || 0,
            jobNumber:     form.jobNumber,
            status:        form.status,
            subtotal,
            taxRate,
            taxAmount,
            total:         Math.round((subtotal + taxAmount) * 100) / 100,
            amountPaid:    existing?.amountPaid ?? 0,
            dueDate:       form.dueDate || null,
            notes:         form.notes || null,
            issuedAt:      existing?.issuedAt ?? null,
            paidAt:        existing?.paidAt ?? null,
        };
        existing ? updateInvoice({ ...existing, ...data }) : addInvoice(data);
        navigate('/invoices');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.invoiceNumber}` : 'New Invoice'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/invoices')}
            onDelete={existing ? () => { removeInvoice(existing.id); navigate('/invoices'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Invoice Number</label>
                    <input name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="INV-006" />
                </div>
                <div className="form-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Void">Void</option>
                    </select>
                </div>
            </div>
            <div className="form-field">
                <label>Job</label>
                <select name="jobId" value={form.jobId} onChange={handleJobChange}>
                    <option value="">Select job...</option>
                    {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.jobNumber ?? `Job #${j.id}`} — {j.customerName}</option>
                    ))}
                </select>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Subtotal (excl. GST)</label>
                    <input type="number" name="subtotal" value={form.subtotal} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-field">
                    <label>Tax Rate</label>
                    <input type="number" name="taxRate" value={form.taxRate} onChange={handleChange} step="0.01" placeholder="0.15" />
                </div>
            </div>
            <div className="form-field">
                <label>Due Date</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default InvoiceFormPage;
