import { OrderItem } from '../../../jobs/model';
import { DoorType } from '../../../../side-pages/door-types/model';
import { HingeType } from '../../../../side-pages/hinge-types/model';
import { HandleType } from '../../../../side-pages/handle-types/model';
import { JambType } from '../../../../side-pages/jamb-types/model';

export interface QuoteItemModalProps {
    isOpen: boolean;
    sortOrder: number;
    doorTypes: DoorType[];
    hingeTypes: HingeType[];
    handleTypes: HandleType[];
    jambTypes: JambType[];
    editIndex?: number | null;
    initialItem?: OrderItem | null;
    onAdd: (item: OrderItem, editIndex: number | null) => void;
    onClose: () => void;
}
