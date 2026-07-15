export interface CavitySliderType {
    id: number;
    supplier: string;
    productSystem: string;
    unitType?: string | null;
    studPocket?: string | null;
    finishDetail?: string | null;
    colour?: string | null;
    labourCost?: number | null;
    heightMm?: number | null;
    widthRange?: string | null;
    price?: number | null;
    isPOA: boolean;
    priceBasis: string;
    category?: string | null;
    subcategory?: string | null;
    isActive: boolean;
}
