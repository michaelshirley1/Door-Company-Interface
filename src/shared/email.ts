export interface QuoteEmailArgs {
    toEmail?: string | null;
    quoteNumber: string;
    customerName: string;
}

export function openQuoteEmail({ toEmail, quoteNumber, customerName }: QuoteEmailArgs): void {
    const subject = `Quote ${quoteNumber} — DoorStop`;
    const body = [
        `Hi ${customerName || 'there'},`,
        '',
        `Please find attached your quote ${quoteNumber} from DoorStop.`,
        '',
        '(The quote PDF has just been downloaded — please attach it to this email before sending.)',
        '',
        'Let us know if you have any questions.',
        '',
        'Thanks,',
        'DoorStop',
    ].join('\n');

    const params = new URLSearchParams({ subject, body });
    const mailto = `mailto:${toEmail ?? ''}?${params.toString().replace(/\+/g, '%20')}`;
    window.location.href = mailto;
}
