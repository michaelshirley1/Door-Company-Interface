import { OrderItem } from '../pages/main-pages/jobs/model';
import { DoorType, DoorPricingEntry } from '../pages/side-pages/door-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';
import { JambType, JambRequirement } from '../pages/side-pages/jamb-types/model';
import { CavitySliderType } from '../pages/side-pages/cavity-sliders/model';
import { TrackType } from '../pages/side-pages/track-types/model';
import { CAVITY_CONFIGS, HINGED_CONFIGS, DEFAULT_MARGIN_PERCENT, hingeSetsForConfig, priceForKey } from './constants';
import { jambCostForItem } from './jamb-utils';

export type ItemFormState = ReturnType<typeof blankItemForm>;

export const JAMB_OPTIONS: string[] = [];

export const blankItemForm = () => ({
    itemType:           'Prehung' as OrderItem['itemType'],
    doorTypeId:         '',
    hingeTypeId:        '',
    handleTypeId:       '',
    cavitySliderTypeId: '',
    trackTypeId:        '',
    hingeCount:         '',
    productId:          '',
    room:               '',
    doorConfiguration:  '',
    heightMm:           '1980',
    widthMm:            '810',
    thicknessMm:        '35',
    handSide:           '',
    glazing:            '',
    fireRating:         '',
    drilling:           'false',
    drillSize:          '',
    jam:                '',
    jamCustom:          '',
    colourFinish:       '',
    reveal:             '',
    quantity:           '1',
    unitPrice:          '',
    marginPercent:      '',
    notes:              '',
});

export const itemToForm = (item: OrderItem, jambTypeNames?: string[]): ItemFormState => {
    const jamValue = item.jam ?? '';
    const isKnownJamb = jambTypeNames ? jambTypeNames.includes(jamValue) : false;
    const isCustomJamb = jamValue !== '' && !isKnownJamb;
    return {
        itemType:           item.itemType,
        doorTypeId:         item.doorTypeId?.toString()         ?? '',
        hingeTypeId:        item.hingeTypeId?.toString()        ?? '',
        handleTypeId:       item.handleTypeId?.toString()       ?? '',
        cavitySliderTypeId: item.cavitySliderTypeId?.toString() ?? '',
        trackTypeId:        item.trackTypeId?.toString()        ?? '',
        hingeCount:         item.hingeCount?.toString()         ?? '',
        productId:          item.productId?.toString()          ?? '',
        room:               item.room                           ?? '',
        doorConfiguration:  item.doorConfiguration              ?? '',
        heightMm:           item.heightMm?.toString()           ?? '1980',
        widthMm:            item.widthMm?.toString()            ?? '',
        thicknessMm:        item.thicknessMm?.toString()        ?? '35',
        handSide:           item.handSide                       ?? '',
        glazing:            item.glazing                        ?? '',
        fireRating:         item.fireRating                     ?? '',
        drilling:           item.drilling ? 'true' : 'false',
        drillSize:          item.drillSize                      ?? '',
        jam:                isCustomJamb ? 'Special' : jamValue,
        jamCustom:          isCustomJamb ? jamValue : '',
        colourFinish:       item.colourFinish                   ?? '',
        reveal:             item.reveal                         ?? '',
        quantity:           item.quantity?.toString()           ?? '1',
        unitPrice:          item.unitPrice?.toString()          ?? '',
        marginPercent:      item.marginPercent?.toString()      ?? '',
        notes:              item.notes                          ?? '',
    };
};

export interface DoorPriceMatchArgs {
    dt: DoorType;
    heightMm: number;
    widthMm: number;
    thicknessMm: number;
    configuration?: string | null;
    itemType?: string | null;
}

