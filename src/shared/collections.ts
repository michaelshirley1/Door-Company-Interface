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
