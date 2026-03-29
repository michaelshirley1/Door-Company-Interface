import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { useAppContext } from '../../../../context/AppContext';

const PurchaseOrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { purchaseOrders, customers, quotes, addPurchaseOrder, updatePurchaseOrder, removePurchaseOrder } = useAppContext();

    const existing = id ? purchaseOrders.find(p => p.id === parseInt(id)) : undefined;

    const [form, setForm] = useState({
        poNumber:         existing?.poNumber ?? '',
        customerId:       existing?.customerId?.toString() ?? '',
        customerName:     existing?.customerName ?? '',
        quoteId:          existing?.quoteId?.toString() ?? '',
        status:           existing?.status ?? 'Received',
        orderDate:        existing?.orderDate ?? '',
        expectedDelivery: existing?.expectedDelivery ?? '',
        totalAmount:      existing?.totalAmount?.toString() ?? '',
        notes:            existing?.notes ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
    };

    const handleSubmit = () => {
        const data = {
            poNumber:         form.poNumber || null,
            customerId:       parseInt(form.customerId) || 0,
            customerName:     form.customerName,
            quoteId:          form.quoteId ? parseInt(form.quoteId) : null,
            status:           form.status,
            orderDate:        form.orderDate,
            expectedDelivery: form.expectedDelivery || null,
            totalAmount:      form.totalAmount ? parseFloat(form.totalAmount) : null,
            notes:            form.notes || null,
        };
        existing ? updatePurchaseOrder({ ...existing, ...data }) : addPurchaseOrder(data);
        navigate('/purchase-orders');
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.poNumber ?? 'Purchase Order'}` : 'New Purchase Order'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/purchase-orders')}
            onDelete={existing ? () => { removePurchaseOrder(existing.id); navigate('/purchase-orders'); } : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>PO Number</label>
                    <input name="poNumber" value={form.poNumber} onChange={handleChange} placeholder="PO-006" />
                </div>
                <div className="form-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Received">Received</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="InProduction">In Production</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
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
                    <label>Linked Quote</label>
                    <select name="quoteId" value={form.quoteId} onChange={handleChange}>
                        <option value="">None</option>
                        {quotes.map(q => (
                            <option key={q.id} value={q.id}>{q.quoteNumber}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Order Date</label>
                    <input type="date" name="orderDate" value={form.orderDate} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>Expected Delivery</label>
                    <input type="date" name="expectedDelivery" value={form.expectedDelivery} onChange={handleChange} />
                </div>
            </div>
            <div className="form-field">
                <label>Total Amount</label>
                <input type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default PurchaseOrderFormPage;
