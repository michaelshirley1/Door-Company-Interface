export interface DoorTypesPageProps {}

export interface DoorPricingEntry {
    id: number;
    doorTypeId: number;
    configuration?: string | null;
    priceFor?: 'Prehung' | 'Leaf' | null;
    heightMm: number;
    widthMm: number;
    thicknessMm: number;
    price: number;
}

export interface DoorType {
    id: number;
    name: string;
    leafType?: string | null;
    material: string | null;
    productRange?: string | null;
    skinThickness?: string | null;
    description: string | null;
    notes?: string | null;
    isActive: boolean;
    prices?: DoorPricingEntry[];
    createdAt: string;
}
