import React, { useEffect, useState } from 'react';
import Modal from '../../../../../components/modal';
import { FormField, TextField, SelectField, TextAreaField } from '../../../../../components/form-field';
import { blankItemForm, priceQuoteItem, priceQuoteItemBreakdown, activeOnly, buildOrderItem, itemToForm } from '../../../../../shared/item-utils';
import { STANDARD_WIDTHS, DOOR_CONFIGS, CAVITY_CONFIGS, HINGED_CONFIGS, SLIDER_TRACK_CONFIGS, hingeCountForHeight, isCavityDoorType } from '../../../../../shared/constants';
import { productTotalCost } from '../../../../../shared/product-utils';
import { useAuth } from '../../../../../auth/AuthContext';
import { QuoteItemModalProps } from './model';

const STANDARD_HEIGHTS = ['1980', '2200', '2400'];

const QuoteItemModal: React.FC<QuoteItemModalProps> = ({
    isOpen, sortOrder, doorTypes, hingeTypes, handleTypes, jambTypes, jambRequirements,
    cavitySliderTypes, trackTypes, products, defaultMarginPercent,
    editIndex, initialItem, onAdd, onClose,
}) => {
    const { isAdmin } = useAuth();
    const [itemForm, setItemForm] = useState(blankItemForm());
    const [productPickerId, setProductPickerId] = useState('');

    useEffect(() => {
        if (isOpen) {
            const jambNames = jambTypes.map(j => j.name);
            const form = initialItem ? itemToForm(initialItem, jambNames) : blankItemForm();
            setItemForm({ ...form, marginPercent: form.marginPercent || defaultMarginPercent.toString() });
            setProductPickerId('');
        }
    }, [isOpen, initialItem, jambTypes, defaultMarginPercent]);

    const handleClose = () => {
        setItemForm(blankItemForm());
        setProductPickerId('');
        onClose();
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setItemForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setItemForm({ ...blankItemForm(), itemType: e.target.value as typeof itemForm.itemType });

    const priceArgs = (form: typeof itemForm) => ({
        doorTypes,
        doorTypeId: form.doorTypeId,
        heightMm: form.heightMm,
        widthMm: form.widthMm,
        thicknessMm: form.thicknessMm,
        configuration: form.doorConfiguration,
        itemType: form.itemType,
        handleTypes,
        handleTypeId: form.handleTypeId,
        jambTypes,
        jamId: form.jam,
        jambRequirements,
        cavitySliderTypes,
        cavitySliderTypeId: form.cavitySliderTypeId,
        hingeTypes,
        hingeTypeId: form.hingeTypeId,
        hingeCount: form.hingeCount,
        trackTypes,
        trackTypeId: form.trackTypeId,
        marginPercent: form.marginPercent !== '' ? parseFloat(form.marginPercent) : defaultMarginPercent,
    });

    const recalcPrice = (form: typeof itemForm) => priceQuoteItem(priceArgs(form));

    const handleDoorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const doorTypeId = e.target.value;
        const dt = doorTypes.find(d => d.id === parseInt(doorTypeId));
        let updated = { ...itemForm, doorTypeId };

        const isCavityLeaf = dt && (dt.isCavityOnly || isCavityDoorType(dt.name));
        if (isCavityLeaf && !CAVITY_CONFIGS.includes(updated.doorConfiguration)) {
            updated = { ...updated, doorConfiguration: 'Single Cavity', thicknessMm: '37', cavitySliderTypeId: '', trackTypeId: '', hingeCount: '' };
        }

        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handleDoorDimensionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updated = { ...itemForm, [e.target.name]: e.target.value };
        if (e.target.name === 'heightMm' && HINGED_CONFIGS.includes(updated.doorConfiguration)) {
            updated.hingeCount = String(hingeCountForHeight(parseInt(e.target.value) || null));
        }
        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const config = e.target.value;
        const updated = { ...itemForm, doorConfiguration: config, cavitySliderTypeId: '', trackTypeId: '' };
        updated.thicknessMm = CAVITY_CONFIGS.includes(config) ? '37' : itemForm.thicknessMm;
        updated.hingeCount = HINGED_CONFIGS.includes(config) ? String(hingeCountForHeight(parseInt(updated.heightMm) || null)) : '';
        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handlePricingFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updated = { ...itemForm, [e.target.name]: e.target.value };
        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handleProductPick = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setProductPickerId(id);
        if (!id) return;
        const product = products.find(p => p.id === parseInt(id));
        if (!product) return;

        const doorComponent = product.components.find(c => c.componentType === 'DoorType');
        if (!doorComponent) {
            const total = productTotalCost(product, { doorTypes, jambTypes, hingeTypes, handleTypes, cavitySliderTypes, trackTypes });
            setItemForm(prev => ({
                ...prev,
                itemType: 'Misc',
                productId: id,
                notes: prev.notes || product.description || product.name,
                unitPrice: total > 0 ? total.toString() : prev.unitPrice,
            }));
            return;
        }

        const jambComponent = product.components.find(c => c.componentType === 'JambType');
        const hingeComponent = product.components.find(c => c.componentType === 'HingeType');
        const handleComponent = product.components.find(c => c.componentType === 'HandleType');
        const trackComponent = product.components.find(c => c.componentType === 'TrackType');
        const cavityComponent = product.components.find(c => c.componentType === 'CavitySliderType');
        const jamb = jambComponent ? jambTypes.find(j => j.id === jambComponent.componentId) : undefined;

        const updated = {
            ...itemForm,
            productId: id,
            itemType: (doorComponent.configuration ? 'Prehung' : 'DoorLeaf') as typeof itemForm.itemType,
            doorTypeId: doorComponent.componentId?.toString() ?? '',
            doorConfiguration: doorComponent.configuration ?? '',
            heightMm: doorComponent.heightMm?.toString() ?? itemForm.heightMm,
            widthMm: doorComponent.widthMm?.toString() ?? itemForm.widthMm,
            thicknessMm: doorComponent.thicknessMm?.toString() ?? itemForm.thicknessMm,
            jam: jamb?.name ?? itemForm.jam,
            hingeTypeId: hingeComponent?.componentId?.toString() ?? itemForm.hingeTypeId,
            hingeCount: hingeComponent ? String(hingeComponent.quantity) : itemForm.hingeCount,
            handleTypeId: handleComponent?.componentId?.toString() ?? itemForm.handleTypeId,
            trackTypeId: trackComponent?.componentId?.toString() ?? itemForm.trackTypeId,
            cavitySliderTypeId: cavityComponent?.componentId?.toString() ?? itemForm.cavitySliderTypeId,
            notes: itemForm.notes || product.description || '',
        };

        const livePrice = recalcPrice(updated);
        const unitPrice = doorComponent.customPrice != null ? doorComponent.customPrice.toString() : livePrice;
        setItemForm({ ...updated, unitPrice });
    };

    const handleSave = () => {
        onAdd(buildOrderItem(itemForm, sortOrder, 1), editIndex ?? null);
        setItemForm(blankItemForm());
        setProductPickerId('');
    };

    const isDoorItem = itemForm.itemType === 'Prehung' || itemForm.itemType === 'DoorLeaf';
    const isPrehung = isDoorItem;
    const isCavityConfig = CAVITY_CONFIGS.includes(itemForm.doorConfiguration);
    const isHingedConfig = HINGED_CONFIGS.includes(itemForm.doorConfiguration);
    const sliderTrackType = SLIDER_TRACK_CONFIGS[itemForm.doorConfiguration];
    const availableTracks = sliderTrackType ? trackTypes.filter(t => t.trackTypeName === sliderTrackType) : [];

    const getPriceBreakdown = () => {
        if (!itemForm.doorTypeId) return null;
        const b = priceQuoteItemBreakdown(priceArgs(itemForm));

        const parts: string[] = [`Door: $${b.doorPrice.toFixed(2)}`];
        if (isCavityConfig && b.cavityPrice > 0) parts.push(`Cavity Unit: $${b.cavityPrice.toFixed(2)}`);
        if (b.jambPrice > 0) parts.push(`Jamb: $${b.jambPrice.toFixed(2)}`);
        if (b.handlePrice > 0) parts.push(`Handle: $${b.handlePrice.toFixed(2)}`);
        if (isHingedConfig && b.hingePrice > 0) parts.push(`Hinges: $${b.hingePrice.toFixed(2)}`);
        if (b.trackPrice > 0) parts.push(`Track: $${b.trackPrice.toFixed(2)}`);

        const totalLabour = b.doorLabour + b.cavityLabour + b.jambLabour + b.handleLabour + b.hingeLabour;
        if (totalLabour > 0) parts.push(`Labour: $${totalLabour.toFixed(2)}`);

        const materials = parts.join(' + ');
        return `${materials} = $${b.cost.toFixed(2)} cost, +${b.marginPercent}% margin = $${b.total.toFixed(2)}`;
    };

    const priceBreakdown = isDoorItem && isAdmin ? getPriceBreakdown() : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editIndex != null ? 'Edit Item' : 'Add Item'}
            onConfirm={handleSave}
            confirmLabel={editIndex != null ? 'Save Changes' : 'Add Item'}
        >
            {editIndex == null && products.length > 0 && (
                <div className="form-row">
                    <SelectField label="Start from Product (optional)" value={productPickerId} onChange={handleProductPick}>
                        <option value="">— Build manually —</option>
                        {activeOnly(products).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </SelectField>
                </div>
            )}

            <div className="form-row">
                <SelectField label="Type" name="itemType" value={itemForm.itemType} onChange={handleItemTypeChange}>
                    <option value="Prehung">Prehung</option>
                    <option value="Hardware">Hardware</option>
                    <option value="DoorLeaf">Door Leaf</option>
                    <option value="Misc">Misc</option>
                </SelectField>
                <TextField label="Quantity" type="number" name="quantity" value={itemForm.quantity} onChange={handleItemChange} placeholder="1" />
            </div>

            {isPrehung ? (
                <>
                    <div className="form-row">
                        <SelectField label="Configuration" name="doorConfiguration" value={itemForm.doorConfiguration} onChange={handleConfigChange}>
                            <option value="">Select...</option>
                            {DOOR_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
                        </SelectField>
                        <SelectField label="Door Type" name="doorTypeId" value={itemForm.doorTypeId} onChange={handleDoorTypeChange}>
                            <option value="">Select door type...</option>
                            {activeOnly(doorTypes).map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name}{d.material ? ` — ${d.material}` : ''}{(d.isCavityOnly || isCavityDoorType(d.name)) ? ' (Cavity)' : ''}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                    <div className="form-row">
                        <TextField label="Room" name="room" value={itemForm.room} onChange={handleItemChange} placeholder="e.g. Bedroom 1" />
                    </div>
                    <div className="form-row">
                        <FormField label="Height (mm)">
                            <select name="heightMm" value={itemForm.heightMm} onChange={handleDoorDimensionChange}>
                                {STANDARD_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                                <option value="custom">Other</option>
                            </select>
                            {itemForm.heightMm === 'custom' && (
                                <input type="number" name="heightMm" value="" placeholder="Custom height" onChange={handleDoorDimensionChange} className="input-below" />
                            )}
                        </FormField>
                        <FormField label="Width (mm)">
                            <select name="widthMm" value={STANDARD_WIDTHS.map(String).includes(itemForm.widthMm) ? itemForm.widthMm : 'custom'} onChange={e => {
                                if (e.target.value !== 'custom') handleDoorDimensionChange(e);
                                else setItemForm(prev => ({ ...prev, widthMm: '' }));
                            }}>
                                {STANDARD_WIDTHS.map(w => <option key={w} value={w}>{w}</option>)}
                                <option value="custom">Other</option>
                            </select>
                            {!STANDARD_WIDTHS.map(String).includes(itemForm.widthMm) && (
                                <input type="number" name="widthMm" value={itemForm.widthMm} onChange={handleDoorDimensionChange} placeholder="Custom width" className="input-below" />
                            )}
                        </FormField>
                        <FormField label="Thickness (mm)">
                            <select name="thicknessMm" value={['35', '37'].includes(itemForm.thicknessMm) ? itemForm.thicknessMm : 'custom'} onChange={e => {
                                if (e.target.value !== 'custom') handleDoorDimensionChange(e);
                                else setItemForm(prev => ({ ...prev, thicknessMm: '' }));
                            }}>
                                <option value="35">Standard (35mm)</option>
                                <option value="37">Deluxe (37mm)</option>
                                <option value="custom">Other</option>
                            </select>
                            {!['35', '37'].includes(itemForm.thicknessMm) && (
                                <input type="number" name="thicknessMm" value={itemForm.thicknessMm} onChange={handleDoorDimensionChange} placeholder="Custom thickness" className="input-below" />
                            )}
                        </FormField>
                    </div>

                    {isCavityConfig && (
                        <div className="form-row">
                            <SelectField label="Cavity Slider Unit" name="cavitySliderTypeId" value={itemForm.cavitySliderTypeId} onChange={handlePricingFieldChange}>
                                <option value="">Select...</option>
                                {activeOnly(cavitySliderTypes).map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.supplier} — {c.productSystem}{c.widthRange ? ` (${c.widthRange})` : ''}{c.isPOA ? ' — POA' : c.price ? ` (+$${c.price.toFixed(2)})` : ''}
                                    </option>
                                ))}
                            </SelectField>
                        </div>
                    )}

                    {sliderTrackType && (
                        <div className="form-row">
                            <SelectField label={`Track (${sliderTrackType})`} name="trackTypeId" value={itemForm.trackTypeId} onChange={handlePricingFieldChange}>
                                <option value="">Select...</option>
                                {activeOnly(availableTracks).map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.supplier} — {t.trackSystem}{t.colour ? ` — ${t.colour}` : ''}{t.price ? ` (+$${t.price.toFixed(2)})` : ''}
                                    </option>
                                ))}
                            </SelectField>
                            <TextField label="Colour" name="colourFinish" value={itemForm.colourFinish} onChange={handleItemChange} placeholder="e.g. Anodised White" />
                        </div>
                    )}

                    <div className="form-row">
                        <SelectField label="Hang Side" name="handSide" value={itemForm.handSide} onChange={handleItemChange}>
                            <option value="">—</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>
                        </SelectField>
                    </div>
                    <div className="form-row">
                        <FormField label="Jamb (loose — priced per metre)">
                            <select name="jam" value={itemForm.jam} onChange={handlePricingFieldChange}>
                                <option value="">—</option>
                                {activeOnly(jambTypes).map(j => (
                                    <option key={j.id} value={j.name}>
                                        {j.name}{j.costPerMetre ? ` ($${j.costPerMetre.toFixed(2)}/m)` : ''}
                                    </option>
                                ))}
                                <option value="Special">Special</option>
                            </select>
                            {itemForm.jam === 'Special' && (
                                <input name="jamCustom" value={itemForm.jamCustom} onChange={handleItemChange} placeholder="Describe jamb..." className="input-below" />
                            )}
                        </FormField>
                        <SelectField label="Handle" name="handleTypeId" value={itemForm.handleTypeId} onChange={handlePricingFieldChange}>
                            <option value="">—</option>
                            {activeOnly(handleTypes).map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.name}{h.finish ? ` — ${h.finish}` : ''}{h.price > 0 ? ` (+$${h.price.toFixed(2)})` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    {isHingedConfig && (
                        <div className="form-row">
                            <SelectField label="Hinge Type" name="hingeTypeId" value={itemForm.hingeTypeId} onChange={handlePricingFieldChange}>
                                <option value="">—</option>
                                {activeOnly(hingeTypes).map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}{h.finish ? ` — ${h.finish}` : ''}{h.price > 0 ? ` (+$${h.price.toFixed(2)} each)` : ''}
                                    </option>
                                ))}
                            </SelectField>
                            <TextField label="Hinge Count (per leaf)" type="number" name="hingeCount" value={itemForm.hingeCount} onChange={handlePricingFieldChange} placeholder="auto from height" />
                        </div>
                    )}

                    <div className="form-row">
                        <TextField label="Glazing" name="glazing" value={itemForm.glazing} onChange={handleItemChange} placeholder="e.g. Clear 6mm" />
                        <TextField label="Fire Rating" name="fireRating" value={itemForm.fireRating} onChange={handleItemChange} placeholder="e.g. FRR 60" />
                    </div>
                    <div className="form-row">
                        <SelectField label="Drilling" name="drilling" value={itemForm.drilling} onChange={handleItemChange}>
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </SelectField>
                        {itemForm.drilling === 'true' && (
                            <TextField label="Drill Size" name="drillSize" value={itemForm.drillSize} onChange={handleItemChange} placeholder="e.g. 54mm" />
                        )}
                    </div>
                    <div className="form-row">
                        {isAdmin && (
                            <TextField label="Margin %" type="number" name="marginPercent" value={itemForm.marginPercent} onChange={handlePricingFieldChange} placeholder="25" />
                        )}
                        <FormField label="Unit Price">
                            <input type="number" name="unitPrice" value={itemForm.unitPrice} onChange={handleItemChange} placeholder="0.00" />
                            {priceBreakdown && (
                                <p className="price-breakdown-hint">{priceBreakdown}</p>
                            )}
                        </FormField>
                    </div>
                    <TextAreaField label="Notes" name="notes" value={itemForm.notes} onChange={handleItemChange} />
                </>
            ) : (
                <>
                    <div className="form-row">
                        <TextField label="Room" name="room" value={itemForm.room} onChange={handleItemChange} placeholder="e.g. Bedroom 1" />
                    </div>
                    <TextAreaField label="Description" name="notes" value={itemForm.notes} onChange={handleItemChange} placeholder="Describe this item..." />
                    <div className="form-row">
                        <TextField label="Unit Price" type="number" name="unitPrice" value={itemForm.unitPrice} onChange={handleItemChange} placeholder="0.00" />
                    </div>
                </>
            )}
        </Modal>
    );
};

export default QuoteItemModal;
