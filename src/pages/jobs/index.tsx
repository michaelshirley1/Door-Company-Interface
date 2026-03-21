import React from 'react';
import { JobPageProps, Job } from './model';

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
        <div className="jobs-page">
            <div className="page-header">
                <h1>Jobs</h1>
                <button className="btn-primary">New Job</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => (
                            <tr key={job.id}>
                                <td>{job.id}</td>
                                <td>{job.customer}</td>
                                <td>{job.description}</td>
                                <td><span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</span></td>
                                <td>{job.startDate}</td>
                                <td>{job.dueDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobPage;