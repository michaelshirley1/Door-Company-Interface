import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PurchaseOrdersPageProps } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import { useAppContext } from '../../../context/AppContext';

import './styles.scss';

const statusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
    if (s === 'Delivered' || s === 'Ready') return 'good';
    if (s === 'Cancelled') return 'error';
    return 'processing';
};

const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = () => {
    const navigate = useNavigate();
    const { purchaseOrders } = useAppContext();
    
    return (
        <PageWrapper title="Purchase Orders" buttonTitle="New Purchase Order" buttonAction={() => navigate('/purchase-orders/new')}>
            <Table
                headers={[
                    { id: 'poNumber', title: 'PO #' },
                    { id: 'customerName', title: 'Customer' },
                    { id: 'orderDate', title: 'Order Date' },
                    { id: 'expectedDelivery', title: 'Expected Delivery', render: (v) => v ?? '—' },
                    { id: 'totalAmount', title: 'Total', render: (v) => v != null ? `$${v.toFixed(2)}` : '—' },
                    { id: 'status', title: 'Status', render: (v) => <Status content={v} type={statusType(v)} /> },
                ]}
                rows={purchaseOrders}
                onRowClick={(row) => navigate(`/purchase-orders/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default PurchaseOrdersPage;
