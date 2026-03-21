import React from 'react';
import { HomePageProps, SummaryCard, ActiveJob, ActiveInvoice } from './model';
import { useNavigate } from 'react-router-dom';

import './styles.scss';

const summaryCards: SummaryCard[] = [
    { label: 'Jobs', value: 0, route: '/job' },
    { label: 'Invoices', value: 0, route: '/invoice' },
    { label: 'Purchase Orders', value: 0, route: '/purchase-order' },
    { label: 'Quotes', value: 0, route: '/quote' },
];

const activeJobs: ActiveJob[] = [
    { id: 'JOB-001', customer: '', description: '', status: 'In Progress', dueDate: '' },
    { id: 'JOB-002', customer: '', description: '', status: 'In Progress', dueDate: '' },
    { id: 'JOB-003', customer: '', description: '', status: 'Pending', dueDate: '' },
];

const activeInvoices: ActiveInvoice[] = [
    { id: 'INV-001', customer: '', amount: '', status: 'Unpaid', dueDate: '' },
    { id: 'INV-002', customer: '', amount: '', status: 'Overdue', dueDate: '' },
    { id: 'INV-003', customer: '', amount: '', status: 'Unpaid', dueDate: '' },
];

const HomePage: React.FC<HomePageProps> = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <h1>Dashboard</h1>

            <div className="summary-cards">
                {summaryCards.map((card) => (
                    <div
                        key={card.label}
                        className="summary-card"
                        onClick={() => navigate(card.route)}
                    >
                        <span className="summary-card-label">{card.label}</span>
                        <span className="summary-card-value">{card.value}</span>
                    </div>
                ))}
            </div>

            <div className="home-tables">
                <div className="home-table-section">
                    <h2>Active Jobs</h2>
                    <table className="home-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeJobs.map((job) => (
                                <tr key={job.id}>
                                    <td>{job.id}</td>
                                    <td>{job.customer}</td>
                                    <td>{job.description}</td>
                                    <td><span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</span></td>
                                    <td>{job.dueDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="home-table-section">
                    <h2>Active Invoices</h2>
                    <table className="home-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeInvoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td>{inv.id}</td>
                                    <td>{inv.customer}</td>
                                    <td>{inv.amount}</td>
                                    <td><span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                                    <td>{inv.dueDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HomePage;