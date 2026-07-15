export const STANDARD_HEIGHTS = [1980, 2200, 2400];

export const STANDARD_WIDTHS = [360, 410, 460, 560, 610, 660, 710, 760, 810, 860, 910, 960, 1010, 1060];

export const DOOR_CONFIGS = [
    'Single',
    'Pair',
    '2 Slide',
    '3 Slide',
    '4 Slide',
    'Single Cavity',
    'Biparting Cavity',
    '2 Door Bifold',
    '4 Door Bifold',
    'Exterior Single',
    'Exterior Pair',
];

export const HINGED_CONFIGS = [
    'Single',
    'Pair',
    '2 Door Bifold',
    '4 Door Bifold',
    'Exterior Single',
    'Exterior Pair',
];

export const SLIDER_TRACK_CONFIGS: Record<string, 'Double Track' | 'Triple Track'> = {
    '3 Slide': 'Double Track',
    '4 Slide': 'Triple Track',
};

export const CAVITY_CONFIGS = ['Single Cavity', 'Biparting Cavity'];

export const DEFAULT_MARGIN_PERCENT = 25;

export const priceForKey = (itemType: string | null | undefined): string | null | undefined =>
    itemType === 'DoorLeaf' ? 'Leaf' : itemType;

export const leavesForConfig = (configuration: string | null | undefined): number => {
    switch (configuration) {
        case 'Pair':
        case 'Biparting Cavity':
        case '2 Slide':
        case 'Exterior Pair':
        case '2 Door Bifold':
            return 2;
        case '3 Slide':
            return 3;
        case '4 Slide':
        case '4 Door Bifold':
            return 4;
        default:
            return 1;
    }
};

export const hingeCountForHeight = (heightMm: number | null | undefined): number => {
    if (!heightMm) return 3;
    if (heightMm <= 1980) return 3;
    if (heightMm <= 2500) return 4;
    return 5;
};

export const hingeSetsForConfig = (configuration: string | null | undefined): number => {
    switch (configuration) {
        case '2 Door Bifold':
            return 1;
        case '4 Door Bifold':
            return 3;
        default:
            return leavesForConfig(configuration);
    }
};

export const isCavityDoorType = (name: string | null | undefined): boolean => {
    if (!name) return false;
    const n = name.toLowerCase();
    return n.includes('cavity') || n.includes('ulcd');
};

export const JOB_STATUSES = ['Scheduled', 'InProgress', 'OnHold', 'Completed', 'Cancelled'];

export const QUOTE_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];

export const ORDER_STATUSES = ['Received', 'Confirmed', 'InProduction', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'];

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Overdue', 'Void'];
