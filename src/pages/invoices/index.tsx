import React from 'react';
import { InvoicesPageProps, Invoice } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';
import { headerItem } from '../../components/table/model';

import './styles.scss';

const invoices: Invoice[] = [
    { id: 'INV-001', customer: '', amount: '', status: 'Unpaid', issueDate: '', dueDate: '' },
    { id: 'INV-002', customer: '', amount: '', status: 'Overdue', issueDate: '', dueDate: '' },
    { id: 'INV-003', customer: '', amount: '', status: 'Paid', issueDate: '', dueDate: '' },
    { id: 'INV-004', customer: '', amount: '', status: 'Unpaid', issueDate: '', dueDate: '' },
    { id: 'INV-005', customer: '', amount: '', status: 'Paid', issueDate: '', dueDate: '' },
];

export const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    return (
        <PageWrapper 
            title="Invoices" 
            buttonTitle='New Invoice'
            buttonAction={()=>{}}
        >
            <Table
                headers={[
                    {id: "id", title: "ID" },
                    {id: "customer", title: "Customer" },
                    {id: "amount", title: "Amount" },
                    {id: "status", title: "Status" },
                    {id: "issueData", title: "Issue Date" },
                    {id: "dueDate", title: "Due Date" }
                ]}
                rows={invoices}
            />
        </PageWrapper>
    );
};

export default InvoicesPage;