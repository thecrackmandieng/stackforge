import path from 'path';
import { writeTextFile } from '../../core/file-writer';
import { quoteJs } from '../../core/naming';
import { NormalizedSchema, NormalizedTable } from '../../core/types';

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function packageJson(schema: NormalizedSchema): string {
  return json({
    name: `${schema.packageName}-react`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      start: 'vite',
      dev: 'vite',
      build: 'tsc -b && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      '@vitejs/plugin-react': '^5.0.0',
      vite: '^7.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0'
    },
    devDependencies: {
      typescript: '~5.9.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0'
    }
  });
}

function tsConfig(): string {
  return json({
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      allowJs: false,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx'
    },
    include: ['src']
  });
}

function viteConfig(): string {
  return `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
`;
}

function indexHtml(schema: NormalizedSchema): string {
  return `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${schema.appTitle}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function mainTsx(): string {
  return `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function apiClient(): string {
  return `
const API_URL = 'http://localhost:3000/api';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(\`\${API_URL}\${path}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
`;
}

function appTsx(schema: NormalizedSchema): string {
  const imports = schema.tables
    .map((table) => `import { ${table.className}View } from './features/${table.entityName}/${table.entityName}.view';`)
    .join('\n');
  const tableLinks = schema.tables
    .map((table) => `{ label: ${quoteJs(table.className)}, route: ${quoteJs(table.routePath)} }`)
    .join(',\n    ');
  const viewCases = schema.tables
    .map((table) => `{view === ${quoteJs(table.routePath)} && <${table.className}View />}`)
    .join('\n        ');

  return `
import { FormEvent, useState } from 'react';
${imports}

type View = 'login' | 'demo' | ${schema.tables.map((table) => quoteJs(table.routePath)).join(' | ') || 'string'};

const tableLinks = [
  ${tableLinks}
];

export function App() {
  const [view, setView] = useState<View>('login');
  const [login, setLogin] = useState('dieng.tech');
  const [password, setPassword] = useState('dieng123');
  const [error, setError] = useState('');

  function submitLogin(event: FormEvent) {
    event.preventDefault();
    if (login === 'dieng.tech' && password === 'dieng123') {
      setError('');
      setView('demo');
      return;
    }
    setError('Utilise le login dieng.tech et le mot de passe dieng123.');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>SF</span>
          <div>
            <strong>${schema.appTitle}</strong>
            <small>Application React generee en MVC</small>
          </div>
        </div>
        <nav>
          <button className={view === 'demo' ? 'active' : ''} onClick={() => setView('demo')}>Demo</button>
          {tableLinks.map((link) => (
            <button key={link.route} className={view === link.route ? 'active' : ''} onClick={() => setView(link.route as View)}>
              {link.label}
            </button>
          ))}
          <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>Login</button>
        </nav>
      </aside>

      <main className="content">
        {view === 'login' && (
          <form className="login-card" onSubmit={submitLogin}>
            <p>Acces demo</p>
            <h1>${schema.appTitle}</h1>
            <label>Login<input value={login} onChange={(event) => setLogin(event.target.value)} /></label>
            <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <strong className="error">{error}</strong>}
            <button type="submit">Entrer</button>
          </form>
        )}

        {view === 'demo' && (
          <>
            <section className="page-hero">
              <p>Demo</p>
              <h1>Ecrans generes</h1>
              <span>Chaque table possede maintenant son modele, service, controller, vue TSX et fichier CSS.</span>
            </section>
            <section className="screen-grid">
              {tableLinks.map((link) => (
                <button key={link.route} onClick={() => setView(link.route as View)}>
                  <strong>{link.label}</strong>
                  <span>Module MVC React dedie</span>
                </button>
              ))}
            </section>
          </>
        )}

        ${viewCases}
      </main>
    </div>
  );
}
`;
}

function modelFile(table: NormalizedTable): string {
  const props = table.columns.map((column) => `  ${column.propertyName}: ${column.tsType};`).join('\n');
  return `
export interface ${table.className} {
${props}
}

export type ${table.className}FormValue = string | number | boolean | null;
export type ${table.className}Payload = Partial<Record<keyof Omit<${table.className}, ${quoteJs(table.primaryKey.propertyName)}>, ${table.className}FormValue>>;
`;
}

function serviceFile(table: NormalizedTable): string {
  return `
import { apiRequest } from '../../api';
import { ${table.className}, ${table.className}Payload } from './${table.entityName}.model';

const route = '/${table.routePath}';

export const ${table.variableName}Service = {
  list(): Promise<${table.className}[]> {
    return apiRequest<${table.className}[]>(route);
  },

  create(payload: ${table.className}Payload): Promise<${table.className}> {
    return apiRequest<${table.className}>(route, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  update(id: string | number, payload: ${table.className}Payload): Promise<${table.className}> {
    return apiRequest<${table.className}>(\`\${route}/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  remove(id: string | number): Promise<void> {
    return apiRequest<void>(\`\${route}/\${id}\`, { method: 'DELETE' });
  }
};
`;
}

function controllerFile(table: NormalizedTable): string {
  const emptyForm = table.editableColumns
    .map((column) => `    ${column.propertyName}: ${column.tsType === 'boolean' ? 'false' : "''"}`)
    .join(',\n');
  const editableNames = table.editableColumns.map((column) => quoteJs(column.propertyName)).join(', ');

  return `
import { FormEvent, useEffect, useState } from 'react';
import { ${table.className}, ${table.className}Payload } from './${table.entityName}.model';
import { ${table.variableName}Service } from './${table.entityName}.service';

const emptyForm: ${table.className}Payload = {
${emptyForm}
};

const editableFields = [${editableNames}] as const;

export function use${table.className}Controller() {
  const [rows, setRows] = useState<${table.className}[]>([]);
  const [form, setForm] = useState<${table.className}Payload>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    try {
      setRows(await ${table.variableName}Service.list());
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

  function updateField(field: keyof ${table.className}Payload, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(row: ${table.className}): void {
    setEditingId(row.${table.primaryKey.propertyName} as string | number);
    setForm(
      Object.fromEntries(editableFields.map((field) => [field, row[field] ?? ''])) as ${table.className}Payload
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
        await ${table.variableName}Service.update(editingId, form);
      } else {
        await ${table.variableName}Service.create(form);
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
  }

  async function remove(row: ${table.className}): Promise<void> {
    try {
      await ${table.variableName}Service.remove(row.${table.primaryKey.propertyName} as string | number);
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
`;
}

function viewFile(table: NormalizedTable): string {
  return `
import { use${table.className}Controller } from './${table.entityName}.controller';
import './${table.entityName}.view.css';

const columns = ${json(
    table.columns.map((column) => ({
      propertyName: column.propertyName,
      label: column.label
    }))
  )};

const editableColumns = ${json(
    table.editableColumns.map((column) => ({
      propertyName: column.propertyName,
      label: column.label,
      inputType: column.htmlInputType
    }))
  )};

export function ${table.className}View() {
  const controller = use${table.className}Controller();

  return (
    <section className="${table.entityName}-view mvc-view">
      <div className="page-hero">
        <p>CRUD MVC</p>
        <h1>${table.className}</h1>
        <span>Table source: ${table.name}</span>
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
              <tr key={String(row.${table.primaryKey.propertyName} ?? index)}>
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
`;
}

function viewCss(table: NormalizedTable): string {
  return `
.${table.entityName}-view {
  display: grid;
  gap: 18px;
}

.${table.entityName}-view .page-hero {
  border-left: 4px solid #0f766e;
}

.${table.entityName}-view .form-actions {
  display: flex;
  align-items: end;
  gap: 10px;
}

.${table.entityName}-view .secondary {
  background: #e0f2fe;
  color: #075985;
}

.${table.entityName}-view .danger {
  background: #dc2626;
}

.${table.entityName}-view .loading {
  color: #64748b;
  font-weight: 800;
}
`;
}

function styles(): string {
  return `
* { box-sizing: border-box; }
html, body, #root { min-height: 100%; margin: 0; }
body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #eef3f7; color: #111827; }
button, input { font: inherit; }
.app-shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 100vh; }
.sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 22px; padding: 20px; border-right: 1px solid #d9e3ef; background: #fff; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand span { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: #0f766e; color: #fff; font-weight: 900; }
.brand small { display: block; margin-top: 3px; color: #64748b; }
nav { display: grid; gap: 8px; }
nav button { padding: 12px; border: 0; border-radius: 8px; background: transparent; color: #475569; font-weight: 800; text-align: left; cursor: pointer; }
nav button.active, nav button:hover { background: #eef7f6; color: #0f766e; }
.content { min-width: 0; padding: 24px; }
.page-hero, .login-card, .form-grid, .table-wrap, .screen-grid button { border: 1px solid #d9e3ef; border-radius: 8px; background: #fff; box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06); }
.page-hero { margin-bottom: 0; padding: 24px; }
.page-hero p, .login-card p, h1 { margin: 0; }
.page-hero p, .login-card p { color: #0f766e; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
.page-hero span { display: block; margin-top: 8px; color: #64748b; }
.login-card { display: grid; gap: 14px; width: min(430px, 100%); padding: 28px; }
label { display: grid; gap: 7px; color: #334155; font-weight: 800; }
input { min-height: 44px; padding: 0 12px; border: 1px solid #d9e3ef; border-radius: 8px; background: #f8fafc; }
.login-card button, .form-grid button, td button { min-height: 42px; border: 0; border-radius: 8px; background: #0f766e; color: #fff; font-weight: 900; cursor: pointer; }
.error { display: block; color: #dc2626; }
.screen-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 18px; }
.screen-grid button { display: grid; gap: 8px; padding: 18px; color: inherit; text-align: left; cursor: pointer; }
.screen-grid span { color: #64748b; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 18px; }
.form-grid button { align-self: end; padding: 0 14px; }
.table-wrap { overflow: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
th { color: #64748b; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; }
.row-actions { white-space: nowrap; }
td button { min-height: 34px; margin-right: 8px; padding: 0 10px; }
@media (max-width: 780px) { .app-shell, .form-grid { grid-template-columns: 1fr; } .sidebar { position: static; height: auto; } }
`;
}

export async function generateReactFrontend(schema: NormalizedSchema, root: string): Promise<void> {
  const frontendRoot = path.join(root, 'frontend');

  await writeTextFile(path.join(frontendRoot, 'package.json'), packageJson(schema));
  await writeTextFile(path.join(frontendRoot, 'tsconfig.json'), tsConfig());
  await writeTextFile(path.join(frontendRoot, 'vite.config.ts'), viteConfig());
  await writeTextFile(path.join(frontendRoot, 'index.html'), indexHtml(schema));
  await writeTextFile(path.join(frontendRoot, 'src/main.tsx'), mainTsx());
  await writeTextFile(path.join(frontendRoot, 'src/App.tsx'), appTsx(schema));
  await writeTextFile(path.join(frontendRoot, 'src/api.ts'), apiClient());
  await writeTextFile(path.join(frontendRoot, 'src/styles.css'), styles());

  for (const table of schema.tables) {
    const featureRoot = path.join(frontendRoot, `src/features/${table.entityName}`);
    await writeTextFile(path.join(featureRoot, `${table.entityName}.model.ts`), modelFile(table));
    await writeTextFile(path.join(featureRoot, `${table.entityName}.service.ts`), serviceFile(table));
    await writeTextFile(path.join(featureRoot, `${table.entityName}.controller.ts`), controllerFile(table));
    await writeTextFile(path.join(featureRoot, `${table.entityName}.view.tsx`), viewFile(table));
    await writeTextFile(path.join(featureRoot, `${table.entityName}.view.css`), viewCss(table));
  }
}
