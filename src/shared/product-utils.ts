import { Product, ProductComponent, ComponentType } from '../pages/side-pages/products/model';
import { DoorType } from '../pages/side-pages/door-types/model';
import { JambType } from '../pages/side-pages/jamb-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';
import { CavitySliderType } from '../pages/side-pages/cavity-sliders/model';
import { TrackType } from '../pages/side-pages/track-types/model';
import { findDoorPrice } from './item-utils';

export interface ProductCatalogs {
    doorTypes: DoorType[];
    jambTypes: JambType[];
    hingeTypes: HingeType[];
    handleTypes: HandleType[];
    cavitySliderTypes: CavitySliderType[];
    trackTypes: TrackType[];
}

const catalogFor = (type: ComponentType, catalogs: ProductCatalogs) => {
    switch (type) {
        case 'DoorType': return catalogs.doorTypes;
        case 'JambType': return catalogs.jambTypes;
        case 'HingeType': return catalogs.hingeTypes;
        case 'HandleType': return catalogs.handleTypes;
        case 'CavitySliderType': return catalogs.cavitySliderTypes;
        case 'TrackType': return catalogs.trackTypes;
        default: return [];
    }
};

export const componentName = (component: ProductComponent, catalogs: ProductCatalogs): string => {
    if (component.componentType === 'Custom') return component.customName ?? 'Custom item';
    const list = catalogFor(component.componentType, catalogs) as { id: number; name?: string; productSystem?: string; trackTypeName?: string }[];
    const record = list.find(r => r.id === component.componentId);
    const baseName = record ? (record.name ?? record.productSystem ?? record.trackTypeName ?? `${component.componentType} #${component.componentId}`) : `${component.componentType} #${component.componentId ?? '?'}`;

    if (component.componentType === 'DoorType' && (component.configuration || component.heightMm)) {
        const dims = [component.heightMm, component.widthMm, component.thicknessMm].filter(Boolean).join('×');
        const bits = [component.configuration, dims ? `${dims}mm` : null].filter(Boolean);
        return bits.length > 0 ? `${baseName} (${bits.join(', ')})` : baseName;
    }
    return baseName;
};

export const componentUnitCost = (component: ProductComponent, catalogs: ProductCatalogs): number => {
    if (component.componentType === 'Custom') return component.customPrice ?? 0;

    if (component.componentType === 'DoorType') {
        const dt = catalogs.doorTypes.find(d => d.id === component.componentId);
        if (!dt) return 0;
        const labourCost = dt.labourCost ?? 0;
        if (component.customPrice != null) return component.customPrice + labourCost;
        if (component.heightMm == null || component.widthMm == null) return labourCost;
        const match = findDoorPrice({
            dt,
            heightMm: component.heightMm,
            widthMm: component.widthMm,
            thicknessMm: component.thicknessMm ?? 35,
            configuration: component.configuration,
            itemType: component.configuration ? 'Prehung' : 'DoorLeaf',
        });
        return (match?.price ?? 0) + labourCost;
    }

    const list = catalogFor(component.componentType, catalogs) as { id: number; price?: number | null; labourCost?: number | null }[];
    const record = list.find(r => r.id === component.componentId);
    if (!record) return 0;
    return (record.price ?? 0) + (record.labourCost ?? 0);
};

export const productTotalCost = (product: Pick<Product, 'components' | 'labourCost'>, catalogs: ProductCatalogs): number => {
    const componentsTotal = product.components.reduce(
        (sum, c) => sum + componentUnitCost(c, catalogs) * (c.quantity || 1),
        0,
    );
    return componentsTotal + (product.labourCost ?? 0);
};
