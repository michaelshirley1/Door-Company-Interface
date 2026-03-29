import { Routes, Route } from 'react-router-dom';
import Layout from './layout/layout';

import { HomePage } from '../pages/home';

import JobPage from '../pages/main-pages/jobs';
import QuotesPage from '../pages/main-pages/quotes';
import InvoicesPage from '../pages/main-pages/invoices';
import PurchaseOrdersPage from '../pages/main-pages/purchase-orders';
import CustomersPage from '../pages/main-pages/customers';

import JobFormPage from '../pages/main-pages/jobs/new';
import QuoteFormPage from '../pages/main-pages/quotes/new';
import InvoiceFormPage from '../pages/main-pages/invoices/new';
import PurchaseOrderFormPage from '../pages/main-pages/purchase-orders/new';
import CustomerFormPage from '../pages/main-pages/customers/new';

import DoorTypesPage from '../pages/door-types';
import DoorTypeFormPage from '../pages/door-types/new';
import HingeTypesPage from '../pages/hinge-types';
import HingeTypeFormPage from '../pages/hinge-types/new';
import HandleTypesPage from '../pages/handle-types';
import HandleTypeFormPage from '../pages/handle-types/new';

export default function App() {
  return (
    <Layout>
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/jobs" element={<JobPage />} />
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id/edit" element={<JobFormPage />} />

            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/new" element={<QuoteFormPage />} />
            <Route path="/quotes/:id/edit" element={<QuoteFormPage />} />

            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<InvoiceFormPage />} />
            <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />

            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/new" element={<PurchaseOrderFormPage />} />
            <Route path="/purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

            <Route path="/door-types" element={<DoorTypesPage />} />
            <Route path="/door-types/new" element={<DoorTypeFormPage />} />
            <Route path="/door-types/:id/edit" element={<DoorTypeFormPage />} />

            <Route path="/hinge-types" element={<HingeTypesPage />} />
            <Route path="/hinge-types/new" element={<HingeTypeFormPage />} />
            <Route path="/hinge-types/:id/edit" element={<HingeTypeFormPage />} />

            <Route path="/handle-types" element={<HandleTypesPage />} />
            <Route path="/handle-types/new" element={<HandleTypeFormPage />} />
            <Route path="/handle-types/:id/edit" element={<HandleTypeFormPage />} />
        </Routes>
    </Layout>
  );
}
