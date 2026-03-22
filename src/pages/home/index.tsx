import React from 'react';
import { HomePageProps, SummaryCard, ActiveJob, ActiveInvoice } from './model';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/table';

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

export const HomePage: React.FC<HomePageProps> = () => {
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
                    <Table
                        className="active-jobs"
                        headers={[
                            {id: "id", title: "ID" },
                            {id: "customer", title: "Customer" },
                            {id: "description", title: "Description" },
                            {id: "status", title: "Status" },
                            {id: "startDate", title: "Start Date" },
                            {id: "dueDate", title: "Due Date" }
                        ]}
                        rows={activeJobs}
                    />
                </div>

                <div className="home-table-section">
                    <h2>Active Invoices</h2>
                    <Table
                        className="active-invoices"
                        headers={[
                            {id: "id", title: "ID" },
                            {id: "customer", title: "Customer" },
                            {id: "amount", title: "Amount" },
                            {id: "status", title: "Status" },
                            {id: "issueData", title: "Issue Date" },
                            {id: "dueDate", title: "Due Date" }
                        ]}
                        rows={activeInvoices}
                    />
                </div>
            </div>
        </div>
    );
};