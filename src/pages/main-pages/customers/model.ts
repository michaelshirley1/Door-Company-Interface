export interface CustomersPageProps {}

export interface Customer {
    id: number;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    createdAt: string;
}
