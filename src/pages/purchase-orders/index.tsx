import React from 'react';
import { PurchaseOrdersPageProps, PurchaseOrder } from './model';

import './styles.scss';

const purchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplier: '', description: '', amount: '', status: 'Ordered', orderDate: '' },
    { id: 'PO-002', supplier: '', description: '', amount: '', status: 'Received', orderDate: '' },
    { id: 'PO-003', supplier: '', description: '', amount: '', status: 'Pending', orderDate: '' },
    { id: 'PO-004', supplier: '', description: '', amount: '', status: 'Ordered', orderDate: '' },
    { id: 'PO-005', supplier: '', description: '', amount: '', status: 'Received', orderDate: '' },
];

const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = () => {
    return (
        <div className="purchase-orders-page">
            <div className="page-header">
                <h1>Purchase Orders</h1>
                <button className="btn-primary">New Purchase Order</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Supplier</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Order Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.map((po) => (
                            <tr key={po.id}>
                                <td>{po.id}</td>
                                <td>{po.supplier}</td>
                                <td>{po.description}</td>
                                <td>{po.amount}</td>
                                <td><span className={`status-badge ${po.status.toLowerCase()}`}>{po.status}</span></td>
                                <td>{po.orderDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchaseOrdersPage;