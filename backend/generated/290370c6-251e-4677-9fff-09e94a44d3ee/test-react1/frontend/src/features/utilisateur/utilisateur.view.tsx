import { useUtilisateurController } from './utilisateur.controller';
import './utilisateur.view.css';

const columns = [
  {
    "propertyName": "idUtilisateur",
    "label": "Id Utilisateur"
  },
  {
    "propertyName": "nom",
    "label": "Nom"
  },
  {
    "propertyName": "email",
    "label": "Email"
  },
  {
    "propertyName": "password",
    "label": "Password"
  },
  {
    "propertyName": "createdAt",
    "label": "Created At"
  }
];

const editableColumns = [
  {
    "propertyName": "nom",
    "label": "Nom",
    "inputType": "text"
  },
  {
    "propertyName": "email",
    "label": "Email",
    "inputType": "email"
  },
  {
    "propertyName": "password",
    "label": "Password",
    "inputType": "password"
  },
  {
    "propertyName": "createdAt",
    "label": "Created At",
    "inputType": "datetime-local"
  }
];

export function UtilisateurView() {
  const controller = useUtilisateurController();

  return (
    <section className="utilisateur-view mvc-view">
      <div className="page-hero">
        <p>CRUD MVC</p>
        <h1>Utilisateur</h1>
        <span>Table source: utilisateur</span>
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
              <tr key={String(row.idUtilisateur ?? index)}>
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
