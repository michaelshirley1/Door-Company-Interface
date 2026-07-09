export interface ReadOnlyFieldProps {
    label: string;
    value: string;
    /** When provided, the field is clickable (e.g. navigate to a linked record). */
    onClick?: () => void;
    /** Tooltip shown on hover, typically used with onClick. */
    title?: string;
    /** Emphasised value styling (e.g. totals). */
    strong?: boolean;
}
