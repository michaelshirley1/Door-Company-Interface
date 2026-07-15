import React, { useEffect, useState } from 'react';
import { Product, ProductComponent, ComponentType } from '../model';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { getDoorTypes } from '../../door-types/api';
import { getJambTypes } from '../../jamb-types/api';
import { getHingeTypes } from '../../hinge-types/api';
import { getHandleTypes } from '../../handle-types/api';
import { getCavitySliders } from '../../cavity-sliders/api';
import { getTrackTypes } from '../../track-types/api';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import { Status } from '../../../../components/status';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import { TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { useCatalogCrud } from '../../../../hooks/useCatalogCrud';
import { ProductCatalogs, componentName, componentUnitCost, productTotalCost } from '../../../../shared/product-utils';
import { formatCurrency } from '../../../../shared/format';
import { DOOR_CONFIGS, STANDARD_HEIGHTS, STANDARD_WIDTHS } from '../../../../shared/constants';
import Loading from '../../../../components/loading';

const COMPONENT_TYPES: ComponentType[] = ['DoorType', 'JambType', 'HingeType', 'HandleType', 'CavitySliderType', 'TrackType', 'Custom'];

const blankForm = () => ({ name: '', description: '', labourCost: '', isActive: 'true', components: [] as ProductComponent[] });

const blankComponentDraft = () => ({
    componentType: 'DoorType' as ComponentType, componentId: '', customName: '', customPrice: '', quantity: '1',
    configuration: '', heightMm: '1980', widthMm: '810', thicknessMm: '35',
});

const ProductsTab: React.FC = () => {
    const [catalogs, setCatalogs] = useState<ProductCatalogs>({
        doorTypes: [], jambTypes: [], hingeTypes: [], handleTypes: [], cavitySliderTypes: [], trackTypes: [],
    });
    const [catalogsLoading, setCatalogsLoading] = useState(true);
    const [draft, setDraft] = useState(blankComponentDraft());

    useEffect(() => {
        Promise.all([
            getDoorTypes(), getJambTypes(), getHingeTypes(), getHandleTypes(), getCavitySliders(), getTrackTypes(),
        ]).then(([doorTypes, jambTypes, hingeTypes, handleTypes, cavitySliderTypes, trackTypes]) => {
            setCatalogs({ doorTypes, jambTypes, hingeTypes, handleTypes, cavitySliderTypes, trackTypes });
        }).finally(() => setCatalogsLoading(false));
    }, []);

    const {
        items: products, loading, modalOpen, editing, form, setForm,
        openNew, openEdit, closeModal, handleChange, handleSave, handleDelete,
    } = useCatalogCrud<Product, ReturnType<typeof blankForm>>({
        fetchAll: getProducts,
        create: createProduct,
        update: updateProduct,
        remove: deleteProduct,
        blankForm,
        toForm: p => ({
            name: p.name,
            description: p.description ?? '',
            labourCost: p.labourCost?.toString() ?? '',
            isActive: String(p.isActive),
            components: p.components ?? [],
        }),
        toPayload: f => ({
            name: f.name,
            description: f.description || null,
            labourCost: f.labourCost ? parseFloat(f.labourCost) : null,
            isActive: f.isActive === 'true',
            components: f.components.map(c => ({
                componentType: c.componentType,
                componentId: c.componentId ?? null,
                customName: c.customName ?? null,
                customPrice: c.customPrice ?? null,
                quantity: c.quantity,
                configuration: c.configuration ?? null,
                heightMm: c.heightMm ?? null,
                widthMm: c.widthMm ?? null,
                thicknessMm: c.thicknessMm ?? null,
            })),
        }),
        getId: p => p.id,
        onClose: () => setDraft(blankComponentDraft()),
    });

    const catalogOptionsFor = (type: ComponentType) => {
        switch (type) {
            case 'DoorType': return catalogs.doorTypes.map(d => ({ id: d.id, label: d.name }));
            case 'JambType': return catalogs.jambTypes.map(j => ({ id: j.id, label: j.name }));
            case 'HingeType': return catalogs.hingeTypes.map(h => ({ id: h.id, label: h.name }));
            case 'HandleType': return catalogs.handleTypes.map(h => ({ id: h.id, label: h.name }));
            case 'CavitySliderType': return catalogs.cavitySliderTypes.map(c => ({ id: c.id, label: c.productSystem }));
            case 'TrackType': return catalogs.trackTypes.map(t => ({ id: t.id, label: t.trackSystem }));
            default: return [];
        }
    };

    const handleAddComponent = () => {
        if (draft.componentType === 'Custom' && !draft.customName) return;
        if (draft.componentType !== 'Custom' && !draft.componentId) return;
        const isDoor = draft.componentType === 'DoorType';
        const component: ProductComponent = {
            id: 0,
            productId: editing?.id ?? 0,
            componentType: draft.componentType,
            componentId: draft.componentType === 'Custom' ? null : parseInt(draft.componentId),
            customName: draft.componentType === 'Custom' ? draft.customName : null,
            customPrice: draft.componentType === 'Custom' && draft.customPrice ? parseFloat(draft.customPrice) : null,
            quantity: parseInt(draft.quantity) || 1,
            configuration: isDoor ? (draft.configuration || null) : null,
            heightMm: isDoor ? parseInt(draft.heightMm) : null,
            widthMm: isDoor ? parseInt(draft.widthMm) : null,
            thicknessMm: isDoor ? parseInt(draft.thicknessMm) : null,
        };
        setForm(prev => ({ ...prev, components: [...prev.components, component] }));
        setDraft(blankComponentDraft());
    };

    const handleRemoveComponent = (idx: number) =>
        setForm(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== idx) }));

    const headers: HeaderItem<Product>[] = [
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'components', title: 'Components', render: (_, p) => p.components?.length ?? 0 },
        { id: 'labourCost', title: 'Total Cost', render: (_, p) => formatCurrency(productTotalCost(p, catalogs)) },
        { id: 'isActive', title: 'Active', render: (_, p) => <Status content={p.isActive ? 'Active' : 'Inactive'} type={p.isActive ? 'good' : 'warn'} /> },
    ];

    if (loading || catalogsLoading) return <Loading />;

    const draftTotal = productTotalCost({ components: form.components, labourCost: form.labourCost ? parseFloat(form.labourCost) : null }, catalogs);

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={openNew}>New Product</Button>
            </div>

            <Table
                headers={headers}
                rows={products}
                onRowClick={openEdit}
                emptyMessage="No products bundled yet."
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? `Edit ${editing.name}` : 'New Product'}
                onConfirm={handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. 1980 Hollowcore Single Prehung Kit" />
                    <SelectField label="Active" name="isActive" value={form.isActive} onChange={handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} />
                <div className="form-row">
                    <TextField label="Product Labour Cost" type="number" name="labourCost" value={form.labourCost} onChange={handleChange} placeholder="0.00" />
                </div>

                <div className="pricing-matrix">
                    <label>Components</label>
                    <table className="pricing-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Unit Cost</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.components.map((c, i) => (
                                <tr key={i}>
                                    <td>{c.componentType}</td>
                                    <td>{componentName(c, catalogs)}</td>
                                    <td>{c.quantity}</td>
                                    <td>{formatCurrency(componentUnitCost(c, catalogs))}</td>
                                    <td><Button variant="danger" onClick={() => handleRemoveComponent(i)}>Remove</Button></td>
                                </tr>
                            ))}
                            <tr className="pricing-add-row">
                                <td>
                                    <select value={draft.componentType} onChange={e => setDraft(prev => ({ ...prev, componentType: e.target.value as ComponentType, componentId: '' }))}>
                                        {COMPONENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </td>
                                <td>
                                    {draft.componentType === 'Custom' ? (
                                        <input placeholder="Custom item name" value={draft.customName} onChange={e => setDraft(prev => ({ ...prev, customName: e.target.value }))} />
                                    ) : (
                                        <select value={draft.componentId} onChange={e => setDraft(prev => ({ ...prev, componentId: e.target.value }))}>
                                            <option value="">Select...</option>
                                            {catalogOptionsFor(draft.componentType).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                        </select>
                                    )}
                                    {draft.componentType === 'Custom' && (
                                        <input type="number" placeholder="Custom price" value={draft.customPrice} onChange={e => setDraft(prev => ({ ...prev, customPrice: e.target.value }))} className="input-below" />
                                    )}
                                    {draft.componentType === 'DoorType' && (
                                        <div className="door-component-draft">
                                            <select value={draft.configuration} onChange={e => setDraft(prev => ({ ...prev, configuration: e.target.value }))}>
                                                <option value="">Bare leaf (no config)</option>
                                                {DOOR_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={draft.heightMm} onChange={e => setDraft(prev => ({ ...prev, heightMm: e.target.value }))}>
                                                {STANDARD_HEIGHTS.map(h => <option key={h} value={h}>{h}mm</option>)}
                                            </select>
                                            <select value={draft.widthMm} onChange={e => setDraft(prev => ({ ...prev, widthMm: e.target.value }))}>
                                                {STANDARD_WIDTHS.map(w => <option key={w} value={w}>{w}mm</option>)}
                                            </select>
                                            <select value={draft.thicknessMm} onChange={e => setDraft(prev => ({ ...prev, thicknessMm: e.target.value }))}>
                                                <option value="35">35mm Standard</option>
                                                <option value="37">37mm Deluxe</option>
                                            </select>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <input type="number" min="1" value={draft.quantity} onChange={e => setDraft(prev => ({ ...prev, quantity: e.target.value }))} />
                                </td>
                                <td colSpan={2}>
                                    <Button variant="secondary" onClick={handleAddComponent}>Add</Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="total-row">
                        <span className="total-row-label">ROLLED-UP TOTAL</span>
                        <span className="total-row-amount">{formatCurrency(draftTotal)}</span>
                    </div>
                </div>

                {editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={handleDelete}>Delete Product</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProductsTab;
