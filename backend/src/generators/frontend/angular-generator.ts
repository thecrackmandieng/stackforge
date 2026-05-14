import path from 'path';
import { quoteJs } from '../../core/naming';
import { writeTextFile } from '../../core/file-writer';
import { NormalizedSchema, NormalizedTable } from '../../core/types';

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function packageJson(schema: NormalizedSchema): string {
  return json({
    name: `${schema.packageName}-web`,
    version: '1.0.0',
    private: true,
    scripts: {
      ng: 'ng',
      start: 'ng serve',
      build: 'ng build'
    },
    dependencies: {
      '@angular/common': '^21.0.0',
      '@angular/compiler': '^21.0.0',
      '@angular/core': '^21.0.0',
      '@angular/forms': '^21.0.0',
      '@angular/platform-browser': '^21.0.0',
      '@angular/router': '^21.0.0',
      rxjs: '~7.8.0',
      tslib: '^2.8.1',
      'zone.js': '~0.15.0'
    },
    devDependencies: {
      '@angular/build': '^21.0.0',
      '@angular/cli': '^21.0.0',
      '@angular/compiler-cli': '^21.0.0',
      typescript: '~5.9.0'
    }
  });
}

function angularJson(): string {
  return json({
    $schema: './node_modules/@angular/cli/lib/config/schema.json',
    version: 1,
    projects: {
      app: {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        prefix: 'app',
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              browser: 'src/main.ts',
              tsConfig: 'tsconfig.app.json',
              inlineStyleLanguage: 'scss',
              assets: [{ glob: '**/*', input: 'public' }],
              styles: ['src/styles.scss']
            },
            configurations: {
              production: { outputHashing: 'all' },
              development: { optimization: false, extractLicenses: false, sourceMap: true }
            },
            defaultConfiguration: 'production'
          },
          serve: {
            builder: '@angular/build:dev-server',
            configurations: {
              production: { buildTarget: 'app:build:production' },
              development: { buildTarget: 'app:build:development' }
            },
            defaultConfiguration: 'development'
          }
        }
      }
    }
  });
}

function tsConfig(): string {
  return json({
    compileOnSave: false,
    compilerOptions: {
      strict: true,
      noImplicitOverride: true,
      noPropertyAccessFromIndexSignature: false,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      skipLibCheck: true,
      isolatedModules: true,
      target: 'ES2022',
      module: 'ES2022',
      moduleResolution: 'bundler',
      importHelpers: true,
      lib: ['ES2022', 'dom']
    },
    angularCompilerOptions: {
      strictInjectionParameters: true,
      strictInputAccessModifiers: true,
      strictTemplates: true
    }
  });
}

function tsConfigApp(): string {
  return json({
    extends: './tsconfig.json',
    compilerOptions: { outDir: './out-tsc/app', types: [] },
    files: ['src/main.ts'],
    include: ['src/**/*.d.ts']
  });
}

function mainTs(): string {
  return `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error) => console.error(error));
`;
}

function appConfig(): string {
  return `
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
`;
}

function indexHtml(schema: NormalizedSchema): string {
  return `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>${schema.appTitle}</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`;
}

function environment(): string {
  return `
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
`;
}

function appRoutes(schema: NormalizedSchema): string {
  const imports = schema.tables
    .map((table) => `import { ${table.className}Page } from './pages/${table.entityName}/${table.entityName}.page';`)
    .join('\n');
  const routes = schema.tables
    .map((table) => `{ path: '${table.routePath}', component: ${table.className}Page }`)
    .join(',\n  ');

  return `
import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DemoPage } from './pages/demo/demo.page';
${imports}

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'demo', component: DemoPage },
  ${routes},
  { path: '**', redirectTo: 'login' }
];
`;
}

function appComponent(schema: NormalizedSchema): string {
  return `
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly appTitle = ${quoteJs(schema.appTitle)};
  readonly links = [
    { label: 'Demo', path: '/demo' },
    ${schema.tables.map((table) => `{ label: ${quoteJs(table.className)}, path: '/${table.routePath}' }`).join(',\n    ')},
    { label: 'Login', path: '/login' }
  ];

  constructor() {
    document.title = this.appTitle;
  }
}
`;
}

function appShell(): string {
  return `
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <span>SF</span>
      <div>
        <strong>{{ appTitle }}</strong>
        <small>Application Angular generee</small>
      </div>
    </div>
    <nav aria-label="Navigation">
      @for (link of links; track link.path) {
        <a [routerLink]="link.path" routerLinkActive="active">{{ link.label }}</a>
      }
    </nav>
  </aside>

  <main class="content">
    <router-outlet></router-outlet>
  </main>
</div>
`;
}

