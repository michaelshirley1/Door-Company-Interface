import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomersPageProps, Customer } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { useFetch } from '../../../hooks/useFetch';
import { getCustomers } from './api';

import './styles.scss';

const CustomersPage: React.FC<CustomersPageProps> = () => {
    const navigate = useNavigate();
    const { data: customers, loading, error } = useFetch(getCustomers, [] as Customer[], 'Failed to load customers.');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    return (
        <PageWrapper title="Customers" buttonTitle="New Customer" buttonAction={() => navigate('/customers/new')}>
            <Table
                headers={[
                    { id: 'name', title: 'Name' },
                    { id: 'companyName', title: 'Company' },
                    { id: 'email', title: 'Email' },
                    { id: 'phone', title: 'Phone' },
                    { id: 'address', title: 'Address' },
                    { id: 'createdAt', title: 'Created' },
                ]}
                rows={customers}
                onRowClick={(row) => navigate(`/customers/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default CustomersPage;
