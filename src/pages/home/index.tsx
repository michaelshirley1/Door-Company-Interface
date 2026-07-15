import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePageProps, KpiCard } from './model';
import { Table } from '../../components/table';
import { Status } from '../../components/status';
import Loading from '../../components/loading';
import { SalesChart } from './sales-chart';
import { Job } from '../main-pages/jobs/model';
import { Invoice } from '../main-pages/invoices/model';
import { Quote } from '../main-pages/quotes/model';
import { PurchaseOrder } from '../main-pages/orders/model';
import { getJobs } from '../main-pages/jobs/api';
import { getInvoices } from '../main-pages/invoices/api';
import { getQuotes } from '../main-pages/quotes/api';
import { getOrders } from '../main-pages/orders/api';
import { formatCurrency, formatCompactCurrency } from '../../shared/format';
import { monthlyRevenue, revenueThisMonth, outstandingTotal, openQuoteCount, openOrderCount } from './insights';

import './styles.scss';

export const HomePage: React.FC<HomePageProps> = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getJobs().then(setJobs),
            getInvoices().then(setInvoices),
            getQuotes().then(setQuotes),
            getOrders().then(setOrders),
        ]).finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading />;

    const activeJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
    const activeInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void' && i.status !== 'Draft');

    const revenuePoints = monthlyRevenue(invoices, 6);
    const { current: revenueMonth, deltaPct } = revenueThisMonth(revenuePoints);
    const outstanding = outstandingTotal(invoices);

    const kpiCards: KpiCard[] = [
        {
            label: 'Revenue this month',
            value: formatCompactCurrency(revenueMonth),
            route: '/invoices',
            deltaPct,
        },
        {
            label: 'Outstanding',
            value: formatCompactCurrency(outstanding.total),
            route: '/invoices',
            subtitle: outstanding.overdueCount > 0 ? `${outstanding.overdueCount} overdue` : 'All current',
            subtitleTone: outstanding.overdueCount > 0 ? 'critical' : 'neutral',
        },
        { label: 'Active Jobs', value: String(activeJobs.length), route: '/jobs' },
        { label: 'Open Quotes', value: String(openQuoteCount(quotes)), route: '/quotes', subtitle: 'Awaiting response' },
        { label: 'Open Purchase Orders', value: String(openOrderCount(orders)), route: '/orders' },
    ];

    return (
        <div className="home-page">
            <div className="kpi-row">
                {kpiCards.map(card => (
                    <div key={card.label} className="kpi-card" onClick={() => navigate(card.route)}>
                        <span className="kpi-card-label">{card.label}</span>
                        <span className="kpi-card-value">{card.value}</span>
                        {card.deltaPct != null && (
                            <span className={`kpi-card-delta ${card.deltaPct >= 0 ? 'up' : 'down'}`}>
                                {card.deltaPct >= 0 ? '▲' : '▼'} {Math.abs(card.deltaPct).toFixed(0)}% vs last month
                            </span>
                        )}
                        {card.subtitle && (
                            <span className={`kpi-card-subtitle ${card.subtitleTone === 'critical' ? 'critical' : ''}`}>
                                {card.subtitle}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <SalesChart data={revenuePoints} />

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
                        emptyMessage="No active jobs."
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
                        emptyMessage="No active invoices."
                    />
                </div>
            </div>
        </div>
    );
};
