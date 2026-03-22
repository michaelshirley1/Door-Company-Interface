import React from 'react';
import { PurchaseOrdersPageProps, PurchaseOrder } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';

import './styles.scss';

const purchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplier: '', description: '', amount: '', status: 'Ordered', orderDate: '' },
    { id: 'PO-002', supplier: '', description: '', amount: '', status: 'Received', orderDate: '' },
    { id: 'PO-003', supplier: '', description: '', amount: '', status: 'Pending', orderDate: '' },
    { id: 'PO-004', supplier: '', description: '', amount: '', status: 'Ordered', orderDate: '' },
    { id: 'PO-005', supplier: '', description: '', amount: '', status: 'Received', orderDate: '' },
];

const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = () => {
    return (
        <PageWrapper
            title="Purchase Orders" 
            buttonTitle='New Purchase Order'
            buttonAction={()=>{}}
        >
            <Table
                headers={[
                    {id: "id", title: "ID" },
                    {id: "supplier", title: "Supplier" },
                    {id: "description", title: "Description" },
                    {id: "amount", title: "Amount" },
                    {id: "status", title: "Status" },
                    {id: "orderDate", title: "Order Date" }
                ]}
                rows={purchaseOrders}
            />
        </PageWrapper>
    );
};

export default PurchaseOrdersPage;