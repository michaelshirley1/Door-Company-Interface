import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderItem } from '../pages/main-pages/jobs/model';
import { Quote } from '../pages/main-pages/quotes/model';
import { PurchaseOrder } from '../pages/main-pages/orders/model';
import { DoorType } from '../pages/side-pages/door-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';
import { formatCurrency } from '../shared/format';

export interface PdfDeps {
    doorTypes: DoorType[];
    hingeTypes: HingeType[];
    handleTypes: HandleType[];
}

function buildDescription(item: OrderItem, deps: PdfDeps): string {
    const lines: string[] = [];

    if (item.itemType === 'Prehung' || item.itemType === 'DoorLeaf') {
        if (item.doorConfiguration) lines.push(`Config: ${item.doorConfiguration}`);
        const door = deps.doorTypes.find(d => d.id === item.doorTypeId);
        if (door) {
            const dims = [item.heightMm, item.widthMm, item.thicknessMm].filter(Boolean).join('x');
            lines.push(`Door: ${door.name}${dims ? ` ${dims}` : ''}`);
        }
        if (item.jam)      lines.push(`Jamb: ${item.jam}`);
        lines.push(`Drilling: ${item.drilling ? (item.drillSize ?? 'Yes') : 'None'}`);
        if (item.handSide)    lines.push(`Hanging: ${item.handSide} Hand`);
        if (item.glazing)      lines.push(`Glazing: ${item.glazing}`);
        if (item.fireRating)   lines.push(`Fire Rating: ${item.fireRating}`);
        if (item.trackSystem)  lines.push(`Track System: ${item.trackSystem}`);
        if (item.trackType)    lines.push(`Track Type: ${item.trackType}`);
        if (item.notes)        lines.push(`Notes: ${item.notes}`);
    } else {
        if (item.notes)    lines.push(item.notes);
        else               lines.push(item.itemType);
    }

    return lines.join('\n');
}

export const COMPANY_NAME = 'DoorStop';
export const GST_RATE     = 0.15;

export const DARK   = [26,  26,  46]  as [number, number, number];
export const LIGHT  = [250, 250, 250] as [number, number, number];
export const BORDER = [200, 200, 200] as [number, number, number];

