export function formatCurrency(v?: number | null): string {
    return v != null ? `$${Number(v).toFixed(2)}` : '—';
}

export function formatCompactCurrency(v?: number | null): string {
    if (v == null) return '—';
    const sign = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
    return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}
