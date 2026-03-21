import React from 'react';
import { PurchaseOrdersPageProps } from './model';

import './style.scss';

const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = () => {
    return (
        <div className="purchase-orders-page">
            <h1>Purchase Orders</h1>
            <p>Welcome to the Purchase Orders page.</p>
        </div>
    );
};

export default PurchaseOrdersPage;