function appComponentScss(): string {
  return `
.app-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 100vh;
  background: #eef3f7;
  color: #111827;
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
  height: 100vh;
  padding: 20px;
  border-right: 1px solid #d9e3ef;
  background: #ffffff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #0f766e;
  color: #ffffff;
  font-weight: 900;
}

.brand strong,
.brand small,
nav a {
  display: block;
}

.brand small {
  margin-top: 3px;
  color: #64748b;
}

nav {
  display: grid;
  gap: 8px;
}

nav a {
  padding: 12px;
  border-radius: 8px;
  color: #475569;
  font-weight: 800;
  text-decoration: none;
}

nav a.active,
nav a:hover {
  background: #eef7f6;
  color: #0f766e;
}

.content {
  min-width: 0;
  padding: 24px;
}

@media (max-width: 780px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
  }
}
`;
}

function styles(): string {
  return `
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}
`;
}

function loginPageTs(): string {
  return `
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  login = 'dieng.tech';
  password = 'dieng123';
  otpRecipient = '';
  otpCode = '';
  otpMessage = '';
  otpSending = false;
  error = '';

  constructor(private router: Router) {}

  async requestOtp(): Promise<void> {
    this.error = '';
    this.otpMessage = '';
    this.otpSending = true;

    try {
      const response = await fetch(\`\${environment.apiUrl}/auth/request-otp\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: this.otpRecipient })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Envoi OTP impossible.');
      }

      this.otpMessage = result.message;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Envoi OTP impossible.';
    } finally {
      this.otpSending = false;
    }
  }

  async submit(): Promise<void> {
    const validPassword = this.password === 'dieng123';

    if (this.login === 'dieng.tech' && validPassword) {
      void this.router.navigateByUrl('/demo');
      return;
    }

    if (this.otpRecipient && this.otpCode) {
      try {
        const response = await fetch(\`\${environment.apiUrl}/auth/verify-otp\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: this.otpRecipient, code: this.otpCode })
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.message || 'Code OTP invalide.');
        }

        void this.router.navigateByUrl('/demo');
        return;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Code OTP invalide.';
        return;
      }
    }

    this.error = 'Utilise le mot de passe demo ou un code OTP envoye.';
  }
}
`;
}

function loginPageHtml(schema: NormalizedSchema): string {
  return `
<section class="login-layout">
  <div class="login-card">
    <p>Acces demo</p>
    <h1>${schema.appTitle}</h1>
    <span class="login-hint">Connexion par mot de passe demo ou code OTP envoye par email/SMS.</span>
    <label>
      Login
      <input name="login" [(ngModel)]="login" autocomplete="username">
    </label>
    <label>
      Mot de passe
      <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password">
    </label>
    <div class="otp-separator">
      <span>ou connexion OTP</span>
    </div>
    <label>
      Email ou telephone
      <input name="otpRecipient" [(ngModel)]="otpRecipient" autocomplete="email">
    </label>
    <button type="button" class="secondary" (click)="requestOtp()" [disabled]="otpSending || !otpRecipient">
      {{ otpSending ? 'Envoi...' : 'Envoyer le code OTP' }}
    </button>
    @if (otpMessage) {
      <strong class="success">{{ otpMessage }}</strong>
    }
    <label>
      Code OTP
      <input name="otpCode" inputmode="numeric" maxlength="6" [(ngModel)]="otpCode" autocomplete="one-time-code">
    </label>
    @if (error) {
      <strong class="error">{{ error }}</strong>
    }
    <button type="button" (click)="submit()">Entrer</button>
  </div>
</section>
`;
}

function loginPageScss(): string {
  return `
.login-layout {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 48px);
}

.login-card {
  display: grid;
  gap: 14px;
  width: min(430px, 100%);
  padding: 28px;
  border: 1px solid #d9e3ef;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

p,
h1 {
  margin: 0;
}

.login-hint {
  display: block;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 700;
}

p {
  color: #0f766e;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

label {
  display: grid;
  gap: 7px;
  color: #334155;
  font-weight: 800;
}

input {
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #d9e3ef;
  border-radius: 8px;
  background: #f8fafc;
}

.otp-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.otp-separator::before,
.otp-separator::after {
  flex: 1;
  height: 1px;
  background: #d9e3ef;
  content: "";
}

button {
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  background: #0f766e;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

button.secondary {
  background: #e0f2fe;
  color: #075985;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.error {
  color: #dc2626;
}

.success {
  color: #0f766e;
}
`;
}

function demoPageTs(schema: NormalizedSchema): string {
  return `
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss'
})
export class DemoPage {
  readonly screens = [
    ${schema.tables.map((table) => `{ name: ${quoteJs(table.className)}, route: '/${table.routePath}', description: 'CRUD pour la table ${table.name}' }`).join(',\n    ')}
  ];
}
`;
}

