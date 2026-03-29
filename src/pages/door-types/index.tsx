import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorTypesPageProps } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';
import { Status } from '../../components/status';
import { useAppContext } from '../../context/AppContext';

import './styles.scss';

const DoorTypesPage: React.FC<DoorTypesPageProps> = () => {
    const navigate = useNavigate();
    const { doorTypes } = useAppContext();
    return (
        <PageWrapper title="Door Types" buttonTitle="New Door Type" buttonAction={() => navigate('/door-types/new')}>
            <Table
                headers={[
                    { id: 'name', title: 'Name' },
                    { id: 'material', title: 'Material', render: (v) => v ?? '—' },
                    { id: 'description', title: 'Description', render: (v) => v ?? '—' },
                    { id: 'isActive', title: 'Active', render: (v) => <Status content={v ? 'Active' : 'Inactive'} type={v ? 'good' : 'warn'} /> },
                ]}
                rows={doorTypes}
                onRowClick={(row) => navigate(`/door-types/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default DoorTypesPage;
