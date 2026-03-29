export interface FormWrapperProps {
    title: string;
    onSubmit: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    children: React.ReactNode;
}
