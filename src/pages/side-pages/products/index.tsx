import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductsPageProps, ProductsTab as ProductsTabType } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import DoorsTab from './tabs/DoorsTab';
import CavitySlidersTab from './tabs/CavitySlidersTab';
import HandlesTab from './tabs/HandlesTab';
import HingesTab from './tabs/HingesTab';
import JambsTab from './tabs/JambsTab';
import TracksTab from './tabs/TracksTab';
import ProductsBundlesTab from './tabs/ProductsTab';

import './styles.scss';

const TABS: { id: ProductsTabType; label: string }[] = [
    { id: 'doors', label: 'Doors' },
    { id: 'cavity-sliders', label: 'Cavity Sliders' },
    { id: 'handles', label: 'Handles' },
    { id: 'hinges', label: 'Hinges' },
    { id: 'jambs', label: 'Jambs' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'products', label: 'Products' },
];

const ProductsPage: React.FC<ProductsPageProps> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = (searchParams.get('tab') as ProductsTabType) || 'doors';

    const setTab = (t: ProductsTabType) => setSearchParams({ tab: t });

    return (
        <PageWrapper title="Products" buttonTitle="" buttonAction={() => {}}>
            <div className="hw-tabs">
                {TABS.map(t => (
                    <button key={t.id} className={tab === t.id ? 'hw-tab active' : 'hw-tab'} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'doors' && <DoorsTab />}
            {tab === 'cavity-sliders' && <CavitySlidersTab />}
            {tab === 'handles' && <HandlesTab />}
            {tab === 'hinges' && <HingesTab />}
            {tab === 'jambs' && <JambsTab />}
            {tab === 'tracks' && <TracksTab />}
            {tab === 'products' && <ProductsBundlesTab />}
        </PageWrapper>
    );
};

export default ProductsPage;
