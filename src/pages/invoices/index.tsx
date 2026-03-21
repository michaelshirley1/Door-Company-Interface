import React from 'react';
import { InvoicesPageProps, Invoice } from './model';

import './styles.scss';

const invoices: Invoice[] = [
    { id: 'INV-001', customer: '', amount: '', status: 'Unpaid', issueDate: '', dueDate: '' },
    { id: 'INV-002', customer: '', amount: '', status: 'Overdue', issueDate: '', dueDate: '' },
    { id: 'INV-003', customer: '', amount: '', status: 'Paid', issueDate: '', dueDate: '' },
    { id: 'INV-004', customer: '', amount: '', status: 'Unpaid', issueDate: '', dueDate: '' },
    { id: 'INV-005', customer: '', amount: '', status: 'Paid', issueDate: '', dueDate: '' },
];

const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    return (
        <div className="invoices-page">
            <div className="page-header">
                <h1>Invoices</h1>
                <button className="btn-primary">New Invoice</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td>{inv.id}</td>
                                <td>{inv.customer}</td>
                                <td>{inv.amount}</td>
                                <td><span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                                <td>{inv.issueDate}</td>
                                <td>{inv.dueDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicesPage;