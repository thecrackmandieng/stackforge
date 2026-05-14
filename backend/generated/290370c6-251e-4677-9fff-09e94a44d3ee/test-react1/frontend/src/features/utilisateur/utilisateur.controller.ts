import { FormEvent, useEffect, useState } from 'react';
import { Utilisateur, UtilisateurPayload } from './utilisateur.model';
import { utilisateurService } from './utilisateur.service';

const emptyForm: UtilisateurPayload = {
    nom: '',
    email: '',
    password: '',
    createdAt: ''
};

const editableFields = ["nom", "email", "password", "createdAt"] as const;

export function useUtilisateurController() {
  const [rows, setRows] = useState<Utilisateur[]>([]);
  const [form, setForm] = useState<UtilisateurPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    try {
      setRows(await utilisateurService.list());
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

  function updateField(field: keyof UtilisateurPayload, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(row: Utilisateur): void {
    setEditingId(row.idUtilisateur as string | number);
    setForm(
      Object.fromEntries(editableFields.map((field) => [field, row[field] ?? ''])) as UtilisateurPayload
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
        await utilisateurService.update(editingId, form);
      } else {
        await utilisateurService.create(form);
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
  }

  async function remove(row: Utilisateur): Promise<void> {
    try {
      await utilisateurService.remove(row.idUtilisateur as string | number);
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
