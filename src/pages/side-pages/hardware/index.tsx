import React, { useState } from 'react';
import { HardwarePageProps, HardwareTab } from './model';
import { HandleType } from '../handle-types/model';
import { HingeType } from '../hinge-types/model';
import { JambType } from '../jamb-types/model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Status } from '../../../components/status';
import { Table } from '../../../components/table';
import { HeaderItem } from '../../../components/table/model';
import { FilterBar, FilterSelect } from '../../../components/filter-bar';
import { getHandleTypes, createHandleType, updateHandleType, deleteHandleType } from '../handle-types/api';
import { getHingeTypes, createHingeType, updateHingeType, deleteHingeType } from '../hinge-types/api';
import { getJambTypes, createJambType, updateJambType, deleteJambType } from '../jamb-types/api';
import Modal from '../../../components/modal';
import Button from '../../../components/button';
import { TextField, SelectField, TextAreaField } from '../../../components/form-field';
import { useCatalogCrud } from '../../../hooks/useCatalogCrud';
import { distinctValues } from '../../../shared/collections';
import { todayISO } from '../../../shared/format';

import Loading from '../../../components/loading';

import './styles.scss';

const blankHandleForm = () => ({ name: '', finish: '', mechanism: '', description: '', price: '', isActive: 'true' });
const blankHingeForm  = () => ({ name: '', finish: '', sizeMm: '',   description: '', price: '', isActive: 'true' });
const blankJambForm   = () => ({ name: '', description: '', price: '', isActive: 'true' });

const activeStatus = (isActive: boolean) =>
    <Status content={isActive ? 'Active' : 'Inactive'} type={isActive ? 'good' : 'warn'} />;

const handleHeaders: HeaderItem<HandleType>[] = [
    { id: 'name',      title: 'Name' },
    { id: 'finish',    title: 'Finish' },
    { id: 'mechanism', title: 'Mechanism' },
    { id: 'price',     title: 'Price', render: (_, h) => `$${h.price.toFixed(2)}` },
    { id: 'isActive',  title: 'Active', render: (_, h) => activeStatus(h.isActive) },
];

const hingeHeaders: HeaderItem<HingeType>[] = [
    { id: 'name',     title: 'Name' },
    { id: 'finish',   title: 'Finish' },
    { id: 'sizeMm',   title: 'Size' },
    { id: 'price',    title: 'Price', render: (_, h) => `$${h.price.toFixed(2)}` },
    { id: 'isActive', title: 'Active', render: (_, h) => activeStatus(h.isActive) },
];

const jambHeaders: HeaderItem<JambType>[] = [
    { id: 'name',        title: 'Name' },
    { id: 'description', title: 'Description' },
    { id: 'price',       title: 'Price', render: (_, j) => j.price > 0 ? `$${j.price.toFixed(2)}` : '—' },
    { id: 'isActive',    title: 'Active', render: (_, j) => activeStatus(j.isActive) },
];

