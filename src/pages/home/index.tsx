import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePageProps } from './model';
import { Table } from '../../components/table';
import { Status } from '../../components/status';
import { useAppContext } from '../../context/AppContext';

import './styles.scss';

export const HomePage: React.FC<HomePageProps> = () => {
    const navigate = useNavigate();
    const { jobs, quotes, invoices } = useAppContext();

    const activeJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
    const activeInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void' && i.status !== 'Draft');

    const summaryCards = [
        { label: 'Active Jobs', value: jobs.length, route: '/jobs' },
        { label: 'Active Quotes', value: quotes.length, route: '/quotes' },
        { label: 'Active Invoices', value: invoices.length, route: '/invoices' },
    ];

    return (
        <div className="home-page">
            <div className="home-tables">
                <div className="home-table-section">
                    <h2>Active Jobs</h2>
                    <Table
                        headers={[
                            { id: 'jobNumber', title: 'Job #' },
                            { id: 'customerName', title: 'Customer' },
                            { id: 'siteAddress', title: 'Site Address', render: (v) => v ?? '—' },
                            { id: 'scheduledDate', title: 'Scheduled', render: (v) => v ?? '—' },
                            { id: 'status', title: 'Status', render: (v) => <Status content={v} variation='job' /> },
                        ]}
                        rows={activeJobs}
                        onRowClick={(row) => navigate(`/jobs/${row.id}/edit`)}
                    />
                </div>

                <div className="home-table-section">
                    <h2>Active Invoices</h2>
                    <Table
                        headers={[
                            { id: 'invoiceNumber', title: 'Invoice #' },
                            { id: 'jobNumber', title: 'Job' },
                            { id: 'total', title: 'Total', render: (v) => `$${v.toFixed(2)}` },
                            { id: 'dueDate', title: 'Due Date', render: (v) => v ?? '—' },
                            { id: 'status', title: 'Status', render: (v) => <Status content={v} variation='invoice' /> },
                        ]}
                        rows={activeInvoices}
                        onRowClick={(row) => navigate(`/invoices/${row.id}/edit`)}
                    />
                </div>
            </div>

            <div className="summary-cards">
                {summaryCards.map((card) => (
                    <div key={card.label} className="summary-card" onClick={() => navigate(card.route)}>
                        <span className="summary-card-label">{card.label}</span>
                        <span className="summary-card-value">{card.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
