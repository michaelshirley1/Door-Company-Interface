import React from 'react';
import { InvoicesPageProps, Invoice } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';

import './styles.scss';



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
                rows={[]}
            />
        </PageWrapper>
    );
};

export default InvoicesPage;