export function formatCurrency(v?: number | null): string {
    return v != null ? `$${Number(v).toFixed(2)}` : '—';
}

export function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}
