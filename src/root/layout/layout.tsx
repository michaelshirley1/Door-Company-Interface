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
                <button
                    className="layout-logo"
                    onClick={() => navigate("/")}
                >
                    DoorStop
                </button>
                <div className="layout-tabs">
                    <button
                        className={isActive('/') ? 'active' : ''}
                        onClick={() => navigate("/")}
                    >
                        Home
                    </button>
                    <button
                        className={isActive('/job') ? 'active' : ''}
                        onClick={() => navigate("/job")}
                    >
                        Jobs
                    </button>
                    <button
                        className={isActive('/quote') ? 'active' : ''}
                        onClick={() => navigate("/quote")}
                    >
                        Quotes
                    </button>
                    <button
                        className={isActive('/invoice') ? 'active' : ''}
                        onClick={() => navigate("/invoice")}
                    >
                        Invoices
                    </button>
                    <button
                        className={isActive('/purchase-order') ? 'active' : ''}
                        onClick={() => navigate("/purchase-order")}
                    >
                        Purchase Orders
                    </button>
                </div>
            </div>
            <div className="layout-content">
                {children}
            </div>
        </div>
    </div>
  );
}