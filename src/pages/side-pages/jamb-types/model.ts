export interface JambType {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
    createdAt: string;
}
