export interface HomePageProps {}

export interface SummaryCard {
    label: string;
    value: number;
    route: string;
}

export interface ActiveJob {
    id: number;
    jobNumber: string | null;
    customerName: string;
    siteAddress: string | null;
    status: string;
    scheduledDate: string | null;
}

export interface ActiveInvoice {
    id: number;
    invoiceNumber: string;
    jobNumber: string;
    status: string;
    total: number;
    dueDate: string | null;
}
