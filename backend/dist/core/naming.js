"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toKebabCase = toKebabCase;
exports.toPascalCase = toPascalCase;
exports.toCamelCase = toCamelCase;
exports.toTitle = toTitle;
exports.sanitizePackageName = sanitizePackageName;
exports.quoteJs = quoteJs;
const RESERVED = new Set([
    'class',
    'const',
    'default',
    'delete',
    'export',
    'function',
    'import',
    'new',
    'return',
    'var'
]);
function toKebabCase(value) {
    return value
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}
function toPascalCase(value) {
    return toKebabCase(value)
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
function toCamelCase(value) {
    const pascal = toPascalCase(value);
    const result = pascal.charAt(0).toLowerCase() + pascal.slice(1);
    return RESERVED.has(result) ? `${result}Value` : result;
}
function toTitle(value) {
    return toKebabCase(value)
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
function sanitizePackageName(value) {
    const name = toKebabCase(value) || 'generated-app';
    return name.replace(/^-+/, '').replace(/[^a-z0-9-]/g, '');
}
function quoteJs(value) {
    return JSON.stringify(value);
}
//# sourceMappingURL=naming.js.map