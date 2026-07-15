import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { TextField, TextAreaField } from '../../../../components/form-field';
import Loading from '../../../../components/loading';
import { Customer } from '../model';
import { getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../api';
import { todayISO } from '../../../../shared/format';
import { getApiErrorMessage } from '../../../../api/errors';
import { DEFAULT_MARGIN_PERCENT } from '../../../../shared/constants';
import { useAuth } from '../../../../auth/AuthContext';

const CustomerFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Customer | undefined>();
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        name:        '',
        companyName: '',
        email:       '',
        phone:       '',
        address:     '',
        notes:       '',
        marginPercent: '',
    });

    useEffect(() => {
        if (!id) return;
        getCustomer(parseInt(id))
            .then(customer => {
                setExisting(customer);
                setForm({
                    name:        customer.name        ?? '',
                    companyName: customer.companyName ?? '',
                    email:       customer.email       ?? '',
                    phone:       customer.phone       ?? '',
                    address:     customer.address     ?? '',
                    notes:       customer.notes       ?? '',
                    marginPercent: customer.marginPercent?.toString() ?? '',
                });
            })
            .catch(() => setError('Failed to load customer.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (Object.keys(newErrors).length > 0) { setFieldErrors(newErrors); return; }
        setFieldErrors({});
        setError(null);
        setSaving(true);

        const data = {
            name:        form.name,
            companyName: form.companyName || null,
            email:       form.email       || null,
            phone:       form.phone       || null,
            address:     form.address     || null,
            notes:       form.notes       || null,
            marginPercent: form.marginPercent ? parseFloat(form.marginPercent) : null,
            createdAt:   existing?.createdAt ?? todayISO(),
        };
        const action = existing
            ? updateCustomer(existing.id, { ...existing, ...data })
            : createCustomer(data);
        action
            .then(() => navigate('/customers'))
            .catch((err) => setError(`Failed to save customer: ${getApiErrorMessage(err)}`))
            .finally(() => setSaving(false));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteCustomer(existing.id)
            .then(() => navigate('/customers'))
            .catch((err) => setError(`Failed to delete customer: ${getApiErrorMessage(err)}`));
    };

    if (loading) return <Loading />;

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Customer'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/customers')}
            onDelete={existing && isAdmin ? handleDelete : undefined}
            error={error}
            submitting={saving}
        >
            <div className="form-row">
                <TextField label="Name" error={fieldErrors.name} name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                <TextField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="form-row">
                <TextField label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="021 000 0000" />
            </div>
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} placeholder="123 Street, City" />
            {isAdmin && (
                <TextField label="Default Margin %" type="number" name="marginPercent" value={form.marginPercent} onChange={handleChange} placeholder={`${DEFAULT_MARGIN_PERCENT} (default)`} />
            )}
            <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} />
        </FormWrapper>
    );
};

export default CustomerFormPage;
