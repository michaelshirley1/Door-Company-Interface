import React from 'react';
import { QuotesPageProps, Quote } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';

import './styles.scss';

const quotes: Quote[] = [
    { id: 'QTE-001', customer: '', description: '', amount: '', status: 'Draft', date: '' },
    { id: 'QTE-002', customer: '', description: '', amount: '', status: 'Sent', date: '' },
    { id: 'QTE-003', customer: '', description: '', amount: '', status: 'Accepted', date: '' },
    { id: 'QTE-004', customer: '', description: '', amount: '', status: 'Declined', date: '' },
    { id: 'QTE-005', customer: '', description: '', amount: '', status: 'Sent', date: '' },
];

const QuotesPage: React.FC<QuotesPageProps> = () => {
    return (
        <PageWrapper
            title="Quotes" 
            buttonTitle='New Quote'
            buttonAction={()=>{}}
        >
            <Table
                headers={[
                    {id: "id", title: "ID" },
                    {id: "customer", title: "Customer" },
                    {id: "description", title: "Description" },
                    {id: "amount", title: "Amount" },
                    {id: "status", title: "Status" },
                    {id: "date", title: "Date" }
                ]}
                rows={quotes}
            />
        </PageWrapper>
    );
};

export default QuotesPage;