import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotesPageProps } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import { useAppContext } from '../../../context/AppContext';

import './styles.scss';

const statusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
    if (s === 'Accepted') return 'good';
    if (s === 'Declined') return 'error';
    if (s === 'Expired') return 'warn';
    if (s === 'Draft') return 'neutral';
    return 'processing';
};

const QuotesPage: React.FC<QuotesPageProps> = () => {
    const navigate = useNavigate();
    const { quotes } = useAppContext();
    return (
        <PageWrapper title="Quotes" buttonTitle="New Quote" buttonAction={() => navigate('/quotes/new')}>
            <Table
                headers={[
                    { id: 'quoteNumber', title: 'Quote #' },
                    { id: 'customerName', title: 'Customer' },
                    { id: 'createdBy', title: 'Created By', render: (v) => v ?? '—' },
                    { id: 'totalAmount', title: 'Total', render: (v) => v != null ? `$${v.toFixed(2)}` : '—' },
                    { id: 'validUntil', title: 'Valid Until', render: (v) => v ?? '—' },
                    { id: 'status', title: 'Status', render: (v) => <Status content={v} type={statusType(v)} /> },
                ]}
                rows={quotes}
                onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default QuotesPage;
