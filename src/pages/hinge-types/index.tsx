import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HingeTypesPageProps } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';
import { Status } from '../../components/status';
import { useAppContext } from '../../context/AppContext';

import './styles.scss';

const HingeTypesPage: React.FC<HingeTypesPageProps> = () => {
    const navigate = useNavigate();
    const { hingeTypes } = useAppContext();
    return (
        <PageWrapper title="Hinge Types" buttonTitle="New Hinge Type" buttonAction={() => navigate('/hinge-types/new')}>
            <Table
                headers={[
                    { id: 'name', title: 'Name' },
                    { id: 'finish', title: 'Finish', render: (v) => v ?? '—' },
                    { id: 'description', title: 'Description', render: (v) => v ?? '—' },
                    { id: 'isActive', title: 'Active', render: (v) => <Status content={v ? 'Active' : 'Inactive'} type={v ? 'good' : 'warn'} /> },
                ]}
                rows={hingeTypes}
                onRowClick={(row) => navigate(`/hinge-types/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default HingeTypesPage;
