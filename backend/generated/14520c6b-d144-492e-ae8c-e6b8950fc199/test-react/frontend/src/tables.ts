export type TableColumn = {
  propertyName: string;
  label: string;
  inputType: string;
  editable: boolean;
};

export type TableMeta = {
  name: string;
  title: string;
  routePath: string;
  entityName: string;
  primaryKey: string;
  columns: TableColumn[];
};

export const tables: TableMeta[] = [
  {
    "name": "categorie",
    "title": "Categorie",
    "routePath": "categorie",
    "entityName": "categorie",
    "primaryKey": "idCategorie",
    "columns": [
      {
        "propertyName": "idCategorie",
        "label": "Id Categorie",
        "inputType": "number",
        "editable": false
      },
      {
        "propertyName": "nomCategorie",
        "label": "Nom Categorie",
        "inputType": "text",
        "editable": true
      },
      {
        "propertyName": "description",
        "label": "Description",
        "inputType": "text",
        "editable": true
      },
      {
        "propertyName": "createdAt",
        "label": "Created At",
        "inputType": "datetime-local",
        "editable": true
      }
    ]
  },
  {
    "name": "utilisateur",
    "title": "Utilisateur",
    "routePath": "utilisateur",
    "entityName": "utilisateur",
    "primaryKey": "idUtilisateur",
    "columns": [
      {
        "propertyName": "idUtilisateur",
        "label": "Id Utilisateur",
        "inputType": "number",
        "editable": false
      },
      {
        "propertyName": "nom",
        "label": "Nom",
        "inputType": "text",
        "editable": true
      },
      {
        "propertyName": "email",
        "label": "Email",
        "inputType": "email",
        "editable": true
      },
      {
        "propertyName": "password",
        "label": "Password",
        "inputType": "password",
        "editable": true
      },
      {
        "propertyName": "createdAt",
        "label": "Created At",
        "inputType": "datetime-local",
        "editable": true
      }
    ]
  }
];
