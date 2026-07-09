/**
 * Distinct non-empty values of one property across a list, for filter dropdowns.
 * Matches the previous inline pattern:
 * `[...new Set(items.map(i => i[key]))].filter(Boolean).sort()`
 * (numbers are sorted numerically, everything else like Array.prototype.sort's default).
 * Pass `sort = false` to keep insertion order (used by the doors page filters).
 */
export function distinctValues<T, K extends keyof T>(items: T[], key: K, sort = true): NonNullable<T[K]>[] {
    const values = [...new Set(items.map(item => item[key]))].filter(Boolean) as NonNullable<T[K]>[];
    if (sort) {
        values.sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') return a - b;
            const sa = String(a), sb = String(b);
            return sa < sb ? -1 : sa > sb ? 1 : 0;
        });
    }
    return values;
}
