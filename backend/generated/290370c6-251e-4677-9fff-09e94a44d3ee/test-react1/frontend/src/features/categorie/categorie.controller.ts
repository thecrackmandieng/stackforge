import { FormEvent, useEffect, useState } from 'react';
import { Categorie, CategoriePayload } from './categorie.model';
import { categorieService } from './categorie.service';

const emptyForm: CategoriePayload = {
    nomCategorie: '',
    description: '',
    createdAt: ''
};

const editableFields = ["nomCategorie", "description", "createdAt"] as const;

export function useCategorieController() {
  const [rows, setRows] = useState<Categorie[]>([]);
  const [form, setForm] = useState<CategoriePayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    try {
      setRows(await categorieService.list());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function updateField(field: keyof CategoriePayload, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(row: Categorie): void {
    setEditingId(row.idCategorie as string | number);
    setForm(
      Object.fromEntries(editableFields.map((field) => [field, row[field] ?? ''])) as CategoriePayload
    );
  }

  function reset(): void {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      if (editingId) {
        await categorieService.update(editingId, form);
      } else {
        await categorieService.create(form);
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
  }

  async function remove(row: Categorie): Promise<void> {
    try {
      await categorieService.remove(row.idCategorie as string | number);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  }

  return {
    rows,
    form,
    editingId,
    error,
    loading,
    submit,
    edit,
    remove,
    reset,
    updateField
  };
}
