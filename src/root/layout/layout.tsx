import { LayoutProps } from "./model";

import "./style.scss"


export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-wrapper">
        <div className="layout">
            <div className="layout-toolbar">
                <button
                    onClick={() => window.location.href = "/"}
                >
                    DoorStop
                </button>
                <div className="layout-tabs">
                    <button
                        onClick={() => window.location.href = "/"}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => window.location.href = "/job"}
                    >
                        Jobs
                    </button>
                    <button
                        onClick={() => window.location.href = "/quote"}
                    >
                        Quotes
                    </button>
                    <button
                        onClick={() => window.location.href = "/invoice"}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => window.location.href = "/purchase-order"}
                    >
                        Purchase Orders
                    </button>
                </div>
            </div>
            {children}
        </div>
    </div>
  );
}