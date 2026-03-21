export interface HomePageProps {}

export interface SummaryCard {
    label: string;
    value: number;
    route: string;
}

export interface ActiveJob {
    id: string;
    customer: string;
    description: string;
    status: string;
    dueDate: string;
}

export interface ActiveInvoice {
    id: string;
    customer: string;
    amount: string;
    status: string;
    dueDate: string;
}