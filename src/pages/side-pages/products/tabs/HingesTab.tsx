import React, { useState } from 'react';
import { HingeType } from '../../hinge-types/model';
import { getHingeTypes, createHingeType, updateHingeType, deleteHingeType } from '../../hinge-types/api';
import { Status } from '../../../../components/status';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import { FilterBar, FilterSelect } from '../../../../components/filter-bar';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import { TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { useCatalogCrud } from '../../../../hooks/useCatalogCrud';
import { distinctValues } from '../../../../shared/collections';
import { todayISO } from '../../../../shared/format';
import Loading from '../../../../components/loading';

const blankHingeForm = () => ({ name: '', finish: '', sizeMm: '', description: '', supplier: '', colour: '', labourCost: '', price: '', isActive: 'true' });

const activeStatus = (isActive: boolean) =>
    <Status content={isActive ? 'Active' : 'Inactive'} type={isActive ? 'good' : 'warn'} />;

const hingeHeaders: HeaderItem<HingeType>[] = [
    { id: 'name', title: 'Name' },
    { id: 'finish', title: 'Finish' },
    { id: 'sizeMm', title: 'Size' },
    { id: 'supplier', title: 'Supplier' },
    { id: 'colour', title: 'Colour' },
    { id: 'price', title: 'Price', render: (_, h) => `$${h.price.toFixed(2)}` },
    { id: 'isActive', title: 'Active', render: (_, h) => activeStatus(h.isActive) },
];

const HingesTab: React.FC = () => {
    const [hingeFinish, setHingeFinish] = useState('');
    const [hingeSizeMm, setHingeSizeMm] = useState('');

    const hingeCrud = useCatalogCrud<HingeType, ReturnType<typeof blankHingeForm>>({
        fetchAll: getHingeTypes,
        create: createHingeType,
        update: updateHingeType,
        remove: deleteHingeType,
        blankForm: blankHingeForm,
        toForm: h => ({
            name: h.name, finish: h.finish ?? '', sizeMm: h.sizeMm ?? '', description: h.description ?? '',
            supplier: h.supplier ?? '', colour: h.colour ?? '', labourCost: h.labourCost?.toString() ?? '',
            price: h.price.toString(), isActive: String(h.isActive),
        }),
        toPayload: (f, editing) => ({
            name: f.name,
            finish: f.finish || null,
            sizeMm: f.sizeMm || null,
            description: f.description || null,
            supplier: f.supplier || null,
            colour: f.colour || null,
            labourCost: f.labourCost ? parseFloat(f.labourCost) : null,
            price: parseFloat(f.price) || 0,
            isActive: f.isActive === 'true',
            createdAt: editing?.createdAt ?? todayISO(),
        }),
        getId: h => h.id,
    });

    const availableHingeFinishes = distinctValues(hingeCrud.items, 'finish');
    const availableHingeSizes = distinctValues(hingeCrud.items, 'sizeMm');

    const filteredHinges = hingeCrud.items.filter(h => {
        if (hingeFinish && h.finish !== hingeFinish) return false;
        if (hingeSizeMm && h.sizeMm !== hingeSizeMm) return false;
        return true;
    });

    if (hingeCrud.loading) return <Loading />;

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={hingeCrud.openNew}>New Hinge</Button>
            </div>
            <FilterBar
                showClear={!!(hingeFinish || hingeSizeMm)}
                onClear={() => { setHingeFinish(''); setHingeSizeMm(''); }}
            >
                <FilterSelect label="Finish" value={hingeFinish} onChange={setHingeFinish} options={availableHingeFinishes} />
                <FilterSelect label="Size" value={hingeSizeMm} onChange={setHingeSizeMm} options={availableHingeSizes} />
            </FilterBar>

            <Table
                headers={hingeHeaders}
                rows={filteredHinges}
                onRowClick={hingeCrud.openEdit}
                emptyMessage="No hinges match the selected filters."
            />

            <Modal
                isOpen={hingeCrud.modalOpen}
                onClose={hingeCrud.closeModal}
                title={hingeCrud.editing ? `Edit ${hingeCrud.editing.name}` : 'New Hinge'}
                onConfirm={hingeCrud.handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Name" name="name" value={hingeCrud.form.name} onChange={hingeCrud.handleChange} placeholder="e.g. Butt Hinge" />
                    <SelectField label="Active" name="isActive" value={hingeCrud.form.isActive} onChange={hingeCrud.handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                <div className="form-row">
                    <TextField label="Finish" name="finish" value={hingeCrud.form.finish} onChange={hingeCrud.handleChange} placeholder="e.g. Satin Stainless" />
                    <TextField label="Size (mm)" name="sizeMm" value={hingeCrud.form.sizeMm} onChange={hingeCrud.handleChange} placeholder="e.g. 100mm" />
                </div>
                <div className="form-row">
                    <TextField label="Supplier" name="supplier" value={hingeCrud.form.supplier} onChange={hingeCrud.handleChange} placeholder="e.g. Halliday & Baillie" />
                    <TextField label="Colour" name="colour" value={hingeCrud.form.colour} onChange={hingeCrud.handleChange} placeholder="e.g. Black" />
                </div>
                <div className="form-row">
                    <TextField label="Price" type="number" name="price" value={hingeCrud.form.price} onChange={hingeCrud.handleChange} placeholder="0.00" />
                    <TextField label="Labour Cost" type="number" name="labourCost" value={hingeCrud.form.labourCost} onChange={hingeCrud.handleChange} placeholder="0.00" />
                </div>
                <TextAreaField label="Description" name="description" value={hingeCrud.form.description} onChange={hingeCrud.handleChange} />
                {hingeCrud.editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={hingeCrud.handleDelete}>Delete Hinge</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HingesTab;
