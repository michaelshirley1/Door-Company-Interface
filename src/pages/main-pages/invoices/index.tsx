import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesPageProps, Invoice } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { useFetch } from '../../../hooks/useFetch';
import { getInvoices } from './api';
import { formatCurrency } from '../../../shared/format';

import './styles.scss';

const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    const navigate = useNavigate();
    const { data: invoices, loading, error } = useFetch(getInvoices, [] as Invoice[], 'Failed to load invoices.');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    return (
        <PageWrapper title="Invoices" buttonTitle="New Invoice" buttonAction={() => navigate('/invoices/new')}>
            <Table
                headers={[
                    { id: 'invoiceNumber', title: 'Invoice #' },
                    { id: 'customerName',  title: 'Customer' },
                    { id: 'total',         title: 'Total (incl. GST)', render: (v) => formatCurrency(v) },
                    { id: 'dueDate',       title: 'Pay By' },
                    { id: 'status',        title: 'Status',             render: (v) => <Status content={v} variation="invoice" /> },
                ]}
                rows={invoices}
                onRowClick={(row) => navigate(`/invoices/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default InvoicesPage;
