export interface QuotesPageProps {}

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';

export interface Quote {
    id: number;
    quoteNumber: string;
    customerId: number;
    customerName: string;
    status: QuoteStatus;
    totalAmount: number | null;
    validUntil: string | null;
    createdBy: string | null;
    notes: string | null;
    jobId?: number | null;
    jobNumber?: string | null;
    siteAddress?: string | null;
    siteDescription?: string | null;
    items?: import('../jobs/model').OrderItem[];
}
