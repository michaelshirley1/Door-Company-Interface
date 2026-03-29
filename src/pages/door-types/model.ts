export interface DoorTypesPageProps {}

export interface DoorType {
    id: number;
    name: string;
    material: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: string;
}
