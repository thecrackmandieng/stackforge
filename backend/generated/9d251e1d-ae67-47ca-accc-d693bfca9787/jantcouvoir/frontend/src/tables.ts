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
    "name": "users",
    "title": "Users",
    "routePath": "users",
    "entityName": "users",
    "primaryKey": "id",
    "columns": [
      {
        "propertyName": "id",
        "label": "Id",
        "inputType": "number",
        "editable": false
      },
      {
        "propertyName": "name",
        "label": "Name",
        "inputType": "text",
        "editable": true
      },
      {
        "propertyName": "email",
        "label": "Email",
        "inputType": "email",
        "editable": true
      }
    ]
  },
  {
    "name": "products",
    "title": "Products",
    "routePath": "products",
    "entityName": "products",
    "primaryKey": "id",
    "columns": [
      {
        "propertyName": "id",
        "label": "Id",
        "inputType": "number",
        "editable": false
      },
      {
        "propertyName": "label",
        "label": "Label",
        "inputType": "text",
        "editable": true
      },
      {
        "propertyName": "price",
        "label": "Price",
        "inputType": "number",
        "editable": true
      }
    ]
  }
];
