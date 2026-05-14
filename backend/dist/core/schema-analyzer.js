"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSchema = normalizeSchema;
const naming_1 = require("./naming");
function toTsType(column) {
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
function toHtmlInputType(column) {
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
function normalizeColumn(column) {
    return {
        ...column,
        propertyName: (0, naming_1.toCamelCase)(column.name),
        label: (0, naming_1.toTitle)(column.name),
        tsType: toTsType(column),
        htmlInputType: toHtmlInputType(column)
    };
}
function fallbackPrimaryKey(columns) {
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
function normalizeSchema(projectName, schema) {
    if (!schema.tables.length) {
        throw new Error('Aucune table detectee dans la base de donnees.');
    }
    const tables = schema.tables.map((table) => {
        const columns = table.columns.map(normalizeColumn);
        const primaryKey = fallbackPrimaryKey(columns);
        const columnsWithPk = columns.map((column) => column.name === primaryKey.name ? { ...column, primaryKey: true } : column);
        const editableColumns = columnsWithPk.filter((column) => !column.primaryKey && !column.autoIncrement);
        return {
            ...table,
            entityName: (0, naming_1.toKebabCase)(table.name),
            className: (0, naming_1.toPascalCase)(table.name),
            variableName: (0, naming_1.toCamelCase)(table.name),
            routePath: (0, naming_1.toKebabCase)(table.name),
            primaryKey,
            columns: columnsWithPk,
            editableColumns
        };
    });
    return {
        ...schema,
        projectName,
        packageName: (0, naming_1.sanitizePackageName)(projectName),
        appTitle: (0, naming_1.toTitle)(projectName),
        tables
    };
}
//# sourceMappingURL=schema-analyzer.js.map