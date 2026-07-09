import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutProps } from "./model";
import { useAuth } from '../../auth/AuthContext';
import "./style.scss"

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [xeroNotice, setXeroNotice] = useState<{ message: string; ok: boolean } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const xero = params.get('xero');
    if (xero === 'connected') {
      setXeroNotice({ message: 'Successfully connected to Xero!', ok: true });
      navigate(location.pathname, { replace: true });
    } else if (xero === 'error') {
      setXeroNotice({ message: 'Failed to connect to Xero. Please try again.', ok: false });
      navigate(location.pathname, { replace: true });
    }
    if (xero) {
      const t = setTimeout(() => setXeroNotice(null), 6000);
      return () => clearTimeout(t);
    }
  }, [location.search]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navTo = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

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
                    <button onClick={() => navigate("/jobs")}>Jobs</button>
                    <button onClick={() => navigate("/quotes")}>Quotes</button>
                    <button onClick={() => navigate("/orders")}>Orders</button>
                    <button onClick={() => navigate("/invoices")}>Invoices</button>
                    <div className="nav-divider" />
                    <button onClick={() => navigate("/doors")}>Doors</button>
                    <button onClick={() => navigate("/cavity-sliders")}>Cavity Sliders</button>
                    <button onClick={() => navigate("/hardware")}>Hardware</button>
                </div>
                <button className="layout-signout" onClick={handleSignOut}>Sign out</button>
                <button className="layout-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>
            {menuOpen && (
                <div className="layout-mobile-nav">
                    <button onClick={() => navTo("/")}>Home</button>
                    <button onClick={() => navTo("/customers")}>Customers</button>
                    <button onClick={() => navTo("/jobs")}>Jobs</button>
                    <button onClick={() => navTo("/quotes")}>Quotes</button>
                    <button onClick={() => navTo("/orders")}>Orders</button>
                    <button onClick={() => navTo("/invoices")}>Invoices</button>
                    <div className="mobile-nav-divider" />
                    <button onClick={() => navTo("/doors")}>Doors</button>
                    <button onClick={() => navTo("/cavity-sliders")}>Cavity Sliders</button>
                    <button onClick={() => navTo("/hardware")}>Hardware</button>
                    <div className="mobile-nav-divider" />
                    <button className="mobile-signout" onClick={handleSignOut}>Sign out</button>
                </div>
            )}
            {xeroNotice && (
                <div className={`xero-notice${xeroNotice.ok ? ' xero-notice--ok' : ' xero-notice--error'}`}>
                    {xeroNotice.message}
                    <button onClick={() => setXeroNotice(null)}>✕</button>
                </div>
            )}
            <div className="layout-content">
                {children}
            </div>
        </div>
    </div>
  );
}
