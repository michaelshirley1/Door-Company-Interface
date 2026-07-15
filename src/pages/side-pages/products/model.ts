export interface ProductsPageProps {}

export type ProductsTab = 'doors' | 'cavity-sliders' | 'handles' | 'hinges' | 'jambs' | 'tracks' | 'products';

export type ComponentType = 'DoorType' | 'JambType' | 'HingeType' | 'HandleType' | 'CavitySliderType' | 'TrackType' | 'Custom';

export interface ProductComponent {
    id: number;
    productId: number;
    componentType: ComponentType;
    componentId?: number | null;
    customName?: string | null;
    customPrice?: number | null;
    quantity: number;
    configuration?: string | null;
    heightMm?: number | null;
    widthMm?: number | null;
    thicknessMm?: number | null;
}

export interface Product {
    id: number;
    name: string;
    description?: string | null;
    labourCost?: number | null;
    isActive: boolean;
    components: ProductComponent[];
    createdAt: string;
}
