import { Routes, Route } from 'react-router-dom';
import Layout from './layout/layout';
import { HomePage } from '../pages/home';
import JobPage from '../pages/jobs';
import QuotesPage from '../pages/quotes';
import InvoicesPage from '../pages/invoices';
import PurchaseOrdersPage from '../pages/purchase-orders';

export default function App() {
  return (
    <Layout>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/job" element={<JobPage />} />
            <Route path="/quote" element={<QuotesPage />} />
            <Route path="/invoice" element={<InvoicesPage />} />
            <Route path="/purchase-order" element={<PurchaseOrdersPage />} />
        </Routes>
    </Layout>
  );
}