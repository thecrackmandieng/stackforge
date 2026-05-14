import {
  ColumnSchema,
  DatabaseSchema,
  NormalizedColumn,
  NormalizedSchema,
  NormalizedTable
} from './types';
import { sanitizePackageName, toCamelCase, toKebabCase, toPascalCase, toTitle } from './naming';

function toTsType(column: ColumnSchema): string {
  const type = column.type.toLowerCase();

  if (type.includes('int') || type.includes('decimal') || type.includes('numeric') || type.includes('float') || type.includes('double') || type.includes('real')) {
    return 'number';
  }

  if (type.includes('bool')) {
    return 'boolean';
  }

  if (type.includes('date') || type.includes('time')) {
    return 'string';
  }

  return 'string';
}

function toHtmlInputType(column: ColumnSchema): string {
  const type = column.type.toLowerCase();
  const name = column.name.toLowerCase();

  if (type.includes('int') || type.includes('decimal') || type.includes('numeric') || type.includes('float') || type.includes('double')) {
    return 'number';
  }

  if (type.includes('datetime') || type.includes('timestamp') || (type.includes('date') && type.includes('time'))) {
    return 'datetime-local';
  }

  if (type.includes('date')) {
    return 'date';
  }

  if (name.includes('email')) {
    return 'email';
  }

  if (name.includes('password')) {
    return 'password';
  }

  return 'text';
}

function normalizeColumn(column: ColumnSchema): NormalizedColumn {
  return {
    ...column,
    propertyName: toCamelCase(column.name),
    label: toTitle(column.name),
    tsType: toTsType(column),
    htmlInputType: toHtmlInputType(column)
  };
}

function fallbackPrimaryKey(columns: NormalizedColumn[]): NormalizedColumn {
  const explicit = columns.find((column) => column.primaryKey);
  if (explicit) {
    return explicit;
  }

  const id = columns.find((column) => column.name.toLowerCase() === 'id');
  if (id) {
    return { ...id, primaryKey: true };
  }

  if (!columns[0]) {
    throw new Error('Chaque table doit contenir au moins une colonne.');
  }

  return { ...columns[0], primaryKey: true };
}

export function normalizeSchema(projectName: string, schema: DatabaseSchema): NormalizedSchema {
  if (!schema.tables.length) {
    throw new Error('Aucune table detectee dans la base de donnees.');
  }

  const tables: NormalizedTable[] = schema.tables.map((table) => {
    const columns = table.columns.map(normalizeColumn);
    const primaryKey = fallbackPrimaryKey(columns);
    const columnsWithPk = columns.map((column) =>
      column.name === primaryKey.name ? { ...column, primaryKey: true } : column
    );
    const editableColumns = columnsWithPk.filter((column) => !column.primaryKey && !column.autoIncrement);

    return {
      ...table,
      entityName: toKebabCase(table.name),
      className: toPascalCase(table.name),
      variableName: toCamelCase(table.name),
      routePath: toKebabCase(table.name),
      primaryKey,
      columns: columnsWithPk,
      editableColumns
    };
  });

  return {
    ...schema,
    projectName,
    packageName: sanitizePackageName(projectName),
    appTitle: toTitle(projectName),
    tables
  };
}