export const findDoorPrice = ({ dt, heightMm, widthMm, thicknessMm, configuration, itemType }: DoorPriceMatchArgs): DoorPricingEntry | undefined => {
    if (!dt.prices) return undefined;
    const wanted = priceForKey(itemType);
    const matchesDims = (p: DoorPricingEntry) => p.heightMm === heightMm && p.widthMm === widthMm && p.thicknessMm === thicknessMm && !p.jamb;

    return (
        (configuration ? dt.prices.find(p => p.configuration === configuration && p.priceFor === wanted && matchesDims(p)) : undefined) ??
        (configuration ? dt.prices.find(p => p.configuration === configuration && !p.priceFor && matchesDims(p)) : undefined) ??
        (configuration ? dt.prices.find(p => p.configuration === configuration && matchesDims(p)) : undefined) ??
        dt.prices.find(p => !p.configuration && p.priceFor === wanted && matchesDims(p)) ??
        dt.prices.find(p => !p.configuration && !p.priceFor && matchesDims(p)) ??
        dt.prices.find(p => !p.configuration && matchesDims(p))
    );
};

export interface PriceQuoteItemArgs {
    doorTypes: DoorType[];
    doorTypeId: string;
    heightMm: string;
    widthMm: string;
    thicknessMm?: string;
    configuration?: string;
    itemType?: string;
    handleTypes?: HandleType[];
    handleTypeId?: string;
    jambTypes?: JambType[];
    jamId?: string;
    jambRequirements?: JambRequirement[];
    cavitySliderTypes?: CavitySliderType[];
    cavitySliderTypeId?: string;
    hingeTypes?: HingeType[];
    hingeTypeId?: string;
    hingeCount?: string;
    trackTypes?: TrackType[];
    trackTypeId?: string;
    marginPercent?: number | null;
}

export interface QuoteItemBreakdown {
    doorPrice: number;
    doorLabour: number;
    cavityPrice: number;
    cavityLabour: number;
    jambPrice: number;
    jambLabour: number;
    handlePrice: number;
    handleLabour: number;
    hingePrice: number;
    hingeLabour: number;
    trackPrice: number;
    cost: number;
    marginPercent: number;
    total: number;
}

export const priceQuoteItemBreakdown = (args: PriceQuoteItemArgs): QuoteItemBreakdown => {
    const { doorTypes, doorTypeId, heightMm, widthMm, thicknessMm, configuration, itemType } = args;
    const dt = doorTypeId ? doorTypes.find(d => d.id === parseInt(doorTypeId)) : undefined;

    let doorPrice = 0;
    const doorLabour = dt?.labourCost ?? 0;
    if (dt && dt.prices && heightMm && widthMm) {
        const match = findDoorPrice({
            dt,
            heightMm: parseInt(heightMm),
            widthMm: parseInt(widthMm),
            thicknessMm: thicknessMm ? parseInt(thicknessMm) : 35,
            configuration,
            itemType,
        });
        doorPrice = match?.price ?? 0;
    }

    let cavityPrice = 0;
    let cavityLabour = 0;
    if (configuration && CAVITY_CONFIGS.includes(configuration) && args.cavitySliderTypes && args.cavitySliderTypeId) {
        const cs = args.cavitySliderTypes.find(c => c.id === parseInt(args.cavitySliderTypeId!));
        if (cs) {
            if (!cs.isPOA) cavityPrice = cs.price ?? 0;
            cavityLabour = cs.labourCost ?? 0;
        }
    }

    let jambPrice = 0;
    let jambLabour = 0;
    if (args.jambTypes && args.jamId && args.jamId !== 'Special') {
        const jt = args.jambTypes.find(j => j.name === args.jamId);
        jambPrice = jambCostForItem(jt, configuration, heightMm ? parseInt(heightMm) : null, args.jambRequirements ?? []);
        jambLabour = jt?.labourCost ?? 0;
    }

    let handlePrice = 0;
    let handleLabour = 0;
    if (args.handleTypes && args.handleTypeId) {
        const ht = args.handleTypes.find(h => h.id === parseInt(args.handleTypeId!));
        if (ht) { handlePrice = ht.price; handleLabour = ht.labourCost ?? 0; }
    }

    let hingePrice = 0;
    let hingeLabour = 0;
    if (configuration && HINGED_CONFIGS.includes(configuration) && args.hingeTypes && args.hingeTypeId && args.hingeCount) {
        const ht = args.hingeTypes.find(h => h.id === parseInt(args.hingeTypeId!));
        if (ht) {
            const totalHinges = parseInt(args.hingeCount) * hingeSetsForConfig(configuration);
            hingePrice = ht.price * totalHinges;
            hingeLabour = (ht.labourCost ?? 0) * totalHinges;
        }
    }

    let trackPrice = 0;
    if (args.trackTypes && args.trackTypeId) {
        const tt = args.trackTypes.find(t => t.id === parseInt(args.trackTypeId!));
        if (tt) trackPrice = tt.price ?? 0;
    }

    const cost = doorPrice + doorLabour + cavityPrice + cavityLabour + jambPrice + jambLabour
        + handlePrice + handleLabour + hingePrice + hingeLabour + trackPrice;
    const marginPercent = args.marginPercent ?? DEFAULT_MARGIN_PERCENT;
    const total = cost * (1 + marginPercent / 100);

    return {
        doorPrice, doorLabour, cavityPrice, cavityLabour, jambPrice, jambLabour,
        handlePrice, handleLabour, hingePrice, hingeLabour, trackPrice,
        cost, marginPercent, total,
    };
};

