import React from 'react';
import { JobPageProps } from './model';

import './style.scss';
    
const JobPage: React.FC<JobPageProps> = () => {
    return (
        <div className="jobs-page">
            <h1>Jobs</h1>
            <p>Welcome to the Jobs page.</p>
        </div>
    );
};

export default JobPage;