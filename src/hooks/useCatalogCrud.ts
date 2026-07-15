import React, { useEffect, useState } from 'react';

export interface UseCatalogCrudOptions<T, FormT> {
    fetchAll: () => Promise<T[]>;
    create: (data: any) => Promise<T>;
    update: (id: number, data: any) => Promise<T>;
    remove: (id: number) => Promise<unknown>;
    blankForm: () => FormT;
    toForm: (item: T) => FormT;
    toPayload: (form: FormT, editing: T | null) => any;
    getId: (item: T) => number;
    afterSave?: (saved: T, editing: T | null) => T | Promise<T>;
    onClose?: () => void;
}

export function useCatalogCrud<T, FormT>(options: UseCatalogCrudOptions<T, FormT>) {
    const { fetchAll, create, update, remove, blankForm, toForm, toPayload, getId, afterSave, onClose } = options;

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);
    const [form, setForm] = useState<FormT>(blankForm);

    useEffect(() => {
        fetchAll().then(setItems).finally(() => setLoading(false));
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
