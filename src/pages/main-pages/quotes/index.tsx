import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotesPageProps, Quote } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { useFetch } from '../../../hooks/useFetch';
import { getQuotes } from './api';
import { formatCurrency } from '../../../shared/format';

import './styles.scss';

const QuotesPage: React.FC<QuotesPageProps> = () => {
    const navigate = useNavigate();
    const { data: quotes, loading, error } = useFetch(getQuotes, [] as Quote[], 'Failed to load quotes.');

    return (
        <PageWrapper title="Quotes">
            {loading ? <Loading /> : error ? (
                <ErrorBanner message={error} />
            ) : (
                <Table<Quote>
                    headers={[
                        { id: 'quoteNumber',  title: 'Quote #' },
                        { id: 'customerName', title: 'Customer' },
                        { id: 'createdBy',    title: 'Created By' },
                        { id: 'totalAmount',  title: 'Total',      render: (v) => formatCurrency(v) },
                        { id: 'validUntil',   title: 'Valid Until' },
                        { id: 'status',       title: 'Status',      render: (v) => <Status content={v} variation="quotes" /> },
                    ]}
                    rows={quotes}
                    onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                />
            )}
        </PageWrapper>
    );
};

export default QuotesPage;
