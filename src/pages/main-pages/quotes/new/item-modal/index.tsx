import React, { useEffect, useState } from 'react';
import Modal from '../../../../../components/modal';
import { FormField, TextField, SelectField, TextAreaField } from '../../../../../components/form-field';
import { blankItemForm, lookupDoorPrice, activeOnly, buildOrderItem, itemToForm } from '../../../../../shared/item-utils';
import { QuoteItemModalProps } from './model';

const STANDARD_HEIGHTS = ['1980', '2200', '2400'];
const STANDARD_WIDTHS  = [360, 410, 460, 560, 610, 660, 710, 760, 810, 860, 910, 960, 1010, 1060];
const DOOR_CONFIGS = ['Single', 'Pair', '2 Slide', '3 Slide', '4 Slide', 'Single Cavity', 'Biparting Cavity', '2 Door Bifold', '4 Door Bifold', 'Exterior Single', 'Exterior Pair'];

const QuoteItemModal: React.FC<QuoteItemModalProps> = ({
    isOpen, sortOrder, doorTypes, hingeTypes: _hingeTypes, handleTypes, jambTypes,
    editIndex, initialItem, onAdd, onClose,
}) => {
    const [itemForm, setItemForm] = useState(blankItemForm());

    useEffect(() => {
        if (isOpen) {
            const jambNames = jambTypes.map(j => j.name);
            setItemForm(initialItem ? itemToForm(initialItem, jambNames) : blankItemForm());
        }
    }, [isOpen, initialItem, jambTypes]);

    const handleClose = () => {
        setItemForm(blankItemForm());
        onClose();
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setItemForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setItemForm({ ...blankItemForm(), itemType: e.target.value as typeof itemForm.itemType });

    const recalcPrice = (form: typeof itemForm) => {
        return lookupDoorPrice(
            doorTypes,
            form.doorTypeId,
            form.heightMm,
            form.widthMm,
            form.doorConfiguration,
            handleTypes,
            form.handleTypeId,
            jambTypes,
            form.jam,
            form.itemType,
            form.thicknessMm,
        );
    };

    const handleDoorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const updated = { ...itemForm, doorTypeId: e.target.value };
        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handleDoorDimensionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updated = { ...itemForm, [e.target.name]: e.target.value };
        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handlePricingFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updated = { ...itemForm, [e.target.name]: e.target.value };
        setItemForm({ ...updated, unitPrice: recalcPrice(updated) });
    };

    const handleSave = () => {
        onAdd(buildOrderItem(itemForm, sortOrder, 1), editIndex ?? null);
        setItemForm(blankItemForm());
    };

    const isDoorItem = itemForm.itemType === 'Prehung' || itemForm.itemType === 'DoorLeaf';
    const isPrehung = isDoorItem;

    // Build price breakdown for display
    const getPriceBreakdown = () => {
        if (!itemForm.doorTypeId) return null;
        const dt = doorTypes.find(d => d.id === parseInt(itemForm.doorTypeId));
        if (!dt) return null;

        let doorPrice = 0;
        if (dt.prices && itemForm.heightMm && itemForm.widthMm) {
            const h = parseInt(itemForm.heightMm);
            const w = parseInt(itemForm.widthMm);
            const t = itemForm.thicknessMm ? parseInt(itemForm.thicknessMm) : 35;
            const matchesPriceFor = (p: { priceFor?: string | null }) => !p.priceFor || p.priceFor === itemForm.itemType;
            const configMatch = itemForm.doorConfiguration
                ? dt.prices.find(p => p.configuration === itemForm.doorConfiguration && p.heightMm === h && p.widthMm === w && p.thicknessMm === t && matchesPriceFor(p))
                : null;
            const anyMatch = dt.prices.find(p => !p.configuration && p.heightMm === h && p.widthMm === w && p.thicknessMm === t && matchesPriceFor(p));
            const match = configMatch ?? anyMatch;
            if (match) doorPrice = match.price;
        }

        const jt = jambTypes.find(j => j.name === itemForm.jam);
        const ht = handleTypes.find(h => h.id === parseInt(itemForm.handleTypeId));

        const parts: string[] = [`Door: $${doorPrice.toFixed(2)}`];
        if (jt && jt.price > 0) parts.push(`Jamb: $${jt.price.toFixed(2)}`);
        if (ht && ht.price > 0) parts.push(`Handle: $${ht.price.toFixed(2)}`);

        return parts.length > 1 ? parts.join(' + ') : null;
    };

    const priceBreakdown = isDoorItem ? getPriceBreakdown() : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editIndex != null ? 'Edit Item' : 'Add Item'}
            onConfirm={handleSave}
            confirmLabel={editIndex != null ? 'Save Changes' : 'Add Item'}
        >
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
                        <SelectField label="Configuration" name="doorConfiguration" value={itemForm.doorConfiguration} onChange={handlePricingFieldChange}>
                            <option value="">Select...</option>
                            {DOOR_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
                        </SelectField>
                        <SelectField label="Door Type" name="doorTypeId" value={itemForm.doorTypeId} onChange={handleDoorTypeChange}>
                            <option value="">Select door type...</option>
                            {activeOnly(doorTypes).map(d => (
                                <option key={d.id} value={d.id}>{d.name}{d.material ? ` — ${d.material}` : ''}</option>
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
                    <div className="form-row">
                        <SelectField label="Hang Side" name="handSide" value={itemForm.handSide} onChange={handleItemChange}>
                            <option value="">—</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>
                        </SelectField>
                    </div>
                    <div className="form-row">
                        <FormField label="Jamb">
                            <select name="jam" value={itemForm.jam} onChange={handlePricingFieldChange}>
                                <option value="">—</option>
                                {activeOnly(jambTypes).map(j => (
                                    <option key={j.id} value={j.name}>
                                        {j.name}{j.price > 0 ? ` (+$${j.price.toFixed(2)})` : ''}
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
