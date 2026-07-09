import React, { useState } from 'react';
import { DoorsPageProps } from './model';
import { DoorType, DoorPricingEntry } from '../door-types/model';
import { PageWrapper } from '../../../components/page-wrapper';
import { getDoorTypes, createDoorType, updateDoorType, deleteDoorType, getDoorTypePrices, createDoorTypePrice, deleteDoorTypePrice } from '../door-types/api';
import Modal from '../../../components/modal';
import Button from '../../../components/button';
import { TextField, SelectField } from '../../../components/form-field';
import { Status } from '../../../components/status';
import { Table } from '../../../components/table';
import { HeaderItem } from '../../../components/table/model';
import { FilterBar, FilterSelect } from '../../../components/filter-bar';
import { useCatalogCrud } from '../../../hooks/useCatalogCrud';
import { distinctValues } from '../../../shared/collections';
import { todayISO } from '../../../shared/format';

import Loading from '../../../components/loading';

import './styles.scss';

const STANDARD_HEIGHTS = [1980, 2200, 2400];
const STANDARD_WIDTHS  = [360, 410, 460, 560, 610, 660, 710, 760, 810, 860, 910, 960, 1010, 1060];
const DOOR_CONFIGS = ['Single', 'Pair', '2 Slide', '3 Slide', '4 Slide', 'Single Cavity', 'Biparting Cavity', '2 Door Bifold', '4 Door Bifold', 'Exterior Single', 'Exterior Pair'];

const blankForm = () => ({
    name:          '',
    leafType:      '',
    material:      '',
    skinThickness: '',
    notes:         '',
    isActive:      'true',
});

const describeThickness = (mm: number) => {
    if (mm === 35) return 'Standard (35mm)';
    if (mm === 37) return 'Deluxe (37mm)';
    return `${mm}mm`;
};

const blankNewPrice = () => ({
    configuration: '',
    priceFor: '' as '' | 'Prehung' | 'Leaf',
    heightMm: '1980',
    heightCustom: '',
    widthMm: '810',
    widthCustom: '',
    thicknessMm: '35',
    thicknessCustom: '',
    price: '',
});

const headers: HeaderItem<DoorType>[] = [
    { id: 'name',          title: 'Name' },
    { id: 'leafType',      title: 'Category' },
    { id: 'material',      title: 'Core' },
    { id: 'skinThickness', title: 'Skin' },
    { id: 'notes',         title: 'Notes' },
    {
        id: 'isActive',
        title: 'Active',
        render: (_, d) => <Status content={d.isActive ? 'Active' : 'Inactive'} type={d.isActive ? 'good' : 'warn'} />,
    },
];