const HardwarePage: React.FC<HardwarePageProps> = () => {
    const [tab, setTab] = useState<HardwareTab>('handles');

    const [handleMechanism, setHandleMechanism] = useState('');
    const [handleFinish,    setHandleFinish]    = useState('');
    const [hingeFinish,     setHingeFinish]     = useState('');
    const [hingeSizeMm,     setHingeSizeMm]     = useState('');

    const handleCrud = useCatalogCrud<HandleType, ReturnType<typeof blankHandleForm>>({
        fetchAll: getHandleTypes,
        create:   createHandleType,
        update:   updateHandleType,
        remove:   deleteHandleType,
        blankForm: blankHandleForm,
        toForm: h => ({ name: h.name, finish: h.finish ?? '', mechanism: h.mechanism ?? '', description: h.description ?? '', price: h.price.toString(), isActive: String(h.isActive) }),
        toPayload: (f, editing) => ({
            name:        f.name,
            finish:      f.finish      || null,
            mechanism:   f.mechanism   || null,
            description: f.description || null,
            price:       parseFloat(f.price) || 0,
            isActive:    f.isActive === 'true',
            createdAt:   editing?.createdAt ?? todayISO(),
        }),
        getId: h => h.id,
    });

    const hingeCrud = useCatalogCrud<HingeType, ReturnType<typeof blankHingeForm>>({
        fetchAll: getHingeTypes,
        create:   createHingeType,
        update:   updateHingeType,
        remove:   deleteHingeType,
        blankForm: blankHingeForm,
        toForm: h => ({ name: h.name, finish: h.finish ?? '', sizeMm: h.sizeMm ?? '', description: h.description ?? '', price: h.price.toString(), isActive: String(h.isActive) }),
        toPayload: (f, editing) => ({
            name:        f.name,
            finish:      f.finish      || null,
            sizeMm:      f.sizeMm      || null,
            description: f.description || null,
            price:       parseFloat(f.price) || 0,
            isActive:    f.isActive === 'true',
            createdAt:   editing?.createdAt ?? todayISO(),
        }),
        getId: h => h.id,
    });

    const jambCrud = useCatalogCrud<JambType, ReturnType<typeof blankJambForm>>({
        fetchAll: getJambTypes,
        create:   createJambType,
        update:   updateJambType,
        remove:   deleteJambType,
        blankForm: blankJambForm,
        toForm: j => ({ name: j.name, description: j.description ?? '', price: j.price.toString(), isActive: String(j.isActive) }),
        toPayload: (f, editing) => ({
            name:        f.name,
            description: f.description || null,
            price:       parseFloat(f.price) || 0,
            isActive:    f.isActive === 'true',
            createdAt:   editing?.createdAt ?? todayISO(),
        }),
        getId: j => j.id,
    });

    const availableMechanisms     = distinctValues(handleCrud.items, 'mechanism');
    const availableHandleFinishes = distinctValues(handleCrud.items, 'finish');
    const availableHingeFinishes  = distinctValues(hingeCrud.items, 'finish');
    const availableHingeSizes     = distinctValues(hingeCrud.items, 'sizeMm');

    const filteredHandles = handleCrud.items.filter(h => {
        if (handleMechanism && h.mechanism !== handleMechanism) return false;
        if (handleFinish    && h.finish    !== handleFinish)    return false;
        return true;
    });

    const filteredHinges = hingeCrud.items.filter(h => {
        if (hingeFinish && h.finish  !== hingeFinish) return false;
        if (hingeSizeMm && h.sizeMm  !== hingeSizeMm) return false;
        return true;
    });

    if (handleCrud.loading || hingeCrud.loading || jambCrud.loading) return <Loading />;

    return (
        <PageWrapper
            title="Hardware"
            buttonTitle={tab === 'handles' ? 'New Handle' : tab === 'hinges' ? 'New Hinge' : 'New Jamb'}
            buttonAction={tab === 'handles' ? handleCrud.openNew : tab === 'hinges' ? hingeCrud.openNew : jambCrud.openNew}
        >
            <div className="hw-tabs">
                <button className={tab === 'handles' ? 'hw-tab active' : 'hw-tab'} onClick={() => setTab('handles')}>Handles</button>
                <button className={tab === 'hinges'  ? 'hw-tab active' : 'hw-tab'} onClick={() => setTab('hinges')}>Hinges</button>
                <button className={tab === 'jambs'   ? 'hw-tab active' : 'hw-tab'} onClick={() => setTab('jambs')}>Jambs</button>
            </div>

            {tab === 'handles' && (
                <div className="hw-section">
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
                </div>
            )}

            {tab === 'hinges' && (
                <div className="hw-section">
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
                </div>
            )}

            {tab === 'jambs' && (
                <div className="hw-section">
                    <Table
                        headers={jambHeaders}
                        rows={jambCrud.items}
                        onRowClick={jambCrud.openEdit}
                        emptyMessage="No jamb types found."
                    />
                </div>
            )}

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
                    <TextField label="Price" type="number" name="price" value={handleCrud.form.price} onChange={handleCrud.handleChange} placeholder="0.00" />
                </div>
                <TextAreaField label="Description" name="description" value={handleCrud.form.description} onChange={handleCrud.handleChange} />
                {handleCrud.editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={handleCrud.handleDelete}>Delete Handle</Button>
                    </div>
                )}
            </Modal>

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
                    <TextField label="Price" type="number" name="price" value={hingeCrud.form.price} onChange={hingeCrud.handleChange} placeholder="0.00" />
                </div>
                <TextAreaField label="Description" name="description" value={hingeCrud.form.description} onChange={hingeCrud.handleChange} />
                {hingeCrud.editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={hingeCrud.handleDelete}>Delete Hinge</Button>
                    </div>
                )}
            </Modal>
            <Modal
                isOpen={jambCrud.modalOpen}
                onClose={jambCrud.closeModal}
                title={jambCrud.editing ? `Edit ${jambCrud.editing.name}` : 'New Jamb'}
                onConfirm={jambCrud.handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <TextField label="Name" name="name" value={jambCrud.form.name} onChange={jambCrud.handleChange} placeholder="e.g. 112 19 Flat" />
                    <SelectField label="Active" name="isActive" value={jambCrud.form.isActive} onChange={jambCrud.handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </SelectField>
                </div>
                <div className="form-row">
                    <TextField label="Price" type="number" name="price" value={jambCrud.form.price} onChange={jambCrud.handleChange} placeholder="0.00" />
                </div>
                <TextAreaField label="Description" name="description" value={jambCrud.form.description} onChange={jambCrud.handleChange} placeholder="e.g. 112mm flat jamb, 19mm stop" />
                {jambCrud.editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={jambCrud.handleDelete}>Delete Jamb</Button>
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
};

export default HardwarePage;
