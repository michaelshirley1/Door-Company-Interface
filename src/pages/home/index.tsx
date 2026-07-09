import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePageProps } from './model';
import { Table } from '../../components/table';
import { Status } from '../../components/status';
import Loading from '../../components/loading';
import { Job } from '../main-pages/jobs/model';
import { Invoice } from '../main-pages/invoices/model';
import { getJobs } from '../main-pages/jobs/api';
import { getInvoices } from '../main-pages/invoices/api';
import { getQuotes } from '../main-pages/quotes/api';
import { formatCurrency } from '../../shared/format';

import './styles.scss';

export const HomePage: React.FC<HomePageProps> = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [quoteCount, setQuoteCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getJobs().then(setJobs),
            getInvoices().then(setInvoices),
            getQuotes().then(q => setQuoteCount(q.length)),
        ]).finally(() => setLoading(false));
    }, []);

    const activeJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
    const activeInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void' && i.status !== 'Draft');

    const summaryCards = [
        { label: 'Active Jobs', value: jobs.length, route: '/jobs' },
        { label: 'Active Quotes', value: quoteCount, route: '/quotes' },
        { label: 'Active Invoices', value: invoices.length, route: '/invoices' },
    ];

    if (loading) return <Loading />;

    return (
        <div className="home-page">
            <div className="summary-cards">
                {summaryCards.map((card) => (
                    <div key={card.label} className="summary-card" onClick={() => navigate(card.route)}>
                        <span className="summary-card-label">{card.label}</span>
                        <span className="summary-card-value">{card.value}</span>
                    </div>
                ))}
            </div>
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
                            { id: 'total', title: 'Total', render: (v) => formatCurrency(v) },
                            { id: 'dueDate', title: 'Due Date', render: (v) => v ?? '—' },
                            { id: 'status', title: 'Status', render: (v) => <Status content={v} variation='invoice' /> },
                        ]}
                        rows={activeInvoices}
                        onRowClick={(row) => navigate(`/invoices/${row.id}/edit`)}
                    />
                </div>
            </div>
        </div>
    );
};
