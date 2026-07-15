import React, { useEffect, useState } from 'react';
import { JambType, JambRequirement } from '../../jamb-types/model';
import { getJambTypes, createJambType, updateJambType, deleteJambType, getJambRequirements, createJambRequirement, deleteJambRequirement } from '../../jamb-types/api';
import { Status } from '../../../../components/status';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import { TextField, SelectField, TextAreaField } from '../../../../components/form-field';
import { useCatalogCrud } from '../../../../hooks/useCatalogCrud';
import { todayISO } from '../../../../shared/format';
import Loading from '../../../../components/loading';

const blankJambForm = () => ({
    name: '', description: '', supplier: '', colour: '', labourCost: '',
    costPerMetre: '', profileSize: '', rebateGroove: '', code: '', price: '', isActive: 'true',
});

const activeStatus = (isActive: boolean) =>
    <Status content={isActive ? 'Active' : 'Inactive'} type={isActive ? 'good' : 'warn'} />;

const jambHeaders: HeaderItem<JambType>[] = [
    { id: 'name', title: 'Name' },
    { id: 'profileSize', title: 'Profile' },
    { id: 'supplier', title: 'Supplier' },
    { id: 'colour', title: 'Colour' },
    { id: 'costPerMetre', title: 'Cost / Metre', render: (_, j) => j.costPerMetre ? `$${j.costPerMetre.toFixed(2)}` : '—' },
    { id: 'isActive', title: 'Active', render: (_, j) => activeStatus(j.isActive) },
];

const blankRequirementForm = () => ({ unitType: 'Single', heightMm: '1980', metresRequired: '' });

const JambsTab: React.FC = () => {
    const [requirements, setRequirements] = useState<JambRequirement[]>([]);
    const [reqForm, setReqForm] = useState(blankRequirementForm());
    const [reqLoading, setReqLoading] = useState(true);

    useEffect(() => {
        getJambRequirements().then(setRequirements).finally(() => setReqLoading(false));
    }, []);

    const jambCrud = useCatalogCrud<JambType, ReturnType<typeof blankJambForm>>({
        fetchAll: getJambTypes,
        create: createJambType,
        update: updateJambType,
        remove: deleteJambType,
        blankForm: blankJambForm,
        toForm: j => ({
            name: j.name, description: j.description ?? '', supplier: j.supplier ?? '', colour: j.colour ?? '',
            labourCost: j.labourCost?.toString() ?? '', costPerMetre: j.costPerMetre?.toString() ?? '',
            profileSize: j.profileSize ?? '', rebateGroove: j.rebateGroove ?? '', code: j.code ?? '',
            price: j.price.toString(), isActive: String(j.isActive),
        }),
        toPayload: (f, editing) => ({
            name: f.name,
            description: f.description || null,
            supplier: f.supplier || null,
            colour: f.colour || null,
            labourCost: f.labourCost ? parseFloat(f.labourCost) : null,
            costPerMetre: f.costPerMetre ? parseFloat(f.costPerMetre) : null,
            profileSize: f.profileSize || null,
            rebateGroove: f.rebateGroove || null,
            code: f.code || null,
            price: parseFloat(f.price) || 0,
            isActive: f.isActive === 'true',
            createdAt: editing?.createdAt ?? todayISO(),
        }),
        getId: j => j.id,
    });

    const handleAddRequirement = () => {
        if (!reqForm.unitType || !reqForm.heightMm || !reqForm.metresRequired) return;
        createJambRequirement({
            unitType: reqForm.unitType,
            heightMm: parseInt(reqForm.heightMm),
            metresRequired: parseFloat(reqForm.metresRequired),
        } as Omit<JambRequirement, 'id'>).then(saved => {
            setRequirements(prev => [...prev, saved]);
            setReqForm(prev => ({ ...prev, metresRequired: '' }));
        });
    };

    const handleDeleteRequirement = (id: number) => {
        deleteJambRequirement(id).then(() => setRequirements(prev => prev.filter(r => r.id !== id)));
    };

    if (jambCrud.loading || reqLoading) return <Loading />;

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={jambCrud.openNew}>New Jamb</Button>
            </div>

            <Table
                headers={jambHeaders}
                rows={jambCrud.items}
                onRowClick={jambCrud.openEdit}
                emptyMessage="No jamb types found."
            />

            <div className="pricing-matrix">
                <label>Metres Required (Unit Type × Height)</label>
                <table className="pricing-table">
                    <thead>
                        <tr>
                            <th>Unit Type</th>
                            <th>Height (mm)</th>
                            <th>Metres Required</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requirements
                            .slice()
                            .sort((a, b) => a.unitType.localeCompare(b.unitType) || a.heightMm - b.heightMm)
                            .map(r => (
                                <tr key={r.id}>
                                    <td>{r.unitType}</td>
                                    <td>{r.heightMm}</td>
                                    <td>{r.metresRequired}</td>
                                    <td><Button variant="danger" onClick={() => handleDeleteRequirement(r.id)}>Remove</Button></td>
                                </tr>
                            ))}
                        <tr className="pricing-add-row">
                            <td>
                                <input value={reqForm.unitType} onChange={e => setReqForm(prev => ({ ...prev, unitType: e.target.value }))} placeholder="e.g. Single, Pair" />
                            </td>
                            <td>
                                <input type="number" value={reqForm.heightMm} onChange={e => setReqForm(prev => ({ ...prev, heightMm: e.target.value }))} placeholder="1980" />
                            </td>
                            <td>
                                <input type="number" step="0.1" value={reqForm.metresRequired} onChange={e => setReqForm(prev => ({ ...prev, metresRequired: e.target.value }))} placeholder="e.g. 5.2" />
                            </td>
                            <td>
                                <Button variant="secondary" onClick={handleAddRequirement}>Add</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className="pricing-hint">Drives loose jamb cost on quote lines: CostPerMetre × MetresRequired for the item's configuration and height.</p>
            </div>

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
                    <TextField label="Profile Size" name="profileSize" value={jambCrud.form.profileSize} onChange={jambCrud.handleChange} placeholder="e.g. 112 x 18" />
                    <TextField label="Rebate / Groove" name="rebateGroove" value={jambCrud.form.rebateGroove} onChange={jambCrud.handleChange} placeholder="e.g. 10mm grooves" />
                    <TextField label="Code" name="code" value={jambCrud.form.code} onChange={jambCrud.handleChange} placeholder="e.g. DG11618-54" />
                </div>
                <div className="form-row">
                    <TextField label="Supplier" name="supplier" value={jambCrud.form.supplier} onChange={jambCrud.handleChange} />
                    <TextField label="Colour" name="colour" value={jambCrud.form.colour} onChange={jambCrud.handleChange} />
                </div>
                <div className="form-row">
                    <TextField label="Cost / Metre" type="number" name="costPerMetre" value={jambCrud.form.costPerMetre} onChange={jambCrud.handleChange} placeholder="0.00" />
                    <TextField label="Labour Cost" type="number" name="labourCost" value={jambCrud.form.labourCost} onChange={jambCrud.handleChange} placeholder="0.00" />
                    <TextField label="Legacy Flat Price" type="number" name="price" value={jambCrud.form.price} onChange={jambCrud.handleChange} placeholder="0.00" />
                </div>
                <TextAreaField label="Description" name="description" value={jambCrud.form.description} onChange={jambCrud.handleChange} placeholder="e.g. 112mm flat jamb, 19mm stop" />
                {jambCrud.editing && (
                    <div className="delete-divider">
                        <Button variant="danger" onClick={jambCrud.handleDelete}>Delete Jamb</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default JambsTab;
