export interface HingeTypesPageProps {}

export interface HingeType {
    id: number;
    name: string;
    finish: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: string;
}
