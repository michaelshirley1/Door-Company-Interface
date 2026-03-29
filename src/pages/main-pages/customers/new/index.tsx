import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { useAppContext } from '../../../../context/AppContext';

const CustomerFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { customers, addCustomer, updateCustomer, removeCustomer } = useAppContext();

    const existing = id ? customers.find(c => c.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        name:        existing?.name        ?? '',
        companyName: existing?.companyName ?? '',
        email:       existing?.email       ?? '',
        phone:       existing?.phone       ?? '',
        address:     existing?.address     ?? '',
        notes:       existing?.notes       ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = () => {
        const data = {
            name:        form.name,
            companyName: form.companyName || null,
            email:       form.email || null,
            phone:       form.phone || null,
            address:     form.address || null,
            notes:       form.notes || null,
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        existing ? updateCustomer({ ...existing, ...data }) : addCustomer(data);
        navigate('/customers');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Customer'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/customers')}
            onDelete={existing ? () => { removeCustomer(existing.id); navigate('/customers'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                </div>
                <div className="form-field">
                    <label>Company Name</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Optional" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <div className="form-field">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="021 000 0000" />
                </div>
            </div>
            <div className="form-field">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123 Street, City" />
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default CustomerFormPage;
