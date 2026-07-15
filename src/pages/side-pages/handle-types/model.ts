export interface HandleTypesPageProps {}

export interface HandleType {
    id: number;
    name: string;
    finish: string | null;
    mechanism: string | null;
    description: string | null;
    supplier?: string | null;
    colour?: string | null;
    labourCost?: number | null;
    isActive: boolean;
    price: number;
    createdAt: string;
}
