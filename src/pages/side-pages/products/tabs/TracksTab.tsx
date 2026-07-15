import React, { useState } from 'react';
import { TrackType } from '../../track-types/model';
import { getTrackTypes, createTrackType, updateTrackType, deleteTrackType } from '../../track-types/api';
import { Status } from '../../../../components/status';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import { FilterBar, FilterSelect } from '../../../../components/filter-bar';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import { TextField, SelectField } from '../../../../components/form-field';
import { useCatalogCrud } from '../../../../hooks/useCatalogCrud';
import { distinctValues } from '../../../../shared/collections';
import Loading from '../../../../components/loading';

const blankForm = () => ({
    supplier: '', trackSystem: '', trackTypeName: 'Double Track', widthRangeMm: '', lengthMm: '',
    code: '', colour: '', price: '', isActive: 'true',
});

const headers: HeaderItem<TrackType>[] = [
    { id: 'supplier', title: 'Supplier' },
    { id: 'trackSystem', title: 'Track System' },
    { id: 'trackTypeName', title: 'Type' },
    { id: 'widthRangeMm', title: 'Width Range' },
    { id: 'colour', title: 'Colour' },
    { id: 'price', title: 'Price', render: (_, t) => t.price != null ? `$${t.price.toFixed(2)}` : '—' },
    { id: 'isActive', title: 'Active', render: (_, t) => <Status content={t.isActive ? 'Active' : 'Inactive'} type={t.isActive ? 'good' : 'warn'} /> },
];

const TracksTab: React.FC = () => {
    const [supplier, setSupplier] = useState('');
    const [trackTypeName, setTrackTypeName] = useState('');

    const {
        items: tracks, loading, modalOpen, editing, form,
        openNew, openEdit, closeModal, handleChange, handleSave, handleDelete,
    } = useCatalogCrud<TrackType, ReturnType<typeof blankForm>>({
        fetchAll: getTrackTypes,
        create: createTrackType,
        update: updateTrackType,
        remove: deleteTrackType,
        blankForm,
        toForm: t => ({
            supplier: t.supplier, trackSystem: t.trackSystem, trackTypeName: t.trackTypeName,
            widthRangeMm: t.widthRangeMm ?? '', lengthMm: t.lengthMm?.toString() ?? '',
            code: t.code ?? '', colour: t.colour ?? '', price: t.price?.toString() ?? '', isActive: String(t.isActive),
        }),
        toPayload: f => ({
            supplier: f.supplier,
            trackSystem: f.trackSystem,
            trackTypeName: f.trackTypeName,
            widthRangeMm: f.widthRangeMm || null,
            lengthMm: f.lengthMm ? parseInt(f.lengthMm) : null,
            code: f.code || null,
            colour: f.colour || null,
            price: f.price ? parseFloat(f.price) : null,
            isActive: f.isActive === 'true',
        }),
        getId: t => t.id,
    });

    const availableSuppliers = distinctValues(tracks, 'supplier');
    const availableTypes = distinctValues(tracks, 'trackTypeName');

    const results = tracks.filter(t => {
        if (supplier && t.supplier !== supplier) return false;
        if (trackTypeName && t.trackTypeName !== trackTypeName) return false;
        return true;
    });

    if (loading) return <Loading />;

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={openNew}>New Track</Button>
            </div>
            <FilterBar
                showClear={!!(supplier || trackTypeName)}
                onClear={() => { setSupplier(''); setTrackTypeName(''); }}
            >
                <FilterSelect label="Supplier" value={supplier} onChange={setSupplier} options={availableSuppliers} />
                <FilterSelect label="Type" value={trackTypeName} onChange={setTrackTypeName} options={availableTypes} />
            </FilterBar>

            <Table
                headers={headers}
                rows={results}
                onRowClick={openEdit}
                emptyMessage="No tracks match the selected filters."
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? `Edit ${editing.trackSystem}` : 'New Track'}
                onConfirm={handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Supplier" name="supplier" value={form.supplier} onChange={handleChange} placeholder="e.g. Unique Hardware" />
                    <TextField label="Track System" name="trackSystem" value={form.trackSystem} onChange={handleChange} placeholder="e.g. Slidemaster Robe Elite" />
                </div>
                <div className="form-row">
                    <SelectField label="Track Type" name="trackTypeName" value={form.trackTypeName} onChange={handleChange}>
                        <option value="Double Track">Double Track</option>
                        <option value="Triple Track">Triple Track</option>
                        <option value="Panel Kit">Panel Kit</option>
                    </SelectField>
                    <TextField label="Width Range (mm)" name="widthRangeMm" value={form.widthRangeMm} onChange={handleChange} placeholder="e.g. 410-910" />
                </div>
                <div className="form-row">
                    <TextField label="Length (mm)" type="number" name="lengthMm" value={form.lengthMm} onChange={handleChange} placeholder="e.g. 1800" />
                    <TextField label="Code" name="code" value={form.code} onChange={handleChange} placeholder="e.g. SMRED1800AW" />
                </div>
                <div className="form-row">
                    <TextField label="Colour" name="colour" value={form.colour} onChange={handleChange} placeholder="e.g. Anodised White" />
                    <TextField label="Price" type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-row">
                    <SelectField label="Active" name="isActive" value={form.isActive} onChange={handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                {editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={handleDelete}>Delete Track</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TracksTab;
