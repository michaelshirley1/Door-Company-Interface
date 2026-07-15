import { Invoice } from '../main-pages/invoices/model';
import { Quote } from '../main-pages/quotes/model';
import { PurchaseOrder } from '../main-pages/orders/model';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MonthlyRevenuePoint {
    key: string;
    label: string;
    value: number;
}

export function monthlyRevenue(invoices: Invoice[], months = 6): MonthlyRevenuePoint[] {
    const now = new Date();
    const buckets: MonthlyRevenuePoint[] = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], value: 0 });
    }
    const byKey = new Map(buckets.map(b => [b.key, b]));
    for (const inv of invoices) {
        if (!inv.issuedAt) continue;
        const d = new Date(inv.issuedAt);
        const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
        if (bucket) bucket.value += inv.total;
    }
    return buckets;
}

export function revenueThisMonth(points: MonthlyRevenuePoint[]): { current: number; deltaPct: number | null } {
    const current = points[points.length - 1]?.value ?? 0;
    const previous = points[points.length - 2]?.value ?? 0;
    if (previous <= 0) return { current, deltaPct: null };
    return { current, deltaPct: ((current - previous) / previous) * 100 };
}

export function outstandingTotal(invoices: Invoice[]): { total: number; overdueCount: number } {
    let total = 0;
    let overdueCount = 0;
    for (const inv of invoices) {
        if (inv.status === 'Paid' || inv.status === 'Void' || inv.status === 'Draft') continue;
        total += inv.total - inv.amountPaid;
        if (inv.status === 'Overdue') overdueCount++;
    }
    return { total, overdueCount };
}

export function openQuoteCount(quotes: Quote[]): number {
    return quotes.filter(q => q.status === 'Sent').length;
}

export function openOrderCount(orders: PurchaseOrder[]): number {
    return orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
}
