import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { useAppContext } from '../../../../context/AppContext';

const QuoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { quotes, customers, addQuote, updateQuote, removeQuote } = useAppContext();

    const existing = id ? quotes.find(q => q.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        quoteNumber:  existing?.quoteNumber  ?? '',
        customerId:   existing?.customerId?.toString() ?? '',
        customerName: existing?.customerName ?? '',
        status:       existing?.status       ?? 'Draft',
        totalAmount:  existing?.totalAmount?.toString() ?? '',
        validUntil:   existing?.validUntil   ?? '',
        createdBy:    existing?.createdBy    ?? '',
        notes:        existing?.notes        ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
    };

    const handleSubmit = () => {
        const data = {
            quoteNumber:  form.quoteNumber,
            customerId:   parseInt(form.customerId) || 0,
            customerName: form.customerName,
            status:       form.status,
            totalAmount:  form.totalAmount ? parseFloat(form.totalAmount) : null,
            validUntil:   form.validUntil || null,
            createdBy:    form.createdBy || null,
            notes:        form.notes || null,
        };
        existing ? updateQuote({ ...existing, ...data }) : addQuote(data);
        navigate('/quotes');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.quoteNumber}` : 'New Quote'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/quotes')}
            onDelete={existing ? () => { removeQuote(existing.id); navigate('/quotes'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Quote Number</label>
                    <input name="quoteNumber" value={form.quoteNumber} onChange={handleChange} placeholder="QTE-006" />
                </div>
                <div className="form-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Customer</label>
                    <select name="customerId" value={form.customerId} onChange={handleCustomerChange}>
                        <option value="">Select customer...</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.companyName ?? c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Created By</label>
                    <input name="createdBy" value={form.createdBy} onChange={handleChange} placeholder="Staff member" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Total Amount</label>
                    <input type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-field">
                    <label>Valid Until</label>
                    <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} />
                </div>
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default QuoteFormPage;
