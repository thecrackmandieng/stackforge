import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api';
import { TableMeta } from '../tables';

type RecordValue = string | number | boolean | null;
type DataRecord = Record<string, RecordValue>;

export function TablePage({ table }: { table: TableMeta }) {
  const [rows, setRows] = useState<DataRecord[]>([]);
  const [form, setForm] = useState<DataRecord>({});
  const [editingId, setEditingId] = useState<RecordValue>(null);
  const [error, setError] = useState('');
  const editableColumns = useMemo(() => table.columns.filter((column) => column.editable), [table]);

  async function load() {
    try {
      setRows(await apiRequest<DataRecord[]>(`/${table.routePath}`));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    }
  }

  useEffect(() => {
    setForm({});
    setEditingId(null);
    void load();
  }, [table.routePath]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const path = editingId ? `/${table.routePath}/${editingId}` : `/${table.routePath}`;
    const method = editingId ? 'PUT' : 'POST';
    await apiRequest(path, { method, body: JSON.stringify(form) });
    setForm({});
    setEditingId(null);
    await load();
  }

  async function remove(row: DataRecord) {
    await apiRequest(`/${table.routePath}/${row[table.primaryKey]}`, { method: 'DELETE' });
    await load();
  }

  function edit(row: DataRecord) {
    setEditingId(row[table.primaryKey]);
    setForm(Object.fromEntries(editableColumns.map((column) => [column.propertyName, row[column.propertyName] ?? ''])));
  }

  return (
    <section className="crud-page">
      <div className="page-hero">
        <p>CRUD</p>
        <h1>{table.title}</h1>
        <span>Table source: {table.name}</span>
      </div>

      <form className="form-grid" onSubmit={submit}>
        {editableColumns.map((column) => (
          <label key={column.propertyName}>
            {column.label}
            <input
              type={column.inputType}
              value={String(form[column.propertyName] ?? '')}
              onChange={(event) => setForm({ ...form, [column.propertyName]: event.target.value })}
            />
          </label>
        ))}
        <button type="submit">{editingId ? 'Modifier' : 'Creer'}</button>
      </form>

      {error && <strong className="error">{error}</strong>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>{table.columns.map((column) => <th key={column.propertyName}>{column.label}</th>)}<th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row[table.primaryKey] ?? index)}>
                {table.columns.map((column) => <td key={column.propertyName}>{String(row[column.propertyName] ?? '')}</td>)}
                <td><button onClick={() => edit(row)}>Editer</button><button onClick={() => remove(row)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
