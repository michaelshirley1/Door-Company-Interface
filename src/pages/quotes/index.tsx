import React from 'react';
import { QuotesPageProps, Quote } from './model';

import './styles.scss';

const quotes: Quote[] = [
    { id: 'QTE-001', customer: '', description: '', amount: '', status: 'Draft', date: '' },
    { id: 'QTE-002', customer: '', description: '', amount: '', status: 'Sent', date: '' },
    { id: 'QTE-003', customer: '', description: '', amount: '', status: 'Accepted', date: '' },
    { id: 'QTE-004', customer: '', description: '', amount: '', status: 'Declined', date: '' },
    { id: 'QTE-005', customer: '', description: '', amount: '', status: 'Sent', date: '' },
];

const QuotesPage: React.FC<QuotesPageProps> = () => {
    return (
        <div className="quotes-page">
            <div className="page-header">
                <h1>Quotes</h1>
                <button className="btn-primary">New Quote</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => (
                            <tr key={quote.id}>
                                <td>{quote.id}</td>
                                <td>{quote.customer}</td>
                                <td>{quote.description}</td>
                                <td>{quote.amount}</td>
                                <td><span className={`status-badge ${quote.status.toLowerCase()}`}>{quote.status}</span></td>
                                <td>{quote.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotesPage;