import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../components/form-wrapper';
import { useAppContext } from '../../../context/AppContext';

const DoorTypeFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { doorTypes, addDoorType, updateDoorType, removeDoorType } = useAppContext();

    const existing = id ? doorTypes.find(d => d.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        name:        existing?.name        ?? '',
        material:    existing?.material    ?? '',
        description: existing?.description ?? '',
        isActive:    existing !== undefined ? String(existing.isActive) : 'true',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = () => {
        const data = {
            name:        form.name,
            material:    form.material || null,
            description: form.description || null,
            isActive:    form.isActive === 'true',
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        existing ? updateDoorType({ ...existing, ...data }) : addDoorType(data);
        navigate('/door-types');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Door Type'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/door-types')}
            onDelete={existing ? () => { removeDoorType(existing.id); navigate('/door-types'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Solid Timber" />
                </div>
                <div className="form-field">
                    <label>Material</label>
                    <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. Timber, Steel, Aluminium" />
                </div>
            </div>
            <div className="form-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="form-field">
                <label>Active</label>
                <select name="isActive" value={form.isActive} onChange={handleChange}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
        </FormWrapper>
    );
};

export default DoorTypeFormPage;
