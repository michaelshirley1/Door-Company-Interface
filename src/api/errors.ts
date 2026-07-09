export function getApiErrorMessage(err: unknown): string {
    const e = err as { response?: { data?: unknown }; message?: string };
    const detail = e?.response?.data;
    if (typeof detail === 'string') return detail;
    return (detail as { title?: string })?.title
        ?? (detail as { message?: string })?.message
        ?? e?.message
        ?? 'Unknown error';
}
