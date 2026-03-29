import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomersPageProps } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { useAppContext } from '../../../context/AppContext';

import './styles.scss';

const CustomersPage: React.FC<CustomersPageProps> = () => {
    const navigate = useNavigate();
    const { customers } = useAppContext();
    
    return (
        <PageWrapper title="Customers" buttonTitle="New Customer" buttonAction={() => navigate('/customers/new')}>
            <Table
                headers={[
                    { id: 'name', title: 'Name' },
                    { id: 'companyName', title: 'Company', render: (v) => v ?? '—' },
                    { id: 'email', title: 'Email', render: (v) => v ?? '—' },
                    { id: 'phone', title: 'Phone', render: (v) => v ?? '—' },
                    { id: 'address', title: 'Address', render: (v) => v ?? '—' },
                    { id: 'createdAt', title: 'Created' },
                ]}
                rows={customers}
                onRowClick={(row) => navigate(`/customers/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default CustomersPage;
