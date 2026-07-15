import React, { useState } from 'react';
import { CavitySliderType } from '../../cavity-sliders/model';
import { getCavitySliders, createCavitySlider, updateCavitySlider, deleteCavitySlider } from '../../cavity-sliders/api';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import { TextField, SelectField } from '../../../../components/form-field';
import { Status } from '../../../../components/status';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import { FilterBar, FilterSelect } from '../../../../components/filter-bar';
import { useCatalogCrud } from '../../../../hooks/useCatalogCrud';
import { distinctValues } from '../../../../shared/collections';
import Loading from '../../../../components/loading';

const blankForm = () => ({
    supplier: '',
    productSystem: '',
    unitType: '',
    studPocket: '',
    finishDetail: '',
    colour: '',
    labourCost: '',
    heightMm: '',
    widthRange: '',
    price: '',
    isPOA: 'false',
    priceBasis: 'per unit',
    category: '',
    subcategory: '',
    isActive: 'true',
});

const headers: HeaderItem<CavitySliderType>[] = [
    { id: 'supplier', title: 'Supplier' },
    { id: 'productSystem', title: 'Product System' },
    { id: 'unitType', title: 'Unit Type' },
    { id: 'studPocket', title: 'Stud / Pocket' },
    { id: 'finishDetail', title: 'Finish' },
    { id: 'colour', title: 'Colour' },
    { id: 'widthRange', title: 'Width Range' },
    {
        id: 'price',
        title: 'Price',
        render: (_, s) => s.isPOA
            ? <span className="cs-poa">POA</span>
            : s.price != null ? `$${s.price.toFixed(2)}` : '—',
    },
    {
        id: 'isActive',
        title: 'Active',
        render: (_, s) => <Status content={s.isActive ? 'Active' : 'Inactive'} type={s.isActive ? 'good' : 'warn'} />,
    },
];

const CavitySlidersTab: React.FC = () => {
    const [supplier, setSupplier] = useState('');
    const [heightMm, setHeightMm] = useState('');
    const [widthRange, setWidthRange] = useState('');

    const {
        items: sliders, loading, modalOpen, editing, form,
        openNew, openEdit, closeModal, handleChange, handleSave, handleDelete,
    } = useCatalogCrud<CavitySliderType, ReturnType<typeof blankForm>>({
        fetchAll: getCavitySliders,
        create: createCavitySlider,
        update: updateCavitySlider,
        remove: deleteCavitySlider,
        blankForm,
        toForm: s => ({
            supplier: s.supplier,
            productSystem: s.productSystem,
            unitType: s.unitType ?? '',
            studPocket: s.studPocket ?? '',
            finishDetail: s.finishDetail ?? '',
            colour: s.colour ?? '',
            labourCost: s.labourCost?.toString() ?? '',
            heightMm: s.heightMm?.toString() ?? '',
            widthRange: s.widthRange ?? '',
            price: s.price?.toString() ?? '',
            isPOA: String(s.isPOA),
            priceBasis: s.priceBasis ?? 'per unit',
            category: s.category ?? '',
            subcategory: s.subcategory ?? '',
            isActive: String(s.isActive),
        }),
        toPayload: f => ({
            supplier: f.supplier,
            productSystem: f.productSystem,
            unitType: f.unitType || null,
            studPocket: f.studPocket || null,
            finishDetail: f.finishDetail || null,
            colour: f.colour || null,
            labourCost: f.labourCost ? parseFloat(f.labourCost) : null,
            heightMm: f.heightMm ? parseInt(f.heightMm) : null,
            widthRange: f.widthRange || null,
            price: f.price ? parseFloat(f.price) : null,
            isPOA: f.isPOA === 'true',
            priceBasis: f.priceBasis || 'per unit',
            category: f.category || null,
            subcategory: f.subcategory || null,
            isActive: f.isActive === 'true',
        }),
        getId: s => s.id,
    });

    const availableSuppliers = distinctValues(sliders, 'supplier');
    const availableHeights = distinctValues(sliders, 'heightMm');
    const availableWidths = distinctValues(sliders, 'widthRange');

    const results = sliders.filter(s => {
        if (supplier && s.supplier !== supplier) return false;
        if (heightMm && s.heightMm !== parseInt(heightMm)) return false;
        if (widthRange && s.widthRange !== widthRange) return false;
        return true;
    });

    if (loading) return <Loading />;

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={openNew}>New Cavity Slider</Button>
            </div>
            <FilterBar
                showClear={!!(supplier || heightMm || widthRange)}
                onClear={() => { setSupplier(''); setHeightMm(''); setWidthRange(''); }}
            >
                <FilterSelect label="Supplier" value={supplier} onChange={setSupplier} options={availableSuppliers} />
                <FilterSelect label="Height" value={heightMm} onChange={setHeightMm} options={availableHeights.map(h => ({ value: h, label: `${h} mm` }))} />
                <FilterSelect label="Width Range" value={widthRange} onChange={setWidthRange} options={availableWidths} />
            </FilterBar>

            <Table
                headers={headers}
                rows={results}
                onRowClick={openEdit}
                emptyMessage="No cavity sliders match the selected filters."
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? `Edit ${editing.productSystem}` : 'New Cavity Slider'}
                onConfirm={handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Supplier" name="supplier" value={form.supplier} onChange={handleChange} placeholder="e.g. Hallmark" />
                    <TextField label="Product System" name="productSystem" value={form.productSystem} onChange={handleChange} placeholder="e.g. Slimline 75" />
                </div>
                <div className="form-row">
                    <TextField label="Unit Type" name="unitType" value={form.unitType} onChange={handleChange} placeholder="e.g. Single" />
                    <TextField label="Stud / Pocket" name="studPocket" value={form.studPocket} onChange={handleChange} placeholder="e.g. 90mm stud" />
                </div>
                <div className="form-row">
                    <TextField label="Finish" name="finishDetail" value={form.finishDetail} onChange={handleChange} placeholder="e.g. Stainless" />
                    <TextField label="Colour" name="colour" value={form.colour} onChange={handleChange} placeholder="e.g. White" />
                    <TextField label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Residential" />
                </div>
                <div className="form-row">
                    <TextField label="Height (mm)" type="number" name="heightMm" value={form.heightMm} onChange={handleChange} placeholder="e.g. 2040" />
                    <TextField label="Width Range" name="widthRange" value={form.widthRange} onChange={handleChange} placeholder="e.g. 620–920" />
                </div>
                <div className="form-row">
                    <TextField label="Price" type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" />
                    <SelectField label="POA" name="isPOA" value={form.isPOA} onChange={handleChange}>
                        <option value="false">No</option>
                        <option value="true">Yes (Price on Application)</option>
                    </SelectField>
                    <TextField label="Labour Cost" type="number" name="labourCost" value={form.labourCost} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-row">
                    <TextField label="Price Basis" name="priceBasis" value={form.priceBasis} onChange={handleChange} placeholder="e.g. per unit" />
                    <SelectField label="Active" name="isActive" value={form.isActive} onChange={handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                {editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={handleDelete}>Delete Cavity Slider</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CavitySlidersTab;
