import { OrderItem } from '../jobs/model';

export interface OrdersPageProps {}

export interface PurchaseOrder {
    id: number;
    quoteId: number | null;
    customerId: number;
    customerName: string;
    poNumber: string | null;
    status: string;
    jobId: number | null;
    jobNumber: string | null;
    siteAddress: string | null;
    siteDescription: string | null;
    orderDate: string;
    expectedDelivery: string | null;
    totalAmount: number | null;
    notes: string | null;
    quote?: {
        id: number;
        quoteNumber: string;
        totalAmount: number | null;
        items: OrderItem[];
    } | null;
}
