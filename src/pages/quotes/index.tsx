import React from 'react';
import { QuotesPageProps } from './model';

import './style.scss';

const QuotesPage: React.FC<QuotesPageProps> = () => {
    return (
        <div className="quotes-page">
            <h1>Quotes</h1>
            <p>Welcome to the Quotes page.</p>
        </div>
    );
};

export default QuotesPage;