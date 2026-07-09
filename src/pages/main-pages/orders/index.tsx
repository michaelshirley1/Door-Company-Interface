import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdersPageProps, PurchaseOrder } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { useFetch } from '../../../hooks/useFetch';
import { getOrders } from './api';
import { formatCurrency } from '../../../shared/format';

const OrdersPage: React.FC<OrdersPageProps> = () => {
    const navigate = useNavigate();
    const { data: orders, loading, error } = useFetch(getOrders, [] as PurchaseOrder[], 'Failed to load orders.');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    return (
        <PageWrapper title="Orders" buttonTitle="" buttonAction={() => {}}>
            <Table
                headers={[
                    { id: 'poNumber',          title: 'PO #' },
                    { id: 'customerName',       title: 'Customer' },
                    { id: 'jobNumber',          title: 'Job #' },
                    { id: 'totalAmount',        title: 'Total (excl. GST)', render: (v) => formatCurrency(v) },
                    { id: 'expectedDelivery',   title: 'Expected Delivery' },
                    { id: 'status',             title: 'Status',            render: (v) => <Status content={v} variation="order" /> },
                ]}
                rows={orders}
                onRowClick={(row) => navigate(`/orders/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default OrdersPage;
