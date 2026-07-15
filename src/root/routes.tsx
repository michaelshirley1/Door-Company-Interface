import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/layout';
import { useAuth } from '../auth/AuthContext';
import LoginPage from '../pages/login';

import { HomePage } from '../pages/home';

import JobPage from '../pages/main-pages/jobs';
import QuotesPage from '../pages/main-pages/quotes';
import OrdersPage from '../pages/main-pages/orders';
import InvoicesPage from '../pages/main-pages/invoices';
import CustomersPage from '../pages/main-pages/customers';

import JobFormPage from '../pages/main-pages/jobs/new';
import QuoteFormPage from '../pages/main-pages/quotes/new';
import OrderFormPage from '../pages/main-pages/orders/new';
import InvoiceFormPage from '../pages/main-pages/invoices/new';
import CustomerFormPage from '../pages/main-pages/customers/new';

import ProductsPage from '../pages/side-pages/products';
import DoorDetailPage from '../pages/side-pages/doors/detail';
import SettingsPage from '../pages/main-pages/settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();
    if (loading) return null;
    if (!session) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
    const { isOwner, loading } = useAuth();
    if (loading) return null;
    if (!isOwner) return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
                <ProtectedRoute>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<HomePage />} />

                            <Route path="/jobs" element={<JobPage />} />
                            <Route path="/jobs/new" element={<JobFormPage />} />
                            <Route path="/jobs/:id/edit" element={<JobFormPage />} />

                            <Route path="/quotes" element={<QuotesPage />} />
                            <Route path="/quotes/:id/edit" element={<QuoteFormPage />} />

                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders/:id/edit" element={<OrderFormPage />} />

                            <Route path="/invoices" element={<InvoicesPage />} />
                            <Route path="/invoices/new" element={<InvoiceFormPage />} />
                            <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />

                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/customers/new" element={<CustomerFormPage />} />
                            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/doors/new" element={<DoorDetailPage />} />
                            <Route path="/doors/:id" element={<DoorDetailPage />} />

                            <Route path="/settings" element={<OwnerRoute><SettingsPage /></OwnerRoute>} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}
