export interface JambType {
    id: number;
    name: string;
    description?: string | null;
    supplier?: string | null;
    colour?: string | null;
    labourCost?: number | null;
    costPerMetre?: number | null;
    profileSize?: string | null;
    rebateGroove?: string | null;
    code?: string | null;
    price: number; 
    isActive: boolean;
    createdAt: string;
}

export interface JambRequirement {
    id: number;
    unitType: string;
    heightMm: number;
    metresRequired: number;
}
