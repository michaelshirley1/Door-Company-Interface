export interface DoorTypesPageProps {}

export interface DoorPricingEntry {
    id: number;
    doorTypeId: number;
    configuration?: string | null;
    jamb?: string | null;
    priceFor?: 'Prehung' | 'Leaf' | null;
    heightMm: number;
    widthMm: number;
    thicknessMm: number;
    price: number | null;
    isPOA: boolean;
}

export interface DoorType {
    id: number;
    name: string;
    leafType?: string | null;
    material: string | null;
    productRange?: string | null;
    skinThickness?: string | null;
    colour?: string | null;
    labourCost?: number | null;
    description: string | null;
    notes?: string | null;
    isCavityOnly?: boolean;
    isActive: boolean;
    prices?: DoorPricingEntry[];
    createdAt: string;
}
