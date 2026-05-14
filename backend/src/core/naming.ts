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

export function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function toPascalCase(value: string): string {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  const result = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  return RESERVED.has(result) ? `${result}Value` : result;
}

export function toTitle(value: string): string {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function sanitizePackageName(value: string): string {
  const name = toKebabCase(value) || 'generated-app';
  return name.replace(/^-+/, '').replace(/[^a-z0-9-]/g, '');
}

export function quoteJs(value: string): string {
  return JSON.stringify(value);
}