function demoPageHtml(): string {
  return `
<section class="page-hero">
  <p>Demo</p>
  <h1>Ecrans generes</h1>
  <span>Ouvre chaque module pour tester les listes, formulaires et actions CRUD.</span>
</section>

<section class="screen-grid">
  @for (screen of screens; track screen.route) {
    <a [routerLink]="screen.route">
      <strong>{{ screen.name }}</strong>
      <span>{{ screen.description }}</span>
    </a>
  }
</section>
`;
}

function demoPageScss(): string {
  return `
.page-hero {
  margin-bottom: 18px;
  padding: 24px;
  border: 1px solid #d9e3ef;
  border-radius: 8px;
  background: #ffffff;
}

p,
h1 {
  margin: 0;
}

p {
  color: #0f766e;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h1 {
  margin-top: 6px;
}

.page-hero span {
  display: block;
  margin-top: 8px;
  color: #64748b;
}

.screen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.screen-grid a {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid #d9e3ef;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
}

.screen-grid span {
  color: #64748b;
}
`;
}

function modelFile(table: NormalizedTable): string {
  const props = table.columns.map((column) => `  ${column.propertyName}: ${column.tsType};`).join('\n');
  return `
export interface ${table.className} {
${props}
}
`;
}

function apiService(table: NormalizedTable): string {
  return `
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ${table.className} } from './${table.entityName}.model';

@Injectable({ providedIn: 'root' })
export class ${table.className}Service {
  private readonly baseUrl = \`\${environment.apiUrl}/${table.routePath}\`;

  async list(): Promise<${table.className}[]> {
    const response = await fetch(this.baseUrl);
    return this.handle<${table.className}[]>(response);
  }

  async create(payload: Partial<${table.className}>): Promise<${table.className}> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return this.handle<${table.className}>(response);
  }

  async update(id: string | number, payload: Partial<${table.className}>): Promise<${table.className}> {
    const response = await fetch(\`\${this.baseUrl}/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return this.handle<${table.className}>(response);
  }

  async remove(id: string | number): Promise<void> {
    const response = await fetch(\`\${this.baseUrl}/\${id}\`, { method: 'DELETE' });
    await this.handle<void>(response);
  }

  private async handle<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(await response.text());
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}
`;
}

function pageTs(table: NormalizedTable): string {
  const emptyForm = table.editableColumns
    .map((column) => `    ${column.propertyName}: ${column.tsType === 'boolean' ? 'false' : "''"}`)
    .join(',\n');
  const primary = table.primaryKey.propertyName;

  return `
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ${table.className} } from './${table.entityName}.model';
import { ${table.className}Service } from './${table.entityName}.service';

@Component({
  selector: 'app-${table.entityName}',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './${table.entityName}.page.html',
  styleUrl: './${table.entityName}.page.scss'
})
export class ${table.className}Page implements OnInit {
  items: ${table.className}[] = [];
  form: Record<string, string | number | boolean | null> = this.emptyForm();
  editingId: string | number | null = null;
  loading = false;
  error = '';

  constructor(private service: ${table.className}Service) {}

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.items = await this.service.list();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Chargement impossible.';
    } finally {
      this.loading = false;
    }
  }

  edit(item: ${table.className}): void {
    this.editingId = item.${primary} as string | number;
    this.form = { ...item } as Record<string, string | number | boolean | null>;
  }

  cancel(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  async save(): Promise<void> {
    try {
      if (this.editingId === null) {
        await this.service.create(this.form as Partial<${table.className}>);
      } else {
        await this.service.update(this.editingId, this.form as Partial<${table.className}>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible.';
    }
  }

  async remove(item: ${table.className}): Promise<void> {
    await this.service.remove(item.${primary} as string | number);
    await this.load();
  }

  private emptyForm(): Record<string, string | number | boolean | null> {
    return {
${emptyForm}
    };
  }
}
`;
}

function pageHtml(table: NormalizedTable): string {
  const fields = table.editableColumns
    .map(
      (column) => `
      <label>
        ${column.label}
        <input name="${column.propertyName}" type="${column.htmlInputType}" [(ngModel)]="form['${column.propertyName}']">
      </label>`
    )
    .join('\n');
  const heads = table.columns.map((column) => `<th>${column.label}</th>`).join('\n          ');
  const cells = table.columns.map((column) => `<td>{{ item.${column.propertyName} }}</td>`).join('\n          ');

  return `
<section class="page-title">
  <p>Module CRUD</p>
  <h1>${table.className}</h1>
  <span>Gestion de la table ${table.name}</span>
</section>

<section class="editor">
  <div>
    <h2>{{ editingId === null ? 'Nouvel element' : 'Modifier element' }}</h2>
    <p>Renseigne les champs puis enregistre.</p>
  </div>
  <form (ngSubmit)="save()">
${fields}
    <div class="form-actions">
      <button type="submit">{{ editingId === null ? 'Creer' : 'Mettre a jour' }}</button>
      <button type="button" class="ghost" (click)="cancel()">Annuler</button>
    </div>
  </form>
</section>

@if (error) {
  <div class="error">{{ error }}</div>
}

<section class="table-card">
  <div class="table-head">
    <h2>Donnees</h2>
    <button type="button" (click)="load()">Actualiser</button>
  </div>
  @if (loading) {
    <p>Chargement...</p>
  } @else {
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
          ${heads}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items; track item.${table.primaryKey.propertyName}) {
            <tr>
          ${cells}
              <td>
                <button type="button" (click)="edit(item)">Editer</button>
                <button type="button" class="danger" (click)="remove(item)">Supprimer</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</section>
`;
}

