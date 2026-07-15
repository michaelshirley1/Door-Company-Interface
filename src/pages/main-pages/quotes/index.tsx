import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotesPageProps, Quote } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { FilterBar, FilterSelect, FilterSearch } from '../../../components/filter-bar';
import { useFetch } from '../../../hooks/useFetch';
import { getQuotes } from './api';
import { formatCurrency } from '../../../shared/format';
import { QUOTE_STATUSES } from '../../../shared/constants';

import './styles.scss';

const QuotesPage: React.FC<QuotesPageProps> = () => {
    const navigate = useNavigate();
    const { data: quotes, loading, error } = useFetch(getQuotes, [] as Quote[], 'Failed to load quotes.');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    const results = quotes.filter(q => {
        if (status && q.status !== status) return false;
        if (search) {
            const s = search.toLowerCase();
            if (!(q.quoteNumber?.toLowerCase().includes(s) || q.customerName?.toLowerCase().includes(s))) return false;
        }
        return true;
    });

    return (
        <PageWrapper title="Quotes">
            {loading ? <Loading /> : error ? (
                <ErrorBanner message={error} />
            ) : (
                <>
                    <FilterBar
                        showClear={!!(status || search)}
                        onClear={() => { setStatus(''); setSearch(''); }}
                    >
                        <FilterSelect label="Status" value={status} onChange={setStatus} options={QUOTE_STATUSES} />
                        <FilterSearch label="Search" value={search} onChange={setSearch} placeholder="Quote # or customer" />
                    </FilterBar>
                    <Table<Quote>
                        headers={[
                            { id: 'quoteNumber',  title: 'Quote #' },
                            { id: 'customerName', title: 'Customer' },
                            { id: 'createdBy',    title: 'Created By' },
                            { id: 'totalAmount',  title: 'Total',      render: (v) => formatCurrency(v) },
                            { id: 'validUntil',   title: 'Valid Until' },
                            { id: 'status',       title: 'Status',      render: (v) => <Status content={v} variation="quotes" /> },
                        ]}
                        rows={results}
                        onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                        emptyMessage="No quotes match the selected filters."
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default QuotesPage;
