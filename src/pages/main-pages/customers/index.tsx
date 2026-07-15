import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomersPageProps, Customer } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { FilterBar, FilterSearch } from '../../../components/filter-bar';
import { useFetch } from '../../../hooks/useFetch';
import { getCustomers } from './api';

import './styles.scss';

const CustomersPage: React.FC<CustomersPageProps> = () => {
    const navigate = useNavigate();
    const { data: customers, loading, error } = useFetch(getCustomers, [] as Customer[], 'Failed to load customers.');
    const [search, setSearch] = useState('');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    const results = customers.filter(c => {
        if (!search) return true;
        const s = search.toLowerCase();
        return c.name?.toLowerCase().includes(s) || c.companyName?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
    });

    return (
        <PageWrapper title="Customers" buttonTitle="New Customer" buttonAction={() => navigate('/customers/new')}>
            <FilterBar
                showClear={!!search}
                onClear={() => setSearch('')}
            >
                <FilterSearch label="Search" value={search} onChange={setSearch} placeholder="Name, company, or email" />
            </FilterBar>
            <Table
                headers={[
                    { id: 'name', title: 'Name' },
                    { id: 'companyName', title: 'Company' },
                    { id: 'email', title: 'Email' },
                    { id: 'phone', title: 'Phone' },
                    { id: 'address', title: 'Address' },
                    { id: 'createdAt', title: 'Created' },
                ]}
                rows={results}
                onRowClick={(row) => navigate(`/customers/${row.id}/edit`)}
                emptyMessage="No customers match the selected filters."
            />
        </PageWrapper>
    );
};

export default CustomersPage;
