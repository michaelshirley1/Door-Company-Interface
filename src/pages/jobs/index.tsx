import React from 'react';
import { JobPageProps, Job } from './model';
import { PageWrapper } from '../../components/page-wrapper';
import { Table } from '../../components/table';

import './styles.scss';

const jobs: Job[] = [
    { id: 'JOB-001', customer: '', description: '', status: 'In Progress', startDate: '', dueDate: '' },
    { id: 'JOB-002', customer: '', description: '', status: 'In Progress', startDate: '', dueDate: '' },
    { id: 'JOB-003', customer: '', description: '', status: 'Pending', startDate: '', dueDate: '' },
    { id: 'JOB-004', customer: '', description: '', status: 'Completed', startDate: '', dueDate: '' },
    { id: 'JOB-005', customer: '', description: '', status: 'Pending', startDate: '', dueDate: '' },
];

const JobPage: React.FC<JobPageProps> = () => {
    return (
        <PageWrapper 
            title="Jobs" 
            buttonTitle='New Job'
            buttonAction={()=>{}}
        >
            <Table
                headers={[
                    {id: "id", title: "ID" },
                    {id: "customer", title: "Customer" },
                    {id: "description", title: "Description" },
                    {id: "status", title: "Status" },
                    {id: "startDate", title: "Start Date" },
                    {id: "dueDate", title: "Due Date" }
                ]}
                rows={jobs}
            />
        </PageWrapper>
    );
};

export default JobPage;