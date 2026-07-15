export interface HomePageProps {}

export interface KpiCard {
    label: string;
    value: string;
    route: string;
    deltaPct?: number | null;
    subtitle?: string;
    subtitleTone?: 'neutral' | 'critical';
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
