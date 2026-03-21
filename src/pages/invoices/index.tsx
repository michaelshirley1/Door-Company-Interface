import React from 'react';
import { InvoicesPageProps } from './model';

import './style.scss';
    
const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    return (
        <div className="invoices-page">
            <h1>Invoices</h1>
            <p>Welcome to the Invoices page.</p>
        </div>
    );
};

export default InvoicesPage;