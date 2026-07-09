import { OrderItem } from '../pages/main-pages/jobs/model';
import { DoorType, DoorPricingEntry } from '../pages/side-pages/door-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';
import { JambType } from '../pages/side-pages/jamb-types/model';

export type ItemFormState = ReturnType<typeof blankItemForm>;

// Kept for backwards-compat — jamb options now come from JambType records via API
export const JAMB_OPTIONS: string[] = [];

export const blankItemForm = () => ({
    itemType:          'Prehung' as OrderItem['itemType'],
    doorTypeId:        '',
    hingeTypeId:       '',
    handleTypeId:      '',
    room:              '',
    doorConfiguration: '',
    heightMm:          '1980',
    widthMm:           '810',
    thicknessMm:       '35',
    handSide:          '',
    glazing:           '',
    fireRating:        '',
    drilling:          'false',
    drillSize:         '',
    jam:               '',
    jamCustom:         '',
    reveal:            '',
    quantity:          '1',
    unitPrice:         '',
    notes:             '',
});

export const itemToForm = (item: OrderItem, jambTypeNames?: string[]): ItemFormState => {
    const jamValue = item.jam ?? '';
    // If jambTypeNames provided, check if the stored value matches a known JambType name
    // Otherwise treat unknown values as custom/special
    const isKnownJamb = jambTypeNames ? jambTypeNames.includes(jamValue) : false;
    const isCustomJamb = jamValue !== '' && !isKnownJamb;
    return {
        itemType:          item.itemType,
        doorTypeId:        item.doorTypeId?.toString()     ?? '',
        hingeTypeId:       item.hingeTypeId?.toString()    ?? '',
        handleTypeId:      item.handleTypeId?.toString()   ?? '',
        room:              item.room                       ?? '',
        doorConfiguration: item.doorConfiguration          ?? '',
        heightMm:          item.heightMm?.toString()       ?? '1980',
        widthMm:           item.widthMm?.toString()        ?? '',
        thicknessMm:       item.thicknessMm?.toString()    ?? '35',
        handSide:          item.handSide                   ?? '',
        glazing:           item.glazing                    ?? '',
        fireRating:        item.fireRating                 ?? '',
        drilling:          item.drilling ? 'true' : 'false',
        drillSize:         item.drillSize                  ?? '',
        jam:               isCustomJamb ? 'Special' : jamValue,
        jamCustom:         isCustomJamb ? jamValue : '',
        reveal:            item.reveal                     ?? '',
        quantity:          item.quantity?.toString()       ?? '1',
        unitPrice:         item.unitPrice?.toString()      ?? '',
        notes:             item.notes                      ?? '',
    };
};

export const lookupDoorPrice = (
    doorTypes: DoorType[],
    doorTypeId: string,
    heightMm: string,
    widthMm: string,
    configuration?: string,
    handleTypes?: HandleType[],
    handleTypeId?: string,
    jambTypes?: JambType[],
    jamId?: string,
    itemType?: string,
    thicknessMm?: string,
): string => {
    if (!doorTypeId) return '';
    const dt = doorTypes.find(d => d.id === parseInt(doorTypeId));
    if (!dt) return '';

    let doorPrice = 0;

    if (dt.prices && heightMm && widthMm) {
        const h = parseInt(heightMm);
        const w = parseInt(widthMm);
        const t = thicknessMm ? parseInt(thicknessMm) : 35;
        // A price entry matches if its priceFor is null/undefined (applies to both) or matches itemType
        const matchesPriceFor = (p: DoorPricingEntry) => !p.priceFor || p.priceFor === itemType;
        // Try exact config + size + thickness match first, then fallback to "all configs" match
        const configMatch = configuration
            ? dt.prices.find(p => p.configuration === configuration && p.heightMm === h && p.widthMm === w && p.thicknessMm === t && matchesPriceFor(p))
            : null;
        const anyConfigMatch = dt.prices.find(p => !p.configuration && p.heightMm === h && p.widthMm === w && p.thicknessMm === t && matchesPriceFor(p));
        const match = configMatch ?? anyConfigMatch;
        if (match) doorPrice = match.price;
    }

    let jambPrice = 0;
    if (jambTypes && jamId && jamId !== 'Special') {
        // jamId stores the JambType name (e.g. "112 19 Flat")
        const jt = jambTypes.find(j => j.name === jamId);
        if (jt) jambPrice = jt.price;
    }

    let handlePrice = 0;
    if (handleTypes && handleTypeId) {
        const ht = handleTypes.find(h => h.id === parseInt(handleTypeId));
        if (ht) handlePrice = ht.price;
    }

    const total = doorPrice + jambPrice + handlePrice;
    return total > 0 ? total.toString() : '';
};

export const activeOnly = <T extends { isActive: boolean }>(list: T[]) =>
    list.filter(x => x.isActive);

export const buildOrderItem = (itemForm: ItemFormState, sortOrder: number, quantityDefault: number | null = null): OrderItem => ({
    id:                0,
    itemType:          itemForm.itemType,
    doorTypeId:        itemForm.doorTypeId        ? parseInt(itemForm.doorTypeId)   : null,
    hingeTypeId:       itemForm.hingeTypeId       ? parseInt(itemForm.hingeTypeId)  : null,
    handleTypeId:      itemForm.handleTypeId      ? parseInt(itemForm.handleTypeId) : null,
    room:              itemForm.room              || null,
    assembly:          null,
    doorConfiguration: itemForm.doorConfiguration || null,
    heightMm:          itemForm.heightMm && itemForm.heightMm !== 'custom' ? parseInt(itemForm.heightMm) : null,
    widthMm:           itemForm.widthMm           ? parseInt(itemForm.widthMm)      : null,
    thicknessMm:       itemForm.thicknessMm       ? parseInt(itemForm.thicknessMm)  : null,
    handSide:          itemForm.handSide          || null,
    colourFinish:      null,
    glazing:           itemForm.glazing            || null,
    fireRating:        itemForm.fireRating         || null,
    drilling:          itemForm.drilling === 'true',
    drillSize:         itemForm.drillSize          || null,
    jam:               itemForm.jam === 'Special'  ? (itemForm.jamCustom || null) : (itemForm.jam || null),
    reveal:            itemForm.reveal             || null,
    quantity:          itemForm.quantity ? parseInt(itemForm.quantity) : quantityDefault,
    unitPrice:         itemForm.unitPrice          ? parseFloat(itemForm.unitPrice) : null,
    notes:             itemForm.notes              || null,
    sortOrder,
    createdAt:         new Date(),
});
