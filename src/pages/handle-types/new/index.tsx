import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../components/form-wrapper';
import { useAppContext } from '../../../context/AppContext';

const HandleTypeFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { handleTypes, addHandleType, updateHandleType, removeHandleType } = useAppContext();

    const existing = id ? handleTypes.find(h => h.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        name:        existing?.name        ?? '',
        finish:      existing?.finish      ?? '',
        mechanism:   existing?.mechanism   ?? '',
        description: existing?.description ?? '',
        isActive:    existing !== undefined ? String(existing.isActive) : 'true',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = () => {
        const data = {
            name:        form.name,
            finish:      form.finish || null,
            mechanism:   form.mechanism || null,
            description: form.description || null,
            isActive:    form.isActive === 'true',
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        existing ? updateHandleType({ ...existing, ...data }) : addHandleType(data);
        navigate('/handle-types');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Handle Type'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/handle-types')}
            onDelete={existing ? () => { removeHandleType(existing.id); navigate('/handle-types'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Lever Handle" />
                </div>
                <div className="form-field">
                    <label>Finish</label>
                    <input name="finish" value={form.finish} onChange={handleChange} placeholder="e.g. Satin Stainless" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Mechanism</label>
                    <input name="mechanism" value={form.mechanism} onChange={handleChange} placeholder="e.g. Latch, Deadbolt, Passage" />
                </div>
                <div className="form-field">
                    <label>Active</label>
                    <select name="isActive" value={form.isActive} onChange={handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="form-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default HandleTypeFormPage;
