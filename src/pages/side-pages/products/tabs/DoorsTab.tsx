import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorType } from '../../door-types/model';
import { getDoorTypes } from '../../door-types/api';
import Button from '../../../../components/button';
import { Status } from '../../../../components/status';
import { Table } from '../../../../components/table';
import { HeaderItem } from '../../../../components/table/model';
import { FilterBar, FilterSelect } from '../../../../components/filter-bar';
import { distinctValues } from '../../../../shared/collections';
import { useFetch } from '../../../../hooks/useFetch';
import Loading from '../../../../components/loading';

const headers: HeaderItem<DoorType>[] = [
    { id: 'name', title: 'Name' },
    { id: 'leafType', title: 'Category' },
    { id: 'material', title: 'Core' },
    { id: 'skinThickness', title: 'Skin' },
    { id: 'colour', title: 'Colour' },
    {
        id: 'isActive',
        title: 'Active',
        render: (_, d) => <Status content={d.isActive ? 'Active' : 'Inactive'} type={d.isActive ? 'good' : 'warn'} />,
    },
];

const DoorsTab: React.FC = () => {
    const navigate = useNavigate();
    const { data: doorTypes, loading } = useFetch(getDoorTypes, [] as DoorType[], 'Failed to load doors.');
    const [leafType, setLeafType] = useState('');
    const [material, setMaterial] = useState('');

    if (loading) return <Loading />;

    const availableLeafTypes = distinctValues(doorTypes, 'leafType', false);
    const filteredByLeaf = leafType ? doorTypes.filter(d => d.leafType === leafType) : doorTypes;
    const availableMaterials = distinctValues(filteredByLeaf, 'material', false);
    const results = material ? filteredByLeaf.filter(d => d.material === material) : filteredByLeaf;

    return (
        <div className="hw-section">
            <div className="hw-tab-actions">
                <Button variant="primary" onClick={() => navigate('/doors/new')}>New Door</Button>
            </div>
            <FilterBar
                showClear={!!(leafType || material)}
                onClear={() => { setLeafType(''); setMaterial(''); }}
            >
                <FilterSelect label="Category" value={leafType} onChange={v => { setLeafType(v); setMaterial(''); }} options={availableLeafTypes} />
                <FilterSelect label="Core" value={material} onChange={setMaterial} options={availableMaterials} disabled={availableMaterials.length === 0} />
            </FilterBar>
            <Table
                headers={headers}
                rows={results}
                onRowClick={d => navigate(`/doors/${d.id}`)}
                emptyMessage="No doors match the selected filters."
            />
        </div>
    );
};

export default DoorsTab;
