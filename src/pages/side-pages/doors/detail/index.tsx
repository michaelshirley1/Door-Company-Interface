import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { TextField, SelectField } from '../../../../components/form-field';
import Button from '../../../../components/button';
import Loading from '../../../../components/loading';
import { DoorType, DoorPricingEntry } from '../../door-types/model';
import { JambType } from '../../jamb-types/model';
import { getJambTypes } from '../../jamb-types/api';
import {
    getDoorType, createDoorType, updateDoorType, deleteDoorType,
    getDoorTypePrices, createDoorTypePrice, updateDoorTypePrice, deleteDoorTypePrice, bulkCreateDoorTypePrices,
} from '../../door-types/api';
import { activeOnly } from '../../../../shared/item-utils';
import { getApiErrorMessage } from '../../../../api/errors';
import { STANDARD_HEIGHTS, STANDARD_WIDTHS, DOOR_CONFIGS } from '../../../../shared/constants';
import { parsePriceWorkbook, exportPricesToWorkbook } from '../../../../shared/excel';

import '../styles.scss';

const describeThickness = (mm: number) => {
    if (mm === 35) return 'Standard (35mm)';
    if (mm === 37) return 'Deluxe (37mm)';
    return `${mm}mm`;
};

const blankForm = () => ({
    name: '',
    leafType: '',
    material: '',
    skinThickness: '',
    colour: '',
    labourCost: '',
    notes: '',
    isCavityOnly: 'false',
    isActive: 'true',
});

const blankNewPrice = () => ({
    configuration: '',
    jamb: '',
    priceFor: '' as '' | 'Prehung' | 'Leaf',
    heightMm: '1980',
    heightCustom: '',
    widthMm: '810',
    widthCustom: '',
    thicknessMm: '35',
    thicknessCustom: '',
    price: '',
    isPOA: false,
});

const DoorDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = id === undefined || id === 'new';

    const [existing, setExisting] = useState<DoorType | undefined>();
    const [form, setForm] = useState(blankForm());
    const [prices, setPrices] = useState<DoorPricingEntry[]>([]);
    const [jambTypes, setJambTypes] = useState<JambType[]>([]);
    const [newPrice, setNewPrice] = useState(blankNewPrice());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loaders: Promise<unknown>[] = [getJambTypes().then(setJambTypes)];
        if (!isNew) {
            loaders.push(
                getDoorType(parseInt(id!)).then(dt => {
                    setExisting(dt);
                    setForm({
                        name: dt.name,
                        leafType: dt.leafType ?? '',
                        material: dt.material ?? '',
                        skinThickness: dt.skinThickness ?? '',
                        colour: dt.colour ?? '',
                        labourCost: dt.labourCost?.toString() ?? '',
                        notes: dt.notes ?? '',
                        isCavityOnly: String(!!dt.isCavityOnly),
                        isActive: String(dt.isActive),
                    });
                }),
                getDoorTypePrices(parseInt(id!)).then(setPrices),
            );
        }
        Promise.all(loaders)
            .catch(() => setError('Failed to load door data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const apiError = (err: unknown, prefix: string) => setError(`${prefix}: ${getApiErrorMessage(err)}`);

    const buildPayload = () => ({
        name: form.name,
        leafType: form.leafType || null,
        material: form.material || null,
        skinThickness: form.skinThickness || null,
        colour: form.colour || null,
        labourCost: form.labourCost ? parseFloat(form.labourCost) : null,
        notes: form.notes || null,
        isCavityOnly: form.isCavityOnly === 'true',
        isActive: form.isActive === 'true',
        description: existing?.description ?? null,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
    });

    const handleSubmit = () => {
        setError(null);
        setSaving(true);
        const action = isNew ? createDoorType(buildPayload() as Omit<DoorType, 'id'>) : updateDoorType(parseInt(id!), { ...existing, ...buildPayload() } as DoorType);
        action
            .then(saved => {
                if (isNew) navigate(`/doors/${saved.id}`, { replace: true });
                else setExisting(saved);
            })
            .catch(err => apiError(err, 'Failed to save'))
            .finally(() => setSaving(false));
    };

    const handleDelete = () => {
        if (!existing) return;
        deleteDoorType(existing.id)
            .then(() => navigate('/products?tab=doors'))
            .catch(err => apiError(err, 'Failed to delete'));
    };

    const handleAddPrice = () => {
        if (!newPrice.price && !newPrice.isPOA) return;
        const h = newPrice.heightMm === 'other' ? parseInt(newPrice.heightCustom) : parseInt(newPrice.heightMm);
        const w = newPrice.widthMm === 'other' ? parseInt(newPrice.widthCustom) : parseInt(newPrice.widthMm);
        const t = newPrice.thicknessMm === 'other' ? parseInt(newPrice.thicknessCustom) : parseInt(newPrice.thicknessMm);
        if (!h || !w || !t) return;
        const entry = {
            configuration: newPrice.configuration || null,
            jamb: newPrice.jamb || null,
            priceFor: newPrice.priceFor || null,
            heightMm: h,
            widthMm: w,
            thicknessMm: t,
            price: newPrice.isPOA ? null : (newPrice.price ? parseFloat(newPrice.price) : null),
            isPOA: newPrice.isPOA,
        };
        createDoorTypePrice(parseInt(id!), entry)
            .then(saved => {
                setPrices(prev => [...prev, saved]);
                setNewPrice(prev => ({ ...prev, heightCustom: '', widthCustom: '', thicknessCustom: '', price: '', isPOA: false }));
            })
            .catch(err => apiError(err, 'Failed to add price'));
    };

    const handlePriceCellChange = (entryId: number, price: string) => {
        setPrices(prev => prev.map(p => p.id === entryId ? { ...p, price: price ? parseFloat(price) : null } : p));
    };

    const handlePriceCellBlur = (entry: DoorPricingEntry) => {
        updateDoorTypePrice(parseInt(id!), entry.id, entry).catch(err => apiError(err, 'Failed to update price'));
    };

    const handleDeletePrice = (entryId: number) => {
        deleteDoorTypePrice(parseInt(id!), entryId)
            .then(() => setPrices(prev => prev.filter(p => p.id !== entryId)))
            .catch(err => apiError(err, 'Failed to remove price'));
    };

    const handleExport = () => {
        exportPricesToWorkbook(existing?.name ?? 'door', prices);
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !existing) return;
        try {
            const rows = await parsePriceWorkbook(file);
            if (rows.length === 0) {
                setError('No price rows recognised in that file.');
                return;
            }
            const saved = await bulkCreateDoorTypePrices(existing.id, rows);
            setPrices(prev => [...prev, ...saved]);
            setError(null);
        } catch {
            setError('Failed to import prices from that file — check it matches the expected columns.');
        }
    };

    if (loading) return <Loading />;

    const importExportActions = !isNew ? (
        <>
            <label className="btn btn-secondary import-file-label">
                Import from Excel
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} hidden />
            </label>
            <Button variant="secondary" type="button" onClick={handleExport}>Export to Excel</Button>
        </>
    ) : undefined;

    return (
        <FormWrapper
            title={isNew ? 'New Door' : `Edit ${existing?.name ?? ''}`}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/products?tab=doors')}
            onDelete={!isNew ? handleDelete : undefined}
            extraActions={importExportActions}
            error={error}
            submitting={saving}
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
                <SelectField label="Cavity-only leaf?" name="isCavityOnly" value={form.isCavityOnly} onChange={handleChange}>
                    <option value="false">No</option>
                    <option value="true">Yes — auto-select Cavity config in quotes</option>
                </SelectField>
            </div>
            <div className="form-row">
                <TextField label="Skin Thickness" name="skinThickness" value={form.skinThickness} onChange={handleChange} placeholder="e.g. 3mm" />
                <TextField label="Colour" name="colour" value={form.colour} onChange={handleChange} placeholder="e.g. White" />
                <TextField label="Labour Cost" type="number" name="labourCost" value={form.labourCost} onChange={handleChange} placeholder="0.00" />
            </div>
            <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. Made to order" />

            {!isNew && (
                <div className="pricing-matrix">
                    <label>Pricing Matrix (Configuration × Jamb × Height × Width × Thickness)</label>
                    <table className="pricing-table">
                        <thead>
                            <tr>
                                <th>Applies To</th>
                                <th>Config</th>
                                <th>Jamb</th>
                                <th>H (mm)</th>
                                <th>W (mm)</th>
                                <th>Thickness</th>
                                <th>Price</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {prices
                                .slice()
                                .sort((a, b) => (a.configuration ?? '').localeCompare(b.configuration ?? '') || (a.jamb ?? '').localeCompare(b.jamb ?? '') || a.heightMm - b.heightMm || a.widthMm - b.widthMm || a.thicknessMm - b.thicknessMm)
                                .map(p => (
                                    <tr key={p.id}>
                                        <td>{p.priceFor ?? 'All'}</td>
                                        <td>{p.configuration ?? 'All'}</td>
                                        <td>{p.jamb ?? 'All'}</td>
                                        <td>{p.heightMm}</td>
                                        <td>{p.widthMm}</td>
                                        <td>{describeThickness(p.thicknessMm)}</td>
                                        <td>
                                            {p.isPOA && <span className="doors-badge">POA</span>}
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={p.price ?? ''}
                                                onChange={e => handlePriceCellChange(p.id, e.target.value)}
                                                onBlur={() => handlePriceCellBlur(prices.find(x => x.id === p.id)!)}
                                            />
                                        </td>
                                        <td><Button variant="danger" onClick={() => handleDeletePrice(p.id)}>Remove</Button></td>
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
                                    <select value={newPrice.jamb} onChange={e => setNewPrice(prev => ({ ...prev, jamb: e.target.value }))}>
                                        <option value="">All</option>
                                        {activeOnly(jambTypes).map(j => <option key={j.id} value={j.name}>{j.name}</option>)}
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
                                    <label className="poa-checkbox">
                                        <input type="checkbox" checked={newPrice.isPOA} onChange={e => setNewPrice(prev => ({ ...prev, isPOA: e.target.checked }))} />
                                        POA
                                    </label>
                                    <input type="number" placeholder="0.00" value={newPrice.price} onChange={e => setNewPrice(prev => ({ ...prev, price: e.target.value }))} />
                                </td>
                                <td>
                                    <Button variant="secondary" onClick={handleAddPrice}>Add</Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="pricing-hint">
                        Leave "Config" or "Jamb" as "All" to apply this price regardless of configuration/jamb. "POA" rows still take a price — fill it in directly once known, the badge is just a reminder it hasn't been confirmed yet.
                        Jamb-specific rows here are whole-unit list prices (legacy); loose/metre-based jamb costing for quote lines is set on the Jambs tab.
                    </p>
                </div>
            )}
            {isNew && (
                <p className="pricing-hint">Save the door first to start adding prices.</p>
            )}
        </FormWrapper>
    );
};

export default DoorDetailPage;
