import * as XLSX from 'xlsx';
import { STANDARD_WIDTHS } from './constants';

export interface ImportedPriceRow {
    configuration?: string | null;
    jamb?: string | null;
    priceFor?: 'Prehung' | 'Leaf' | null;
    heightMm: number;
    widthMm: number;
    thicknessMm: number;
    price: number | null;
    isPOA: boolean;
}

const HEADER_ALIASES: Record<string, string[]> = {
    configuration: ['configuration', 'config'],
    jamb: ['jamb'],
    priceFor: ['pricefor', 'price for'],
    height: ['heightmm', 'height', 'height / range'],
    width: ['widthmm', 'width', 'width / size'],
    thickness: ['thicknessmm', 'thickness', 'price option'],
    price: ['price', 'price ex gst'],
    priceStatus: ['pricestatus', 'price status', 'isPOA'.toLowerCase()],
};

const normalizeHeader = (h: string) => h.trim().toLowerCase();

const findKey = (row: Record<string, unknown>, aliases: string[]): string | undefined => {
    const keys = Object.keys(row);
    return keys.find(k => aliases.includes(normalizeHeader(k)));
};

const firstNumber = (value: unknown): number | null => {
    const match = String(value ?? '').match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
};

const expandWidths = (raw: unknown): number[] => {
    const text = String(raw ?? '').replace(/mm/gi, '').trim();
    const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        const lo = parseInt(rangeMatch[1]);
        const hi = parseInt(rangeMatch[2]);
        const inRange = STANDARD_WIDTHS.filter(w => w >= lo && w <= hi);
        return inRange.length > 0 ? inRange : [lo];
    }
    const single = firstNumber(text);
    return single ? [single] : [];
};

export async function parsePriceWorkbook(file: File): Promise<ImportedPriceRow[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const rows: ImportedPriceRow[] = [];

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        for (const raw of json) {
            const heightKey = findKey(raw, HEADER_ALIASES.height);
            const widthKey = findKey(raw, HEADER_ALIASES.width);
            const priceKey = findKey(raw, HEADER_ALIASES.price);
            const thicknessKey = findKey(raw, HEADER_ALIASES.thickness);
            const statusKey = findKey(raw, HEADER_ALIASES.priceStatus);
            const configKey = findKey(raw, HEADER_ALIASES.configuration);
            const jambKey = findKey(raw, HEADER_ALIASES.jamb);
            const priceForKey = findKey(raw, HEADER_ALIASES.priceFor);

            if (!heightKey || !widthKey) continue;

            const height = firstNumber(raw[heightKey]);
            if (!height) continue;

            const status = statusKey ? String(raw[statusKey]).trim().toLowerCase() : '';
            if (status === 'not listed') continue;

            const isPOA = status === 'poa' || status === 'true';
            const priceRaw = priceKey ? raw[priceKey] : undefined;
            const price = isPOA ? null : firstNumber(priceRaw);
            if (!isPOA && price === null) continue;

            const thickness = thicknessKey ? (firstNumber(raw[thicknessKey]) ?? 35) : 35;
            const widths = expandWidths(raw[widthKey]);

            for (const width of widths) {
                rows.push({
                    configuration: configKey ? (String(raw[configKey]).trim() || null) : null,
                    jamb: jambKey ? (String(raw[jambKey]).trim() || null) : null,
                    priceFor: priceForKey ? (String(raw[priceForKey]).trim() as 'Prehung' | 'Leaf' || null) : null,
                    heightMm: height,
                    widthMm: width,
                    thicknessMm: thickness,
                    price,
                    isPOA,
                });
            }
        }
    }

    return rows;
}

export function exportPricesToWorkbook(doorTypeName: string, entries: ImportedPriceRow[]): void {
    const bySheet = new Map<number, ImportedPriceRow[]>();
    for (const entry of entries) {
        const list = bySheet.get(entry.heightMm) ?? [];
        list.push(entry);
        bySheet.set(entry.heightMm, list);
    }

    const workbook = XLSX.utils.book_new();
    const sheetEntries = bySheet.size > 0 ? bySheet.entries() : [[0, entries]] as unknown as IterableIterator<[number, ImportedPriceRow[]]>;
    for (const [height, rows] of sheetEntries) {
        const data = rows.map(r => ({
            Configuration: r.configuration ?? '',
            Jamb: r.jamb ?? '',
            PriceFor: r.priceFor ?? '',
            HeightMm: r.heightMm,
            WidthMm: r.widthMm,
            ThicknessMm: r.thicknessMm,
            Price: r.price ?? '',
            'Price Status': r.isPOA ? 'POA' : 'Priced',
        }));
        const sheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, sheet, height ? String(height) : 'Prices');
    }

    XLSX.writeFile(workbook, `${doorTypeName.replace(/[^a-z0-9]+/gi, '_')}_prices.xlsx`);
}