const DoorsPage: React.FC<DoorsPageProps> = () => {
    const [leafType, setLeafType] = useState('');
    const [material, setMaterial] = useState('');

    const [prices, setPrices] = useState<DoorPricingEntry[]>([]);
    const [pendingPrices, setPendingPrices] = useState<{ configuration: string | null; priceFor: 'Prehung' | 'Leaf' | null; heightMm: number; widthMm: number; thicknessMm: number; price: number }[]>([]);
    const [newPrice, setNewPrice] = useState(blankNewPrice());

    const crud = useCatalogCrud<DoorType, ReturnType<typeof blankForm>>({
        fetchAll: getDoorTypes,
        create:   createDoorType,
        update:   updateDoorType,
        remove:   deleteDoorType,
        blankForm,
        toForm: dt => ({
            name:          dt.name,
            leafType:      dt.leafType      ?? '',
            material:      dt.material      ?? '',
            skinThickness: dt.skinThickness ?? '',
            notes:         dt.notes         ?? '',
            isActive:      String(dt.isActive),
        }),
        toPayload: (f, editing) => ({
            name:          f.name,
            leafType:      f.leafType      || null,
            material:      f.material      || null,
            skinThickness: f.skinThickness || null,
            notes:         f.notes         || null,
            isActive:      f.isActive === 'true',
            description:   editing?.description ?? null,
            createdAt:     editing?.createdAt   ?? todayISO(),
        }),
        getId: d => d.id,
        afterSave: async (saved, editing) => {
            if (!editing && pendingPrices.length > 0) {
                const savedEntries: DoorPricingEntry[] = [];
                for (const p of pendingPrices) {
                    const entry = await createDoorTypePrice(saved.id, p);
                    savedEntries.push(entry);
                }
                saved.prices = savedEntries;
            }
            return saved;
        },
        onClose: () => { setPrices([]); setPendingPrices([]); },
    });

    const { modalOpen, editing, form, closeModal, handleChange, handleSave, handleDelete } = crud;
    const doorTypes = crud.items;

    const openNew = () => {
        setPendingPrices([]);
        setNewPrice(blankNewPrice());
        crud.openNew();
    };

    const openEdit = (dt: DoorType) => {
        setNewPrice(blankNewPrice());
        getDoorTypePrices(dt.id).then(setPrices);
        crud.openEdit(dt);
    };

    const handleAddPrice = () => {
        if (!newPrice.price) return;
        const h = newPrice.heightMm    === 'other' ? parseInt(newPrice.heightCustom)    : parseInt(newPrice.heightMm);
        const w = newPrice.widthMm     === 'other' ? parseInt(newPrice.widthCustom)     : parseInt(newPrice.widthMm);
        const t = newPrice.thicknessMm === 'other' ? parseInt(newPrice.thicknessCustom) : parseInt(newPrice.thicknessMm);
        if (!h || !w || !t) return;
        const entry = {
            configuration: newPrice.configuration || null,
            priceFor:      newPrice.priceFor      || null,
            heightMm: h,
            widthMm:  w,
            thicknessMm: t,
            price:    parseFloat(newPrice.price),
        };
        if (editing) {
            createDoorTypePrice(editing.id, entry).then(saved => {
                setPrices(prev => [...prev, saved]);
                setNewPrice(prev => ({ ...prev, heightCustom: '', widthCustom: '', thicknessCustom: '', price: '' }));
            });
        } else {
            setPendingPrices(prev => [...prev, entry]);
            setNewPrice(prev => ({ ...prev, heightCustom: '', widthCustom: '', thicknessCustom: '', price: '' }));
        }
    };

    const handleDeletePrice = (entryId: number) => {
        if (!editing) return;
        deleteDoorTypePrice(editing.id, entryId).then(() =>
            setPrices(prev => prev.filter(p => p.id !== entryId))
        );
    };

    const handleDeletePendingPrice = (idx: number) =>
        setPendingPrices(prev => prev.filter((_, i) => i !== idx));

    const availableLeafTypes = distinctValues(doorTypes, 'leafType', false);
    const filteredByLeaf = leafType ? doorTypes.filter(d => d.leafType === leafType) : doorTypes;

    const availableMaterials = distinctValues(filteredByLeaf, 'material', false);
    const results = material ? filteredByLeaf.filter(d => d.material === material) : filteredByLeaf;

    const handleLeafChange     = (v: string) => { setLeafType(v); setMaterial(''); };
    const handleMaterialChange = (v: string) => { setMaterial(v); };

    if (crud.loading) return <Loading />;

    return (
        <PageWrapper title="Doors" buttonTitle="New Door" buttonAction={openNew}>
            <FilterBar
                showClear={!!(leafType || material)}
                onClear={() => { setLeafType(''); setMaterial(''); }}
            >
                <FilterSelect label="Category" value={leafType} onChange={handleLeafChange} options={availableLeafTypes} />
                <FilterSelect label="Core" value={material} onChange={handleMaterialChange} options={availableMaterials} disabled={availableMaterials.length === 0} />
            </FilterBar>

            <Table
                headers={headers}
                rows={results}
                onRowClick={openEdit}
                emptyMessage="No doors match the selected filters."
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? `Edit ${editing.name}` : 'New Door'}
                onConfirm={handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Flush Panel" />
                    <SelectField label="Active" name="isActive" value={form.isActive} onChange={handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                <div className="form-row">
                    <TextField label="Category (Leaf Type)" name="leafType" value={form.leafType} onChange={handleChange} placeholder="e.g. Flush Panel, Grooved" />
                    <TextField label="Core (Material)" name="material" value={form.material} onChange={handleChange} placeholder="e.g. Hollowcore, Solidcore" />
                </div>
                <div className="form-row">
                    <TextField label="Skin Thickness" name="skinThickness" value={form.skinThickness} onChange={handleChange} placeholder="e.g. 3mm" />
                </div>
                <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. Made to order" />
                <>
                    <div className="pricing-matrix">
                        <label>Pricing Matrix (Configuration × Height × Width × Thickness)</label>
                        <table className="pricing-table">
                            <thead>
                                <tr>
                                    <th>Applies To</th>
                                    <th>Config</th>
                                    <th>H (mm)</th>
                                    <th>W (mm)</th>
                                    <th>Thickness</th>
                                    <th>Price</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {editing
                                    ? prices
                                        .slice()
                                        .sort((a, b) => (a.configuration ?? '').localeCompare(b.configuration ?? '') || a.heightMm - b.heightMm || a.widthMm - b.widthMm || a.thicknessMm - b.thicknessMm)
                                        .map(p => (
                                            <tr key={p.id}>
                                                <td>{p.priceFor ?? 'All'}</td>
                                                <td>{p.configuration ?? 'All'}</td>
                                                <td>{p.heightMm}</td>
                                                <td>{p.widthMm}</td>
                                                <td>{describeThickness(p.thicknessMm)}</td>
                                                <td>${p.price.toFixed(2)}</td>
                                                <td><Button variant="danger" onClick={() => handleDeletePrice(p.id)}>Remove</Button></td>
                                            </tr>
                                        ))
                                    : pendingPrices.map((p, i) => (
                                        <tr key={i}>
                                            <td>{p.priceFor ?? 'All'}</td>
                                            <td>{p.configuration ?? 'All'}</td>
                                            <td>{p.heightMm}</td>
                                            <td>{p.widthMm}</td>
                                            <td>{describeThickness(p.thicknessMm)}</td>
                                            <td>${p.price.toFixed(2)}</td>
                                            <td><Button variant="danger" onClick={() => handleDeletePendingPrice(i)}>Remove</Button></td>
                                        </tr>
                                    ))
                                }
                                <tr className="pricing-add-row">
                                    <td>
                                        <select value={newPrice.priceFor} onChange={e => setNewPrice(prev => ({ ...prev, priceFor: e.target.value as '' | 'Prehung' | 'Leaf' }))}>
                                            <option value="">Both</option>
                                            <option value="Prehung">Prehung</option>
                                            <option value="Leaf">Leaf</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select value={newPrice.configuration} onChange={e => setNewPrice(prev => ({ ...prev, configuration: e.target.value }))}>
                                            <option value="">All</option>
                                            {DOOR_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select value={newPrice.heightMm} onChange={e => setNewPrice(prev => ({ ...prev, heightMm: e.target.value, heightCustom: '' }))}>
                                            {STANDARD_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                                            <option value="other">Other</option>
                                        </select>
                                        {newPrice.heightMm === 'other' && (
                                            <input type="number" placeholder="Custom mm" value={newPrice.heightCustom} onChange={e => setNewPrice(prev => ({ ...prev, heightCustom: e.target.value }))} />
                                        )}
                                    </td>
                                    <td>
                                        <select value={newPrice.widthMm} onChange={e => setNewPrice(prev => ({ ...prev, widthMm: e.target.value, widthCustom: '' }))}>
                                            {STANDARD_WIDTHS.map(w => <option key={w} value={w}>{w}</option>)}
                                            <option value="other">Other</option>
                                        </select>
                                        {newPrice.widthMm === 'other' && (
                                            <input type="number" placeholder="Custom mm" value={newPrice.widthCustom} onChange={e => setNewPrice(prev => ({ ...prev, widthCustom: e.target.value }))} />
                                        )}
                                    </td>
                                    <td>
                                        <select value={newPrice.thicknessMm} onChange={e => setNewPrice(prev => ({ ...prev, thicknessMm: e.target.value, thicknessCustom: '' }))}>
                                            <option value="35">Standard (35mm)</option>
                                            <option value="37">Deluxe (37mm)</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {newPrice.thicknessMm === 'other' && (
                                            <input type="number" placeholder="Custom mm" value={newPrice.thicknessCustom} onChange={e => setNewPrice(prev => ({ ...prev, thicknessCustom: e.target.value }))} />
                                        )}
                                    </td>
                                    <td>
                                        <input type="number" placeholder="0.00" value={newPrice.price} onChange={e => setNewPrice(prev => ({ ...prev, price: e.target.value }))} />
                                    </td>
                                    <td>
                                        <Button variant="secondary" onClick={handleAddPrice}>Add</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="pricing-hint">
                            Leave "Config" as "All" to apply this price to any configuration. Use specific configs (e.g. Bifold) to override per-configuration.
                        </p>
                    </div>
                    {editing && (
                        <div className="door-delete-section">
                            <Button variant="danger" onClick={handleDelete}>Delete Door</Button>
                        </div>
                    )}
                </>
            </Modal>
        </PageWrapper>
    );
};

export default DoorsPage;