export function drawDocHeader(
    doc: jsPDF,
    opts: {
        docLabel: string;
        docNumber: string;
        infoRows: [string, string][];
        deliveryAddress: string;
        descriptionLabel?: string;
    },
): number {
    const pw = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(COMPANY_NAME, 14, 20);

    doc.setFontSize(18);
    doc.text(`${opts.docLabel}: ${opts.docNumber}`, pw - 14, 20, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const addrLines = ['PO Box 12653', 'Penrose', 'Auckland 1642', 'Phone: 09 000 0000'];
    addrLines.forEach((line, i) => doc.text(line, 14, 27 + i * 4));

    const rightX = pw - 14;
    opts.infoRows.forEach(([label, value], i) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(label, rightX - 55, 27 + i * 4);
        doc.setFont('helvetica', 'normal');
        doc.text(value, rightX, 27 + i * 4, { align: 'right' });
    });

    const boxY = 48;
    doc.setDrawColor(...BORDER);
    doc.rect(pw / 2, boxY, pw / 2 - 14, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text('Delivery Address:', pw / 2 + 2, boxY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(opts.deliveryAddress, pw / 2 + 2, boxY + 8, { maxWidth: pw / 2 - 18 });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(opts.descriptionLabel ?? 'Description:', 14, boxY + 4);

    return 68;
}

export function drawFooterBar(doc: jsPDF): void {
    const pw = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...DARK);
    doc.rect(0, pageH - 10, pw, 10, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Page 1 of 1', pw - 14, pageH - 4, { align: 'right' });
}

export function drawSignatureBlock(doc: jsPDF, y: number, heading: string): number {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(heading, 14, y);

    const lineY = y + 14;
    const colWidth = (pw - 28) / 3;
    const labels: [string, number][] = [['Name', 0], ['Signature', 1], ['Date', 2]];
    doc.setDrawColor(...BORDER);
    labels.forEach(([label, col]) => {
        const x = 14 + col * colWidth;
        doc.line(x, lineY, x + colWidth - 10, lineY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(label, x, lineY + 4);
    });

    return lineY + 12;
}

export function generateQuotePdf(quote: Quote, deps: PdfDeps): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();

    const items    = quote.items ?? [];
    const subtotal = items.reduce((sum, i) => sum + (i.quantity ?? 1) * (i.unitPrice ?? 0), 0);
    const gst      = subtotal * GST_RATE;
    const total    = subtotal + gst;

    const today  = new Date().toLocaleDateString('en-NZ');
    const docNum = quote.quoteNumber;

    const tableTop = drawDocHeader(doc, {
        docLabel: 'Estimate',
        docNumber: docNum,
        infoRows: [
            ['Job-Order:',        quote.jobNumber ? `${quote.jobNumber} - 1` : docNum],
            ['Date:',             today],
            ['Estimate To:',      quote.customerName],
            ['Client Ref:',       quote.createdBy ?? '—'],
            ['Proposed Dispatch:', '—'],
        ],
        deliveryAddress: quote.siteAddress ?? quote.notes ?? '—',
    });

    autoTable(doc, {
        startY: tableTop,
        head: [['#', 'Room', 'Description', 'Quantity', 'Unit Rate', 'Amount']],
        body: items.map((item, i) => {
            const qty    = item.quantity ?? 1;
            const rate   = item.unitPrice ?? 0;
            const amount = qty * rate;
            return [
                String(i + 1) + '.',
                item.room ?? '',
                buildDescription(item, deps),
                qty.toFixed(3),
                rate.toFixed(2),
                amount.toFixed(2),
            ];
        }),
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 3, valign: 'top', lineColor: BORDER, lineWidth: 0.1 },
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 8,  halign: 'left' },
            1: { cellWidth: 18 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 22, halign: 'right' },
            4: { cellWidth: 22, halign: 'right' },
            5: { cellWidth: 22, halign: 'right' },
        },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14, right: 14 },
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    const totalsX = pw - 14;
    const labelX  = totalsX - 50;

    const totalsRows: [string, string][] = [
        ['Sub Total:',   formatCurrency(subtotal)],
        [`GST ${Math.round(GST_RATE * 100)}%:`, formatCurrency(gst)],
        ['Order Total:', formatCurrency(total)],
    ];

    totalsRows.forEach(([label, value], i) => {
        const y = finalY + i * 6;
        doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(label, labelX, y, { align: 'right' });
        doc.text(value, totalsX, y, { align: 'right' });
    });

    const sigY = drawSignatureBlock(doc, finalY + 26, 'Quote accepted');

    const condY = sigY + 8;
    doc.setDrawColor(...BORDER);
    doc.line(14, condY - 2, pw - 14, condY - 2);

    const conditions = [
        'CONDITIONS OF SALE - STANDARD TERMS AND CONDITIONS AS PER YOUR APPLICATION FOR CREDIT',
        'PAYMENT TERMS: 20TH MONTH FOLLOWING - EXCLUDING CASH SALES',
        'Delivery discrepancies or damage to be notified within 48 hours of receipt of goods.',
        'No claims will be accepted after this period. This estimate only valid for 30 days from estimate date.',
    ];
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    conditions.forEach((line, i) => doc.text(line, 14, condY + i * 3.5));

    drawFooterBar(doc);

    doc.save(`${docNum}.pdf`);
}

export function generateDispatchPdf(order: PurchaseOrder, deps: PdfDeps): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const items = order.quote?.items ?? [];
    const today = new Date().toLocaleDateString('en-NZ');
    const docNum = order.poNumber ?? `PO-${order.id}`;

    const tableTop = drawDocHeader(doc, {
        docLabel: 'Dispatch Docket',
        docNumber: docNum,
        infoRows: [
            ['Job-Order:',   order.jobNumber ?? docNum],
            ['Date:',        today],
            ['Dispatch To:', order.customerName],
            ['Expected Delivery:', order.expectedDelivery ?? '—'],
        ],
        deliveryAddress: order.siteAddress ?? order.siteDescription ?? '—',
    });

    autoTable(doc, {
        startY: tableTop,
        head: [['#', 'Room', 'Description', 'Quantity']],
        body: items.map((item, i) => [
            String(i + 1) + '.',
            item.room ?? '',
            buildDescription(item, deps),
            (item.quantity ?? 1).toFixed(3),
        ]),
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 3, valign: 'top', lineColor: BORDER, lineWidth: 0.1 },
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 8,  halign: 'left' },
            1: { cellWidth: 22 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 24, halign: 'right' },
        },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14, right: 14 },
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    drawSignatureBlock(doc, finalY, 'Goods received');
    drawFooterBar(doc);

    doc.save(`${docNum}-dispatch.pdf`);
}
