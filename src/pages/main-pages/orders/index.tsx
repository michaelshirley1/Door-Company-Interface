import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdersPageProps, PurchaseOrder } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { FilterBar, FilterSelect, FilterSearch } from '../../../components/filter-bar';
import { useFetch } from '../../../hooks/useFetch';
import { getOrders } from './api';
import { formatCurrency } from '../../../shared/format';
import { ORDER_STATUSES } from '../../../shared/constants';

const OrdersPage: React.FC<OrdersPageProps> = () => {
    const navigate = useNavigate();
    const { data: orders, loading, error } = useFetch(getOrders, [] as PurchaseOrder[], 'Failed to load orders.');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    const results = orders.filter(o => {
        if (status && o.status !== status) return false;
        if (search) {
            const s = search.toLowerCase();
            if (!(o.poNumber?.toLowerCase().includes(s) || o.customerName?.toLowerCase().includes(s))) return false;
        }
        return true;
    });

    return (
        <PageWrapper title="Orders" buttonTitle="" buttonAction={() => {}}>
            <FilterBar
                showClear={!!(status || search)}
                onClear={() => { setStatus(''); setSearch(''); }}
            >
                <FilterSelect label="Status" value={status} onChange={setStatus} options={ORDER_STATUSES} />
                <FilterSearch label="Search" value={search} onChange={setSearch} placeholder="PO # or customer" />
            </FilterBar>
            <Table
                headers={[
                    { id: 'poNumber',          title: 'PO #' },
                    { id: 'customerName',       title: 'Customer' },
                    { id: 'jobNumber',          title: 'Job #' },
                    { id: 'totalAmount',        title: 'Total (excl. GST)', render: (v) => formatCurrency(v) },
                    { id: 'expectedDelivery',   title: 'Expected Delivery' },
                    { id: 'status',             title: 'Status',            render: (v) => <Status content={v} variation="order" /> },
                ]}
                rows={results}
                onRowClick={(row) => navigate(`/orders/${row.id}/edit`)}
                emptyMessage="No orders match the selected filters."
            />
        </PageWrapper>
    );
};

export default OrdersPage;
