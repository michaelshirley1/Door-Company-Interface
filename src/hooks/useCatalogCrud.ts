import React, { useEffect, useState } from 'react';

/**
 * Options for the generic catalog CRUD hook.
 * `remove` is typed `Promise<unknown>` so the axios-based CRUD apis
 * (which resolve with the raw response) are directly assignable.
 */
export interface UseCatalogCrudOptions<T, FormT> {
    fetchAll: () => Promise<T[]>;
    create: (data: any) => Promise<T>;
    update: (id: number, data: any) => Promise<T>;
    remove: (id: number) => Promise<unknown>;
    blankForm: () => FormT;
    toForm: (item: T) => FormT;
    toPayload: (form: FormT, editing: T | null) => any;
    getId: (item: T) => number;
    /** Optional transform/side-effect applied to the saved item before it is merged into `items`. */
    afterSave?: (saved: T, editing: T | null) => T | Promise<T>;
    /** Optional extra cleanup run whenever the modal closes (including after save/delete). */
    onClose?: () => void;
}

/**
 * Shared modal-CRUD state machine for the catalog pages
 * (cavity sliders, hardware, doors). Fetches all items on mount and
 * exposes the standard openNew/openEdit/save/delete plumbing.
 *
 * On update, the payload from `toPayload` is merged over the item being
 * edited (`{ ...editing, ...payload }`), matching the previous per-page logic.
 */
export function useCatalogCrud<T, FormT>(options: UseCatalogCrudOptions<T, FormT>) {
    const { fetchAll, create, update, remove, blankForm, toForm, toPayload, getId, afterSave, onClose } = options;

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);
    const [form, setForm] = useState<FormT>(blankForm);

    useEffect(() => {
        fetchAll().then(setItems).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openNew = () => {
        setEditing(null);
        setForm(blankForm());
        setModalOpen(true);
    };

    const openEdit = (item: T) => {
        setEditing(item);
        setForm(toForm(item));
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        onClose?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value } as FormT));

    const handleSave = () => {
        const payload = toPayload(form, editing);
        const action = editing
            ? update(getId(editing), Object.assign({}, editing, payload))
            : create(payload);
        action.then(async saved => {
            const result = afterSave ? await afterSave(saved, editing) : saved;
            setItems(prev => editing
                ? prev.map(item => getId(item) === getId(editing) ? result : item)
                : [...prev, result]
            );
            closeModal();
        });
    };

    const handleDelete = () => {
        if (!editing) return;
        remove(getId(editing)).then(() => {
            setItems(prev => prev.filter(item => getId(item) !== getId(editing)));
            closeModal();
        });
    };

    return {
        items, setItems, loading,
        modalOpen, editing, form, setForm,
        openNew, openEdit, closeModal,
        handleChange, handleSave, handleDelete,
    };
}
