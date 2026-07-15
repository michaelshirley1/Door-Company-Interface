import { OrderItem } from '../../../jobs/model';
import { DoorType } from '../../../../side-pages/door-types/model';
import { HingeType } from '../../../../side-pages/hinge-types/model';
import { HandleType } from '../../../../side-pages/handle-types/model';
import { JambType, JambRequirement } from '../../../../side-pages/jamb-types/model';
import { CavitySliderType } from '../../../../side-pages/cavity-sliders/model';
import { TrackType } from '../../../../side-pages/track-types/model';
import { Product } from '../../../../side-pages/products/model';

export interface QuoteItemModalProps {
    isOpen: boolean;
    sortOrder: number;
    doorTypes: DoorType[];
    hingeTypes: HingeType[];
    handleTypes: HandleType[];
    jambTypes: JambType[];
    jambRequirements: JambRequirement[];
    cavitySliderTypes: CavitySliderType[];
    trackTypes: TrackType[];
    products: Product[];
    defaultMarginPercent: number;
    editIndex?: number | null;
    initialItem?: OrderItem | null;
    onAdd: (item: OrderItem, editIndex: number | null) => void;
    onClose: () => void;
}
