import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderItem } from '../pages/main-pages/jobs/model';
import { PurchaseOrder } from '../pages/main-pages/orders/model';
import { DoorType } from '../pages/side-pages/door-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';
import { JambType, JambRequirement } from '../pages/side-pages/jamb-types/model';
import { CavitySliderType } from '../pages/side-pages/cavity-sliders/model';
import { TrackType } from '../pages/side-pages/track-types/model';
import { metresRequired } from '../shared/jamb-utils';
import { hingeSetsForConfig } from '../shared/constants';
import { drawDocHeader, drawFooterBar, DARK, LIGHT, BORDER } from './jobPdf';

export interface ProductionPdfDeps {
    doorTypes: DoorType[];
    hingeTypes: HingeType[];
    handleTypes: HandleType[];
    jambTypes: JambType[];
    jambRequirements: JambRequirement[];
    cavitySliderTypes: CavitySliderType[];
    trackTypes: TrackType[];
}

const supplierSuffix = (supplier?: string | null) => supplier ? ` (${supplier})` : '';

function describeJamb(item: OrderItem, deps: ProductionPdfDeps): string {
    if (!item.jam) return '—';
    const jt = deps.jambTypes.find(j => j.name === item.jam);
    if (!jt) return item.jam;
    const metres = metresRequired(item.doorConfiguration, item.heightMm ?? null, deps.jambRequirements);
    const parts = [jt.name];
    if (jt.profileSize) parts.push(jt.profileSize);
    if (metres) parts.push(`${metres}m`);
    return parts.join(' — ') + supplierSuffix(jt.supplier);
}

function describeHinges(item: OrderItem, deps: ProductionPdfDeps): string {
    if (!item.hingeTypeId || !item.hingeCount) return '—';
    const ht = deps.hingeTypes.find(h => h.id === item.hingeTypeId);
    if (!ht) return '—';
    const sets = hingeSetsForConfig(item.doorConfiguration);
    const total = item.hingeCount * sets;
    const setsNote = sets > 1 ? ` (${item.hingeCount}/leaf × ${sets} sets)` : '';
    return `${total} × ${ht.name}${ht.finish ? ` (${ht.finish})` : ''}${setsNote}${supplierSuffix(ht.supplier)}`;
}

function describeTrack(item: OrderItem, deps: ProductionPdfDeps): string {
    if (item.trackTypeId) {
        const tt = deps.trackTypes.find(t => t.id === item.trackTypeId);
        if (tt) return `${tt.trackSystem} — ${tt.trackTypeName}${tt.colour ? ` — ${tt.colour}` : ''}${supplierSuffix(tt.supplier)}`;
    }
    if (item.trackSystem || item.trackType) return [item.trackSystem, item.trackType].filter(Boolean).join(' — ');
    return '—';
}

function describeDoor(item: OrderItem, deps: ProductionPdfDeps): string {
    const dt = deps.doorTypes.find(d => d.id === item.doorTypeId);
    if (!dt) return item.itemType;
    return `${dt.name}${item.colourFinish ? ` — ${item.colourFinish}` : dt.colour ? ` — ${dt.colour}` : ''}`;
}

function describeSupplierLine(item: OrderItem, deps: ProductionPdfDeps): string {
    const suppliers = new Set<string>();
    const cs = deps.cavitySliderTypes.find(c => c.id === item.cavitySliderTypeId);
    if (cs?.supplier) suppliers.add(cs.supplier);
    const tt = deps.trackTypes.find(t => t.id === item.trackTypeId);
    if (tt?.supplier) suppliers.add(tt.supplier);
    const jt = deps.jambTypes.find(j => j.name === item.jam);
    if (jt?.supplier) suppliers.add(jt.supplier);
    const ht = deps.hingeTypes.find(h => h.id === item.hingeTypeId);
    if (ht?.supplier) suppliers.add(ht.supplier);
    return suppliers.size > 0 ? `Suppliers: ${Array.from(suppliers).join(', ')}` : '';
}

export function generateProductionPdf(order: PurchaseOrder, deps: ProductionPdfDeps): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const items = order.quote?.items ?? [];
    const today = new Date().toLocaleDateString('en-NZ');
    const docNum = order.poNumber ?? `PO-${order.id}`;

    const tableTop = drawDocHeader(doc, {
        docLabel: 'Production Docket',
        docNumber: docNum,
        infoRows: [
            ['Job-Order:', order.jobNumber ?? docNum],
            ['Date:',      today],
            ['For:',       order.customerName],
        ],
        deliveryAddress: order.siteAddress ?? order.siteDescription ?? '—',
        descriptionLabel: 'Specification:',
    });

    autoTable(doc, {
        startY: tableTop,
        head: [['#', 'Room', 'Config', 'Door', 'Size (H×W×T)', 'Hand', 'Jamb', 'Hinges', 'Track', 'Qty', 'Notes']],
        body: items.map((item, i) => {
            const size = [item.heightMm, item.widthMm, item.thicknessMm].filter(Boolean).join('×');
            const supplierLine = describeSupplierLine(item, deps);
            const notes = [item.notes, supplierLine].filter(Boolean).join('\n');
            return [
                String(i + 1) + '.',
                item.room ?? '',
                item.doorConfiguration ?? '—',
                describeDoor(item, deps),
                size || '—',
                item.handSide ?? '—',
                describeJamb(item, deps),
                describeHinges(item, deps),
                describeTrack(item, deps),
                String(item.quantity ?? 1),
                notes || '—',
            ];
        }),
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2.5, valign: 'top', lineColor: BORDER, lineWidth: 0.1 },
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: {
            0: { cellWidth: 7 },
            9: { cellWidth: 10, halign: 'right' },
        },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 10, right: 10 },
    });

    drawFooterBar(doc);
    doc.save(`${docNum}-production.pdf`);
}
