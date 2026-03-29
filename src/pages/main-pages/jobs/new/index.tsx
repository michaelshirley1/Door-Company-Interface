import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { useAppContext } from '../../../../context/AppContext';

const JobFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { jobs, customers, addJob, updateJob, removeJob } = useAppContext();

    const existing = id ? jobs.find(j => j.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        jobNumber:     existing?.jobNumber     ?? '',
        customerId:    existing?.customerId?.toString() ?? '',
        customerName:  existing?.customerName  ?? '',
        status:        existing?.status        ?? 'Scheduled',
        siteAddress:   existing?.siteAddress   ?? '',
        assignedTo:    existing?.assignedTo    ?? '',
        scheduledDate: existing?.scheduledDate ?? '',
        completedDate: existing?.completedDate ?? '',
        notes:         existing?.notes         ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
    };

    const handleSubmit = () => {
        const data = {
            jobNumber:      form.jobNumber || null,
            customerId:     parseInt(form.customerId) || 0,
            customerName:   form.customerName,
            status:         form.status,
            siteAddress:    form.siteAddress || null,
            assignedTo:     form.assignedTo || null,
            scheduledDate:  form.scheduledDate || null,
            completedDate:  form.completedDate || null,
            purchaseOrderId: existing?.purchaseOrderId ?? null,
            notes:          form.notes || null,
        };
        existing ? updateJob({ ...existing, ...data }) : addJob(data);
        navigate('/jobs');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.jobNumber ?? 'Job'}` : 'New Job'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/jobs')}
            onDelete={existing ? () => { removeJob(existing.id); navigate('/jobs'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Job Number</label>
                    <input name="jobNumber" value={form.jobNumber} onChange={handleChange} placeholder="JOB-006" />
                </div>
                <div className="form-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Scheduled">Scheduled</option>
                        <option value="InProgress">In Progress</option>
                        <option value="OnHold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
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
                <label>Site Address</label>
                <input name="siteAddress" value={form.siteAddress} onChange={handleChange} placeholder="123 Main St" />
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Assigned To</label>
                    <input name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Staff member" />
                </div>
                <div className="form-field">
                    <label>Scheduled Date</label>
                    <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} />
                </div>
            </div>
            <div className="form-field">
                <label>Completed Date</label>
                <input type="date" name="completedDate" value={form.completedDate} onChange={handleChange} />
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default JobFormPage;
