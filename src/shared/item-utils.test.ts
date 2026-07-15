import { describe, expect, it } from 'vitest';
import { priceQuoteItem, priceQuoteItemBreakdown } from './item-utils';
import { DoorType } from '../pages/side-pages/door-types/model';
import { JambType, JambRequirement } from '../pages/side-pages/jamb-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { DEFAULT_MARGIN_PERCENT } from './constants';

const doorType: DoorType = {
    id: 1,
    name: 'Test Door',
    leafType: null,
    material: 'Timber',
    productRange: null,
    skinThickness: null,
    colour: null,
    labourCost: 40,
    description: null,
    notes: null,
    isCavityOnly: false,
    isActive: true,
    prices: [
        { id: 1, doorTypeId: 1, configuration: null, jamb: null, priceFor: null, heightMm: 1980, widthMm: 810, thicknessMm: 35, price: 200, isPOA: false },
    ],
    createdAt: '2026-01-01',
};

const jambType: JambType = {
    id: 1,
    name: 'Test Jamb',
    description: null,
    supplier: null,
    colour: null,
    labourCost: 15,
    costPerMetre: 10,
    profileSize: null,
    rebateGroove: null,
    code: null,
    price: 0,
    isActive: true,
    createdAt: '2026-01-01',
};

const jambRequirements: JambRequirement[] = [
    { id: 1, unitType: 'Single', heightMm: 1980, metresRequired: 5 },
];

const handleType: HandleType = {
    id: 1,
    name: 'Lever',
    finish: null,
    mechanism: null,
    description: null,
    supplier: null,
    colour: null,
    labourCost: 5,
    isActive: true,
    price: 30,
    createdAt: '2026-01-01',
};

const hingeType: HingeType = {
    id: 1,
    name: 'Butt',
    finish: null,
    sizeMm: null,
    description: null,
    supplier: null,
    colour: null,
    labourCost: 2,
    isActive: true,
    price: 8,
    createdAt: '2026-01-01',
};

const baseArgs = {
    doorTypes: [doorType],
    doorTypeId: '1',
    heightMm: '1980',
    widthMm: '810',
    thicknessMm: '35',
    configuration: 'Single',
    itemType: 'Prehung',
    handleTypes: [handleType],
    handleTypeId: '1',
    jambTypes: [jambType],
    jamId: 'Test Jamb',
    jambRequirements,
    hingeTypes: [hingeType],
    hingeTypeId: '1',
    hingeCount: '3',
};

describe('priceQuoteItemBreakdown', () => {
    it('includes every component price AND its labour cost in the cost subtotal', () => {
        const b = priceQuoteItemBreakdown(baseArgs);

        expect(b.doorPrice).toBe(200);
        expect(b.doorLabour).toBe(40);
        expect(b.jambPrice).toBe(50);
        expect(b.jambLabour).toBe(15);
        expect(b.handlePrice).toBe(30);
        expect(b.handleLabour).toBe(5);
        expect(b.hingePrice).toBe(24);
        expect(b.hingeLabour).toBe(6);
        expect(b.cost).toBe(370);
    });

    it('applies the default margin on top of cost when none is specified', () => {
        const b = priceQuoteItemBreakdown(baseArgs);

        expect(b.marginPercent).toBe(DEFAULT_MARGIN_PERCENT);
        expect(b.total).toBeCloseTo(370 * (1 + DEFAULT_MARGIN_PERCENT / 100), 5);
    });

    it('applies a custom margin override instead of the default', () => {
        const b = priceQuoteItemBreakdown({ ...baseArgs, marginPercent: 10 });

        expect(b.marginPercent).toBe(10);
        expect(b.total).toBeCloseTo(370 * 1.1, 5);
    });

    it('produces a cost with no margin markup when marginPercent is 0', () => {
        const b = priceQuoteItemBreakdown({ ...baseArgs, marginPercent: 0 });

        expect(b.total).toBe(b.cost);
    });
});

describe('priceQuoteItem', () => {
    it('returns the marked-up total, formatted to 2 decimals', () => {
        expect(priceQuoteItem(baseArgs)).toBe((370 * 1.25).toFixed(2));
    });

    it('returns an empty string when no door type is selected', () => {
        expect(priceQuoteItem({ ...baseArgs, doorTypeId: '' })).toBe('');
    });
});
