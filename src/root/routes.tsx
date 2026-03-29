import { Routes, Route } from 'react-router-dom';
import Layout from './layout/layout';

import { HomePage } from '../pages/home';

import JobPage from '../pages/main-pages/jobs';
import QuotesPage from '../pages/main-pages/quotes';
import InvoicesPage from '../pages/main-pages/invoices';
import PurchaseOrdersPage from '../pages/main-pages/purchase-orders';
import CustomersPage from '../pages/main-pages/customers';

import NewJobPage from '../pages/main-pages/jobs/new';
import NewQuotePage from '../pages/main-pages/quotes/new';
import NewInvoicePage from '../pages/main-pages/invoices/new';
import NewPurchaseOrderPage from '../pages/main-pages/purchase-orders/new';
import NewCustomerPage from '../pages/main-pages/customers/new';

import DoorTypesPage from '../pages/door-types';
import NewDoorTypePage from '../pages/door-types/new';
import HingeTypesPage from '../pages/hinge-types';
import NewHingeTypePage from '../pages/hinge-types/new';
import HandleTypesPage from '../pages/handle-types';
import NewHandleTypePage from '../pages/handle-types/new';

export default function App() {
  return (
    <Layout>
        <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/jobs" element={<JobPage />} />
            <Route path="/jobs/new" element={<NewJobPage />} />

            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/new" element={<NewQuotePage />} />

            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />

            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/new" element={<NewPurchaseOrderPage />} />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<NewCustomerPage />} />

            <Route path="/door-types" element={<DoorTypesPage />} />
            <Route path="/door-types/new" element={<NewDoorTypePage />} />

            <Route path="/hinge-types" element={<HingeTypesPage />} />
            <Route path="/hinge-types/new" element={<NewHingeTypePage />} />
            
            <Route path="/handle-types" element={<HandleTypesPage />} />
            <Route path="/handle-types/new" element={<NewHandleTypePage />} />
        </Routes>
    </Layout>
  );
}
