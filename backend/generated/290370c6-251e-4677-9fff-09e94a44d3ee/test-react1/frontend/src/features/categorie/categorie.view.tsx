import { useCategorieController } from './categorie.controller';
import './categorie.view.css';

const columns = [
  {
    "propertyName": "idCategorie",
    "label": "Id Categorie"
  },
  {
    "propertyName": "nomCategorie",
    "label": "Nom Categorie"
  },
  {
    "propertyName": "description",
    "label": "Description"
  },
  {
    "propertyName": "createdAt",
    "label": "Created At"
  }
];

const editableColumns = [
  {
    "propertyName": "nomCategorie",
    "label": "Nom Categorie",
    "inputType": "text"
  },
  {
    "propertyName": "description",
    "label": "Description",
    "inputType": "text"
  },
  {
    "propertyName": "createdAt",
    "label": "Created At",
    "inputType": "datetime-local"
  }
];

export function CategorieView() {
  const controller = useCategorieController();

  return (
    <section className="categorie-view mvc-view">
      <div className="page-hero">
        <p>CRUD MVC</p>
        <h1>Categorie</h1>
        <span>Table source: categorie</span>
      </div>

      <form className="form-grid" onSubmit={controller.submit}>
        {editableColumns.map((column) => (
          <label key={column.propertyName}>
            {column.label}
            <input
              type={column.inputType}
              value={String(controller.form[column.propertyName as keyof typeof controller.form] ?? '')}
              onChange={(event) => controller.updateField(column.propertyName as keyof typeof controller.form, event.target.value)}
            />
          </label>
        ))}
        <div className="form-actions">
          <button type="submit">{controller.editingId ? 'Modifier' : 'Creer'}</button>
          {controller.editingId && <button type="button" className="secondary" onClick={controller.reset}>Annuler</button>}
        </div>
      </form>

      {controller.error && <strong className="error">{controller.error}</strong>}
      {controller.loading && <span className="loading">Chargement...</span>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.propertyName}>{column.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {controller.rows.map((row, index) => (
              <tr key={String(row.idCategorie ?? index)}>
                {columns.map((column) => (
                  <td key={column.propertyName}>{String(row[column.propertyName as keyof typeof row] ?? '')}</td>
                ))}
                <td className="row-actions">
                  <button type="button" onClick={() => controller.edit(row)}>Editer</button>
                  <button type="button" className="danger" onClick={() => controller.remove(row)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
