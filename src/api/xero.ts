import client from './client';

export interface XeroStatus {
    connected: boolean;
    tenantName: string | null;
}

export interface XeroPushResult {
    success: boolean;
    invoiceId: string | null;
    invoiceNumber: string | null;
    error: string | null;
}

export const getXeroStatus = (): Promise<XeroStatus> =>
    client.get('/xero/status').then(r => r.data);

export const disconnectXero = (): Promise<void> =>
    client.post('/xero/disconnect').then(() => undefined);

export const pushInvoiceToXero = (quoteId: number): Promise<XeroPushResult> =>
    client.post(`/xero/push-invoice/${quoteId}`).then(r => r.data);

export const getXeroConnectUrl = (): string => {
    const base = (client.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}/xero/connect`;
};
