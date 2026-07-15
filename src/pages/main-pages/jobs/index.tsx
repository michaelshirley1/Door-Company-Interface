import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPageProps, Job } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { FilterBar, FilterSelect, FilterSearch } from '../../../components/filter-bar';
import { useFetch } from '../../../hooks/useFetch';
import { getJobs } from './api';
import { JOB_STATUSES } from '../../../shared/constants';

import './styles.scss';

const JobPage: React.FC<JobPageProps> = () => {
    const navigate = useNavigate();
    const { data: jobs, loading, error } = useFetch(getJobs, [] as Job[], 'Failed to load jobs.');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    if (loading) return <Loading />;
    if (error) return <ErrorBanner message={error} />;

    const results = jobs.filter(j => {
        if (status && j.status !== status) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!(j.jobNumber?.toLowerCase().includes(q) || j.customerName?.toLowerCase().includes(q))) return false;
        }
        return true;
    });

    return (
        <PageWrapper title="Jobs" buttonTitle="New Job" buttonAction={() => navigate('/jobs/new')}>
            <FilterBar
                showClear={!!(status || search)}
                onClear={() => { setStatus(''); setSearch(''); }}
            >
                <FilterSelect label="Status" value={status} onChange={setStatus} options={JOB_STATUSES} />
                <FilterSearch label="Search" value={search} onChange={setSearch} placeholder="Job # or customer" />
            </FilterBar>
            <Table<Job>
                headers={[
                    { id: 'jobNumber', title: 'Job #' },
                    { id: 'customerName', title: 'Customer' },
                    { id: 'siteAddress', title: 'Site Address' },
                    { id: 'assignedTo', title: 'Assigned To' },
                    { id: 'scheduledDate', title: 'Scheduled Date' },
                    { id: 'status', title: 'Status', render: (v) => <Status content={v} variation="job" /> },
                ]}
                rows={results}
                onRowClick={(row) => navigate(`/jobs/${row.id}/edit`)}
                emptyMessage="No jobs match the selected filters."
            />
        </PageWrapper>
    );
};

export default JobPage;
