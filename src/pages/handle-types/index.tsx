import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HandleTypesPageProps } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';
import { Status } from '../../components/status';
import { useAppContext } from '../../context/AppContext';

import './styles.scss';

const HandleTypesPage: React.FC<HandleTypesPageProps> = () => {
    const navigate = useNavigate();
    const { handleTypes } = useAppContext();
    return (
        <PageWrapper title="Handle Types" buttonTitle="New Handle Type" buttonAction={() => navigate('/handle-types/new')}>
            <Table
                headers={[
                    { id: 'name', title: 'Name' },
                    { id: 'finish', title: 'Finish', render: (v) => v ?? '—' },
                    { id: 'mechanism', title: 'Mechanism', render: (v) => v ?? '—' },
                    { id: 'description', title: 'Description', render: (v) => v ?? '—' },
                    { id: 'isActive', title: 'Active', render: (v) => <Status content={v ? 'Active' : 'Inactive'} type={v ? 'good' : 'warn'} /> },
                ]}
                rows={handleTypes}
                onRowClick={(row) => navigate(`/handle-types/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default HandleTypesPage;
