import React, { useState } from 'react';
import { HandleType } from '../../handle-types/model';
import { getHandleTypes, createHandleType, updateHandleType, deleteHandleType } from '../../handle-types/api';
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

const blankHandleForm = () => ({ name: '', finish: '', mechanism: '', description: '', supplier: '', colour: '', labourCost: '', price: '', isActive: 'true' });

const activeStatus = (isActive: boolean) =>
    <Status content={isActive ? 'Active' : 'Inactive'} type={isActive ? 'good' : 'warn'} />;

const handleHeaders: HeaderItem<HandleType>[] = [
    { id: 'name', title: 'Name' },
    { id: 'finish', title: 'Finish' },
    { id: 'mechanism', title: 'Mechanism' },
    { id: 'supplier', title: 'Supplier' },
    { id: 'colour', title: 'Colour' },
    { id: 'price', title: 'Price', render: (_, h) => `$${h.price.toFixed(2)}` },
    { id: 'isActive', title: 'Active', render: (_, h) => activeStatus(h.isActive) },
];

const HandlesTab: React.FC = () => {
    const [handleMechanism, setHandleMechanism] = useState('');
    const [handleFinish, setHandleFinish] = useState('');

    const handleCrud = useCatalogCrud<HandleType, ReturnType<typeof blankHandleForm>>({
        fetchAll: getHandleTypes,
        create: createHandleType,
        update: updateHandleType,
        remove: deleteHandleType,
        blankForm: blankHandleForm,
        toForm: h => ({
            name: h.name, finish: h.finish ?? '', mechanism: h.mechanism ?? '', description: h.description ?? '',
            supplier: h.supplier ?? '', colour: h.colour ?? '', labourCost: h.labourCost?.toString() ?? '',
            price: h.price.toString(), isActive: String(h.isActive),
        }),
        toPayload: (f, editing) => ({
            name: f.name,
            finish: f.finish || null,
            mechanism: f.mechanism || null,
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

    const availableMechanisms = distinctValues(handleCrud.items, 'mechanism');
    const availableHandleFinishes = distinctValues(handleCrud.items, 'finish');

    const filteredHandles = handleCrud.items.filter(h => {
        if (handleMechanism && h.mechanism !== handleMechanism) return false;
        if (handleFinish && h.finish !== handleFinish) return false;
        return true;
    });

    if (handleCrud.loading) return <Loading />;

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={handleCrud.openNew}>New Handle</Button>
            </div>
            <FilterBar
                showClear={!!(handleMechanism || handleFinish)}
                onClear={() => { setHandleMechanism(''); setHandleFinish(''); }}
            >
                <FilterSelect label="Mechanism" value={handleMechanism} onChange={setHandleMechanism} options={availableMechanisms} />
                <FilterSelect label="Finish" value={handleFinish} onChange={setHandleFinish} options={availableHandleFinishes} />
            </FilterBar>

            <Table
                headers={handleHeaders}
                rows={filteredHandles}
                onRowClick={handleCrud.openEdit}
                emptyMessage="No handles match the selected filters."
            />

            <Modal
                isOpen={handleCrud.modalOpen}
                onClose={handleCrud.closeModal}
                title={handleCrud.editing ? `Edit ${handleCrud.editing.name}` : 'New Handle'}
                onConfirm={handleCrud.handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Name" name="name" value={handleCrud.form.name} onChange={handleCrud.handleChange} placeholder="e.g. Lever Handle" />
                    <SelectField label="Active" name="isActive" value={handleCrud.form.isActive} onChange={handleCrud.handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                <div className="form-row">
                    <TextField label="Finish" name="finish" value={handleCrud.form.finish} onChange={handleCrud.handleChange} placeholder="e.g. Satin Chrome" />
                    <TextField label="Mechanism" name="mechanism" value={handleCrud.form.mechanism} onChange={handleCrud.handleChange} placeholder="e.g. Passage, Privacy" />
                </div>
                <div className="form-row">
                    <TextField label="Supplier" name="supplier" value={handleCrud.form.supplier} onChange={handleCrud.handleChange} placeholder="e.g. Halliday & Baillie" />
                    <TextField label="Colour" name="colour" value={handleCrud.form.colour} onChange={handleCrud.handleChange} placeholder="e.g. Black" />
                </div>
                <div className="form-row">
                    <TextField label="Price" type="number" name="price" value={handleCrud.form.price} onChange={handleCrud.handleChange} placeholder="0.00" />
                    <TextField label="Labour Cost" type="number" name="labourCost" value={handleCrud.form.labourCost} onChange={handleCrud.handleChange} placeholder="0.00" />
                </div>
                <TextAreaField label="Description" name="description" value={handleCrud.form.description} onChange={handleCrud.handleChange} />
                {handleCrud.editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={handleCrud.handleDelete}>Delete Handle</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HandlesTab;
