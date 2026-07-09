import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPageProps, Job } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { useFetch } from '../../../hooks/useFetch';
import { getJobs } from './api';

import './styles.scss';

const JobPage: React.FC<JobPageProps> = () => {
    const navigate = useNavigate();
    const { data: jobs, loading, error } = useFetch(getJobs, [] as Job[], 'Failed to load jobs.');

    return (
        <PageWrapper title="Jobs" buttonTitle="New Job" buttonAction={() => navigate('/jobs/new')}>
            {loading ? <Loading /> : error ? (
                <ErrorBanner message={error} />
            ) : (
                <Table<Job>
                    headers={[
                        { id: 'jobNumber', title: 'Job #' },
                        { id: 'customerName', title: 'Customer' },
                        { id: 'siteAddress', title: 'Site Address' },
                        { id: 'assignedTo', title: 'Assigned To' },
                        { id: 'scheduledDate', title: 'Scheduled Date' },
                        { id: 'status', title: 'Status', render: (v) => <Status content={v} variation="job" /> },
                    ]}
                    rows={jobs}
                    onRowClick={(row) => navigate(`/jobs/${row.id}/edit`)}
                />
            )}
        </PageWrapper>
    );
};

export default JobPage;
