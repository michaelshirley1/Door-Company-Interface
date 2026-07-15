export interface TrackType {
    id: number;
    supplier: string;
    trackSystem: string;
    trackTypeName: string;
    widthRangeMm?: string | null;
    lengthMm?: number | null;
    code?: string | null;
    colour?: string | null;
    price?: number | null;
    isActive: boolean;
    createdAt: string;
}
