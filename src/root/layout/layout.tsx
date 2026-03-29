import { useNavigate } from 'react-router-dom';
import { LayoutProps } from "./model";

import "./style.scss"

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="layout-wrapper">
        <div className="layout">
            <div className="layout-toolbar">
                <button className="layout-logo" onClick={() => navigate("/")}>
                    <img className="layout-logo-icon" src="/assets/fulllogo.png" alt="DoorStop" />
                </button>
                <div className="layout-tabs">
                    <button onClick={() => navigate("/")}>Home</button>
                    <button onClick={() => navigate("/customers")}>Customers</button>
                    <button onClick={() => navigate("/quotes")}>Quotes</button>
                    <button onClick={() => navigate("/purchase-orders")}>Purchase Orders</button>
                    <button onClick={() => navigate("/jobs")}>Jobs</button>
                    <button onClick={() => navigate("/invoices")}>Invoices</button>
                    <div className="nav-divider" />
                    <button onClick={() => navigate("/door-types")}>Door Types</button>
                    <button onClick={() => navigate("/hinge-types")}>Hinge Types</button>
                    <button onClick={() => navigate("/handle-types")}>Handle Types</button>
                </div>
            </div>
            <div className="layout-content">
                {children}
            </div>
        </div>
    </div>
  );
}
