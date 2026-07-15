import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesPageProps, Invoice } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { FilterBar, FilterSelect, FilterSearch } from '../../../components/filter-bar';
import { useFetch } from '../../../hooks/useFetch';
import { getInvoices } from './api';
import { formatCurrency } from '../../../shared/format';
import { INVOICE_STATUSES } from '../../../shared/constants';

import './styles.scss';

const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    const navigate = useNavigate();
    const { data: invoices, loading, error } = useFetch(getInvoices, [] as Invoice[], 'Failed to load invoices.');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    const results = invoices.filter(i => {
        if (status && i.status !== status) return false;
        if (search) {
            const s = search.toLowerCase();
            if (!(i.invoiceNumber?.toLowerCase().includes(s) || i.customerName?.toLowerCase().includes(s))) return false;
        }
        return true;
    });

    return (
        <PageWrapper title="Invoices" buttonTitle="New Invoice" buttonAction={() => navigate('/invoices/new')}>
            <FilterBar
                showClear={!!(status || search)}
                onClear={() => { setStatus(''); setSearch(''); }}
            >
                <FilterSelect label="Status" value={status} onChange={setStatus} options={INVOICE_STATUSES} />
                <FilterSearch label="Search" value={search} onChange={setSearch} placeholder="Invoice # or customer" />
            </FilterBar>
            <Table
                headers={[
                    { id: 'invoiceNumber', title: 'Invoice #' },
                    { id: 'customerName',  title: 'Customer' },
                    { id: 'total',         title: 'Total (incl. GST)', render: (v) => formatCurrency(v) },
                    { id: 'dueDate',       title: 'Pay By' },
                    { id: 'status',        title: 'Status',             render: (v) => <Status content={v} variation="invoice" /> },
                ]}
                rows={results}
                onRowClick={(row) => navigate(`/invoices/${row.id}/edit`)}
                emptyMessage="No invoices match the selected filters."
            />
        </PageWrapper>
    );
};

export default InvoicesPage;