export const priceQuoteItem = (args: PriceQuoteItemArgs): string => {
    if (!args.doorTypeId) return '';
    const { total } = priceQuoteItemBreakdown(args);
    return total > 0 ? total.toFixed(2) : '';
};

export const activeOnly = <T extends { isActive: boolean }>(list: T[]) =>
    list.filter(x => x.isActive);

export const buildOrderItem = (itemForm: ItemFormState, sortOrder: number, quantityDefault: number | null = null): OrderItem => ({
    id:                 0,
    itemType:           itemForm.itemType,
    doorTypeId:         itemForm.doorTypeId         ? parseInt(itemForm.doorTypeId)         : null,
    hingeTypeId:        itemForm.hingeTypeId        ? parseInt(itemForm.hingeTypeId)        : null,
    handleTypeId:       itemForm.handleTypeId       ? parseInt(itemForm.handleTypeId)       : null,
    cavitySliderTypeId: itemForm.cavitySliderTypeId ? parseInt(itemForm.cavitySliderTypeId) : null,
    trackTypeId:        itemForm.trackTypeId        ? parseInt(itemForm.trackTypeId)        : null,
    hingeCount:         itemForm.hingeCount         ? parseInt(itemForm.hingeCount)         : null,
    productId:          itemForm.productId          ? parseInt(itemForm.productId)          : null,
    room:               itemForm.room               || null,
    assembly:           null,
    doorConfiguration:  itemForm.doorConfiguration  || null,
    heightMm:           itemForm.heightMm && itemForm.heightMm !== 'custom' ? parseInt(itemForm.heightMm) : null,
    widthMm:            itemForm.widthMm            ? parseInt(itemForm.widthMm)  : null,
    thicknessMm:        itemForm.thicknessMm        ? parseInt(itemForm.thicknessMm) : null,
    handSide:           itemForm.handSide           || null,
    colourFinish:       itemForm.colourFinish       || null,
    glazing:            itemForm.glazing            || null,
    fireRating:         itemForm.fireRating         || null,
    drilling:           itemForm.drilling === 'true',
    drillSize:          itemForm.drillSize          || null,
    jam:                itemForm.jam === 'Special'  ? (itemForm.jamCustom || null) : (itemForm.jam || null),
    reveal:             itemForm.reveal             || null,
    quantity:           itemForm.quantity ? parseInt(itemForm.quantity) : quantityDefault,
    unitPrice:          itemForm.unitPrice          ? parseFloat(itemForm.unitPrice) : null,
    marginPercent:      itemForm.marginPercent      ? parseFloat(itemForm.marginPercent) : null,
    notes:              itemForm.notes              || null,
    sortOrder,
    createdAt:          new Date(),
});
