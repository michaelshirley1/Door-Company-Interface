import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutProps } from "./model";

import "./style.scss"

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout-wrapper">
        <div className="layout">
            <div className="layout-toolbar">
                <button className="layout-logo" onClick={() => navigate("/")}>
                    DoorStop
                </button>
                <div className="layout-tabs">
                    <button className={isActive('/') ? 'active' : ''} onClick={() => navigate("/")}>Home</button>
                    <button className={isActive('/customers') ? 'active' : ''} onClick={() => navigate("/customers")}>Customers</button>
                    <button className={isActive('/quotes') ? 'active' : ''} onClick={() => navigate("/quotes")}>Quotes</button>
                    <button className={isActive('/purchase-orders') ? 'active' : ''} onClick={() => navigate("/purchase-orders")}>Purchase Orders</button>
                    <button className={isActive('/jobs') ? 'active' : ''} onClick={() => navigate("/jobs")}>Jobs</button>
                    <button className={isActive('/invoices') ? 'active' : ''} onClick={() => navigate("/invoices")}>Invoices</button>
                    <div className="nav-divider" />
                    <button className={isActive('/door-types') ? 'active catalogue' : 'catalogue'} onClick={() => navigate("/door-types")}>Door Types</button>
                    <button className={isActive('/hinge-types') ? 'active catalogue' : 'catalogue'} onClick={() => navigate("/hinge-types")}>Hinge Types</button>
                    <button className={isActive('/handle-types') ? 'active catalogue' : 'catalogue'} onClick={() => navigate("/handle-types")}>Handle Types</button>
                </div>
            </div>
            <div className="layout-content">
                {children}
            </div>
        </div>
    </div>
  );
}
