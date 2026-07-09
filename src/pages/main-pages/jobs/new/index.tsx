import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { FormField, TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { Table } from '../../../../components/table';
import Loading from '../../../../components/loading';
import { Job } from '../model';
import { getJob, createJob, updateJob, deleteJob, getJobs } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';
import { Quote } from '../../quotes/model';
import { createQuote, getQuotes } from '../../quotes/api';
import { PurchaseOrder } from '../../orders/model';
import { getOrders } from '../../orders/api';
import { Invoice } from '../../invoices/model';
import { getInvoices } from '../../invoices/api';
import { Status } from '../../../../components/status';
import Button from '../../../../components/button';
import ReadOnlyField from '../../../../components/read-only-field';
import { formatCurrency, todayISO } from '../../../../shared/format';
import { getApiErrorMessage } from '../../../../api/errors';
import '../../../../components/loading/styles.scss';

const JobFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Job | undefined>();
    const [jobQuotes, setJobQuotes] = useState<Quote[]>([]);
    const [jobOrders, setJobOrders] = useState<PurchaseOrder[]>([]);
    const [jobInvoices, setJobInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [addNote, setAddNote] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addingQuote, setAddingQuote] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        jobNumber:     '',
        customerId:    '',
        customerName:  '',
        status:        'Scheduled',
        siteAddress:   '',
        assignedTo:    '',
        scheduledDate: '',
        completedDate: '',
        notes:         '',
    });

    useEffect(() => {
        const numId = id ? parseInt(id) : null;

        const lookups = [
            getCustomers().then(setCustomers),
        ];

        const specific = numId
            ? [
                getQuotes().then(all => setJobQuotes(all.filter(q => q.jobId === numId))),
                getOrders().then(all => setJobOrders(all.filter(o => o.jobId === numId))),
                getInvoices().then(all => setJobInvoices(all.filter(i => i.jobId === numId))),
                getJob(numId).then(job => {
                    setExisting(job);
                    setForm({
                        jobNumber:     job.jobNumber ?? '',
                        customerId:    job.customerId?.toString() ?? '',
                        customerName:  job.customerName  ?? '',
                        status:        job.status        ?? 'Scheduled',
                        siteAddress:   job.siteAddress   ?? '',
                        assignedTo:    job.assignedTo    ?? '',
                        scheduledDate: job.scheduledDate ?? '',
                        completedDate: job.completedDate ?? '',
                        notes:         job.notes         ?? '',
                    });
                    if (job.notes) setAddNote(true);
                }),
              ]
            : [
                getJobs().then(jobs => {
                    const max = jobs.reduce((acc, j) => {
                        const n = parseInt((j.jobNumber ?? '').replace(/\D/g, '')) || 0;
                        return n > acc ? n : acc;
                    }, 0);
                    setForm(prev => ({ ...prev, jobNumber: `JOB-${String(max + 1).padStart(3, '0')}` }));
                }),
              ];

        Promise.all([...lookups, ...specific])
            .catch(() => setError('Failed to load data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'status' && value === 'Completed' && !prev.completedDate) {
                next.completedDate = todayISO();
            }
            return next;
        });
        if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
        if (fieldErrors.customerId) setFieldErrors(prev => { const n = { ...prev }; delete n.customerId; return n; });
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};
        if (!form.customerId) newErrors.customerId = 'Customer is required';
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});
        setError(null);
        setSaving(true);
        const data = {
            jobNumber:       form.jobNumber || null,
            customerId:      parseInt(form.customerId) || 0,
            customerName:    form.customerName,
            status:          form.status,
            siteAddress:     form.siteAddress     || null,
            assignedTo:      form.assignedTo      || null,
            scheduledDate:   form.scheduledDate   || null,
            completedDate:   form.completedDate   || null,
            purchaseOrderId: existing?.purchaseOrderId ?? null,
            notes:           form.notes            || null,
            items:           [],
        };
        const action = existing
            ? updateJob(existing.id, { ...existing, ...data })
            : createJob(data);
        action
            .then(() => navigate('/jobs'))
            .catch((err) => setError(`Failed to save job: ${getApiErrorMessage(err)}`))
            .finally(() => setSaving(false));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteJob(existing.id)
            .then(() => navigate('/jobs'))
            .catch(() => setError('Failed to delete job. Please try again.'));
    };

    const handleAddQuote = async () => {
        setError(null);
        setAddingQuote(true);

        let job = existing;

        if (!job) {
            if (!form.customerId) {
                setFieldErrors({ customerId: 'Customer is required' });
                setAddingQuote(false);
                return;
            }
            try {
                job = await createJob({
                    jobNumber:       form.jobNumber || null,
                    customerId:      parseInt(form.customerId) || 0,
                    customerName:    form.customerName,
                    status:          form.status,
                    siteAddress:     form.siteAddress   || null,
                    assignedTo:      form.assignedTo    || null,
                    scheduledDate:   form.scheduledDate || null,
                    completedDate:   form.completedDate || null,
                    purchaseOrderId: null,
                    notes:           form.notes         || null,
                    items:           [],
                });
                setExisting(job);
            } catch (err) {
                setError(`Failed to save job: ${getApiErrorMessage(err)}`);
                setAddingQuote(false);
                return;
            }
        }

        try {
            const quoteCount = jobQuotes.length + 1;
            const quote = await createQuote({
                quoteNumber:  `QTE-${job.jobNumber ?? job.id}-${quoteCount}`,
                customerId:   job.customerId,
                customerName: job.customerName,
                status:       'Draft',
                totalAmount:  null,
                validUntil:   null,
                createdBy:    null,
                notes:        null,
                siteAddress:  form.siteAddress || null,
                jobId:        job.id,
                jobNumber:    job.jobNumber || null,
                items:        [],
            });
            navigate(`/quotes/${quote.id}/edit`);
        } catch (err) {
            setError(`Failed to create quote: ${getApiErrorMessage(err)}`);
            setAddingQuote(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <>
        {addingQuote && (
            <div className="loading-overlay">
                <div className="loading-spinner" />
            </div>
        )}
        <FormWrapper
            title={existing ? `Job ${existing.jobNumber ?? existing.id}` : 'New Job'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/jobs')}
            onDelete={existing ? handleDelete : undefined}
            error={error}
            submitting={saving}
        >
            <div className="form-row">
                <ReadOnlyField label="Job Number" value={form.jobNumber} />
                <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="InProgress">In Progress</option>
                    <option value="OnHold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </SelectField>
                <SelectField label="Customer" error={fieldErrors.customerId} name="customerId" value={form.customerId} onChange={handleCustomerChange}>
                    <option value="">Select customer...</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName ?? c.name}</option>
                    ))}
                </SelectField>
            </div>
            <TextField label="Site Address" name="siteAddress" value={form.siteAddress} onChange={handleChange} placeholder="123 Main St" />
            <div className="form-row">
                <TextField label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Staff member" />
                <TextField label="Scheduled Date" type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} />
            </div>

            {addNote ? (
                <>
                    <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} />
                    <Button variant="secondary" onClick={() => { setAddNote(false); setForm(prev => ({ ...prev, notes: '' })); }}>
                        Remove Note
                    </Button>
                </>
            ) : (
                <Button variant="secondary" onClick={() => setAddNote(true)}>Add Note</Button>
            )}

            <FormField label="Quotes">
                <Table<Quote>
                    headers={[
                        { id: 'quoteNumber', title: 'Quote #' },
                        { id: 'createdBy',   title: 'Created By' },
                        { id: 'totalAmount', title: 'Total (excl. GST)', render: (v) => formatCurrency(v) },
                        { id: 'validUntil',  title: 'Valid Until' },
                        { id: 'status',      title: 'Status',             render: (v) => <Status content={v} variation="quotes" /> },
                    ]}
                    rows={jobQuotes}
                    onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                    onAddClick={addingQuote ? undefined : handleAddQuote}
                />
            </FormField>

            {jobOrders.length > 0 && (
                <FormField label="Orders">
                    <Table<PurchaseOrder>
                        headers={[
                            { id: 'poNumber',         title: 'PO #' },
                            { id: 'totalAmount',      title: 'Total (excl. GST)', render: (v) => formatCurrency(v) },
                            { id: 'expectedDelivery', title: 'Expected Delivery' },
                            { id: 'status',           title: 'Status',            render: (v) => <Status content={v} variation="order" /> },
                        ]}
                        rows={jobOrders}
                        onRowClick={(row) => navigate(`/orders/${row.id}/edit`)}
                    />
                </FormField>
            )}

            {jobInvoices.length > 0 && (
                <FormField label="Invoices">
                    <Table<Invoice>
                        headers={[
                            { id: 'invoiceNumber', title: 'Invoice #' },
                            { id: 'total',         title: 'Total (incl. GST)', render: (v) => formatCurrency(v) },
                            { id: 'dueDate',       title: 'Pay By' },
                            { id: 'status',        title: 'Status',            render: (v) => <Status content={v} variation="invoice" /> },
                        ]}
                        rows={jobInvoices}
                        onRowClick={(row) => navigate(`/invoices/${row.id}/edit`)}
                    />
                </FormField>
            )}
        </FormWrapper>
        </>
    );
};

export default JobFormPage;