function pageScss(): string {
  return `
.page-title,
.editor,
.table-card,
.error {
  border: 1px solid #d9e3ef;
  border-radius: 8px;
  background: #ffffff;
}

.page-title {
  margin-bottom: 16px;
  padding: 22px;
}

.page-title p,
.page-title h1,
.editor h2,
.editor p,
.table-head h2 {
  margin: 0;
}

.page-title p {
  color: #0f766e;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-title h1 {
  margin-top: 6px;
}

.page-title span,
.editor p {
  display: block;
  margin-top: 8px;
  color: #64748b;
}

.editor {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
  padding: 18px;
}

form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
}

label {
  display: grid;
  gap: 7px;
  color: #334155;
  font-weight: 800;
}

input {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #d9e3ef;
  border-radius: 8px;
  background: #f8fafc;
}

.form-actions {
  display: flex;
  align-items: end;
  gap: 8px;
}

button {
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: #0f766e;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

button.ghost {
  background: #e2e8f0;
  color: #334155;
}

button.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.error {
  margin-bottom: 16px;
  padding: 14px;
  color: #b91c1c;
}

.table-card {
  padding: 18px;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.table-scroll {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

th {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
`;
}

export async function generateAngularFrontend(schema: NormalizedSchema, root: string): Promise<void> {
  const frontendRoot = path.join(root, 'frontend');

  await writeTextFile(path.join(frontendRoot, 'package.json'), packageJson(schema));
  await writeTextFile(path.join(frontendRoot, 'angular.json'), angularJson());
  await writeTextFile(path.join(frontendRoot, 'tsconfig.json'), tsConfig());
  await writeTextFile(path.join(frontendRoot, 'tsconfig.app.json'), tsConfigApp());
  await writeTextFile(path.join(frontendRoot, 'src/main.ts'), mainTs());
  await writeTextFile(path.join(frontendRoot, 'src/index.html'), indexHtml(schema));
  await writeTextFile(path.join(frontendRoot, 'src/styles.scss'), styles());
  await writeTextFile(path.join(frontendRoot, 'src/environments/environment.ts'), environment());
  await writeTextFile(path.join(frontendRoot, 'src/app/app.config.ts'), appConfig());
  await writeTextFile(path.join(frontendRoot, 'src/app/app.routes.ts'), appRoutes(schema));
  await writeTextFile(path.join(frontendRoot, 'src/app/app.component.ts'), appComponent(schema));
  await writeTextFile(path.join(frontendRoot, 'src/app/app.component.html'), appShell());
  await writeTextFile(path.join(frontendRoot, 'src/app/app.component.scss'), appComponentScss());
  await writeTextFile(path.join(frontendRoot, 'src/app/pages/login/login.page.ts'), loginPageTs());
  await writeTextFile(path.join(frontendRoot, 'src/app/pages/login/login.page.html'), loginPageHtml(schema));
  await writeTextFile(path.join(frontendRoot, 'src/app/pages/login/login.page.scss'), loginPageScss());
  await writeTextFile(path.join(frontendRoot, 'src/app/pages/demo/demo.page.ts'), demoPageTs(schema));
  await writeTextFile(path.join(frontendRoot, 'src/app/pages/demo/demo.page.html'), demoPageHtml());
  await writeTextFile(path.join(frontendRoot, 'src/app/pages/demo/demo.page.scss'), demoPageScss());

  for (const table of schema.tables) {
    const pageRoot = path.join(frontendRoot, `src/app/pages/${table.entityName}`);
    await writeTextFile(path.join(pageRoot, `${table.entityName}.model.ts`), modelFile(table));
    await writeTextFile(path.join(pageRoot, `${table.entityName}.service.ts`), apiService(table));
    await writeTextFile(path.join(pageRoot, `${table.entityName}.page.ts`), pageTs(table));
    await writeTextFile(path.join(pageRoot, `${table.entityName}.page.html`), pageHtml(table));
    await writeTextFile(path.join(pageRoot, `${table.entityName}.page.scss`), pageScss());
  }
}
