import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPageProps } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import { useAppContext } from '../../../context/AppContext';

import './styles.scss';

const JobPage: React.FC<JobPageProps> = () => {
    const navigate = useNavigate();
    const { jobs } = useAppContext();
    
    return (
        <PageWrapper title="Jobs" buttonTitle="New Job" buttonAction={() => navigate('/jobs/new')}>
            <Table
                headers={[
                    { id: 'jobNumber', title: 'Job #' },
                    { id: 'customerName', title: 'Customer' },
                    { id: 'siteAddress', title: 'Site Address' },
                    { id: 'assignedTo', title: 'Assigned To', render: (v) => v ?? '—' },
                    { id: 'scheduledDate', title: 'Scheduled Date', render: (v) => v ?? '—' },
                    { id: 'status', title: 'Status', render: (v) => <Status content={v} variation="job" /> },
                ]}
                rows={jobs}
                onRowClick={(row) => navigate(`/jobs/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default JobPage;
