"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIonicFrontend = generateIonicFrontend;
const path_1 = __importDefault(require("path"));
const naming_1 = require("../../core/naming");
const file_writer_1 = require("../../core/file-writer");
function json(value) {
    return JSON.stringify(value, null, 2);
}
function packageJson(schema) {
    return json({
        name: `${schema.packageName}-frontend`,
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
            '@ionic/angular': '^8.5.0',
            ionicons: '^7.4.0',
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
function angularJson(schema) {
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
function tsConfig() {
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
function tsConfigApp() {
    return json({
        extends: './tsconfig.json',
        compilerOptions: { outDir: './out-tsc/app', types: [] },
        files: ['src/main.ts'],
        include: ['src/**/*.d.ts']
    });
}
function appRoutes(schema) {
    const imports = schema.tables
        .map((table) => `import { ${table.className}Page } from './pages/${table.entityName}/${table.entityName}.page';`)
        .join('\n');
    const routes = schema.tables
        .map((table) => `{ path: '${table.routePath}', component: ${table.className}Page }`)
        .join(',\n  ');
    const defaultPath = schema.tables[0]?.routePath || '';
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
function appShell(schema) {
    const links = schema.tables
        .map((table) => `<a routerLink="/${table.routePath}" routerLinkActive="active">
        <ion-icon name="albums-outline" aria-hidden="true"></ion-icon>
        <span>${table.className}</span>
      </a>`)
        .join('\n      ');
    return `
<ion-app>
  <div class="app-shell">
    <nav class="app-nav" aria-label="Navigation principale">
      <div class="brand">
        <strong>${schema.appTitle}</strong>
        <span>Application generee</span>
      </div>
      <a routerLink="/demo" routerLinkActive="active">
        <ion-icon name="apps-outline" aria-hidden="true"></ion-icon>
        <span>Demo</span>
      </a>
      ${links}
      <a routerLink="/login" routerLinkActive="active">
        <ion-icon name="log-in-outline" aria-hidden="true"></ion-icon>
        <span>Login</span>
      </a>
    </nav>
    <main class="app-main">
      <ion-router-outlet></ion-router-outlet>
    </main>
  </div>
</ion-app>
`;
}
function appComponent(schema) {
    return `
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albumsOutline, appsOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonApp, IonRouterOutlet, IonIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor() {
    addIcons({ albumsOutline, appsOutline, logInOutline });
    document.title = ${(0, naming_1.quoteJs)(schema.appTitle)};
  }
}
`;
}
function appComponentScss() {
    return `
.app-shell {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-height: 100%;
  background: #eef4f8;
}

.app-nav {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100vh;
  padding: 18px;
  border-right: 1px solid #d7dfeb;
  background: #fff;
}

.brand {
  display: grid;
  gap: 4px;
  padding: 10px 8px 18px;
  margin-bottom: 8px;
  border-bottom: 1px solid #d7dfeb;
}

.brand strong {
  color: #142033;
}

.brand span {
  color: #64748b;
  font-size: 0.82rem;
}

.app-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #334155;
  font-weight: 800;
  text-decoration: none;
}

.app-nav a:hover,
.app-nav a.active {
  border-color: #99d8d2;
  background: #eef7f6;
  color: #0f766e;
}

.app-nav a:focus-visible {
  outline: 3px solid rgba(15, 118, 110, 0.25);
  outline-offset: 3px;
}

.app-main {
  min-width: 0;
}

@media (max-width: 820px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .app-nav {
    position: static;
    flex-direction: row;
    height: auto;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid #d7dfeb;
  }

  .brand {
    min-width: 180px;
    margin: 0 8px 0 0;
    padding-bottom: 10px;
    border-bottom: 0;
    border-right: 1px solid #d7dfeb;
  }

  .app-nav a {
    flex: 0 0 auto;
  }
}
`;
}
function mainTs() {
    return `
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes)
  ]
}).catch((error) => console.error(error));
`;
}
function indexHtml(schema) {
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
function styles() {
    return `
@use '@ionic/angular/css/core.css';
@use '@ionic/angular/css/normalize.css';
@use '@ionic/angular/css/structure.css';
@use '@ionic/angular/css/typography.css';
@use '@ionic/angular/css/display.css';
@use '@ionic/angular/css/padding.css';
@use '@ionic/angular/css/flex-utils.css';

html,
body {
  height: 100%;
}
`;
}
function environment() {
    return `
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
`;
}
function apiService(table) {
    return `
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ${table.className} } from './${table.entityName}.model';

@Injectable({ providedIn: 'root' })
export class ${table.className}Service {
  private readonly baseUrl = \`\${environment.apiUrl}/${table.routePath}\`;

  async list(): Promise<${table.className}[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Impossible de charger la liste.');
    return response.json();
  }

  async create(payload: Partial<${table.className}>): Promise<${table.className}> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Creation impossible.');
    return response.json();
  }

  async update(id: ${table.primaryKey.tsType}, payload: Partial<${table.className}>): Promise<${table.className}> {
    const response = await fetch(\`\${this.baseUrl}/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Modification impossible.');
    return response.json();
  }

  async delete(id: ${table.primaryKey.tsType}): Promise<void> {
    const response = await fetch(\`\${this.baseUrl}/\${id}\`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Suppression impossible.');
  }
}
`;
}
function modelFile(table) {
    const fields = table.columns
        .map((column) => `  ${column.propertyName}: ${column.tsType}${column.nullable ? ' | null' : ''};`)
        .join('\n');
    return `
export interface ${table.className} {
${fields}
}
`;
}
function emptyValue(column) {
    if (column.tsType === 'number')
        return 'null';
    if (column.tsType === 'boolean')
        return 'false';
    return "''";
}
function pageTs(table) {
    const formFields = table.editableColumns
        .map((column) => `    ${column.name}: ${emptyValue(column)}`)
        .join(',\n');
    return `
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { ${table.className} } from './${table.entityName}.model';
import { ${table.className}Service } from './${table.entityName}.service';

type FormState = Record<string, string | number | boolean | null>;

@Component({
  selector: 'app-${table.entityName}',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ],
  templateUrl: './${table.entityName}.page.html',
  styleUrl: './${table.entityName}.page.scss'
})
export class ${table.className}Page implements OnInit {
  items: ${table.className}[] = [];
  selected: ${table.className} | null = null;
  loading = false;
  error = '';
  form: FormState = this.createEmptyForm();

  constructor(private service: ${table.className}Service) {}

  ngOnInit(): void {
    void this.load();
  }

  createEmptyForm(): FormState {
    return {
${formFields}
    };
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.items = await this.service.list();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erreur inconnue';
    } finally {
      this.loading = false;
    }
  }

  edit(item: ${table.className}): void {
    this.selected = item;
    this.form = {
${table.editableColumns.map((column) => `      ${column.name}: item.${column.propertyName}`).join(',\n')}
    };
  }

  cancel(): void {
    this.selected = null;
    this.form = this.createEmptyForm();
  }

  async save(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      if (this.selected) {
        await this.service.update(this.selected.${table.primaryKey.propertyName}, this.form as Partial<${table.className}>);
      } else {
        await this.service.create(this.form as Partial<${table.className}>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible';
    } finally {
      this.loading = false;
    }
  }

  async delete(item: ${table.className}): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      await this.service.delete(item.${table.primaryKey.propertyName});
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Suppression impossible';
    } finally {
      this.loading = false;
    }
  }
}
`;
}
function pageHtml(table) {
    const inputs = table.editableColumns
        .map((column) => `<div class="field">
        <label for="${column.name}">${column.label}</label>
        <ion-input id="${column.name}" type="${column.htmlInputType}" name="${column.name}" [(ngModel)]="form['${column.name}']"></ion-input>
      </div>`)
        .join('\n      ');
    const rows = table.columns
        .slice(0, 4)
        .map((column) => `<div>
            <span>${column.label}</span>
            <strong>{{ item.${column.propertyName} }}</strong>
          </div>`)
        .join('\n        ');
    return `
<ion-header>
  <ion-toolbar>
    <ion-title>${table.className}</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <main class="page-shell">
    <section class="page-hero">
      <div>
        <p>${table.name}</p>
        <h1>${table.className}</h1>
      </div>
      <button type="button" (click)="cancel()">Nouveau</button>
    </section>

    @if (error) {
      <div class="alert">{{ error }}</div>
    }

    <section class="content-grid">
      <form (ngSubmit)="save()" class="panel editor">
        <div class="panel-title">
          <div>
            <span>{{ selected ? 'Modification' : 'Creation' }}</span>
            <h2>{{ selected ? 'Mettre a jour' : 'Nouvel element' }}</h2>
          </div>
        </div>

        <div class="field-grid">
          ${inputs}
        </div>

        <div class="actions">
          <ion-button type="submit" fill="solid" [disabled]="loading">{{ selected ? 'Enregistrer' : 'Ajouter' }}</ion-button>
          <ion-button type="button" fill="clear" (click)="cancel()">Reinitialiser</ion-button>
        </div>
      </form>

      <section class="panel list-panel">
        <div class="panel-title">
          <div>
            <span>{{ items.length }} element(s)</span>
            <h2>Donnees</h2>
          </div>
          <ion-button fill="clear" size="small" (click)="load()">Rafraichir</ion-button>
        </div>

        @if (!items.length && !loading) {
          <div class="empty">Aucune donnee pour le moment.</div>
        }

        <ion-list>
          @for (item of items; track item.${table.primaryKey.propertyName}) {
            <ion-item class="data-card">
              <ion-label>
                <div class="record-grid">
                  ${rows}
                </div>
              </ion-label>
              <div class="row-actions" slot="end">
                <ion-button fill="outline" size="small" (click)="edit(item)">Editer</ion-button>
                <ion-button color="danger" fill="clear" size="small" (click)="delete(item)">Supprimer</ion-button>
              </div>
            </ion-item>
          }
        </ion-list>
      </section>
    </section>
  </main>
</ion-content>
`;
}
function pageScss() {
    return `
.page-shell {
  min-height: 100%;
  padding: 24px;
  background: #f4f7fb;
  color: #142033;
}

.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 auto 18px;
  max-width: 1180px;
}

.page-hero p,
.panel-title span {
  margin: 0 0 6px;
  color: #0f766e;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-hero h1,
.panel-title h2 {
  margin: 0;
}

.page-hero h1 {
  font-size: 2rem;
}

.page-hero button {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #c7d2e1;
  border-radius: 8px;
  background: #fff;
  color: #142033;
  font-weight: 800;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
}

.panel {
  border: 1px solid #d7dfeb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.editor,
.list-panel {
  padding: 18px;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.field-grid {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 7px;
}

.field label {
  color: #334155;
  font-size: 0.84rem;
  font-weight: 750;
}

.field ion-input {
  --background: #f8fafc;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  border: 1px solid #d7dfeb;
  border-radius: 8px;
}

.actions {
  margin-top: 18px;
}

.alert,
.empty {
  max-width: 1180px;
  margin: 0 auto 16px;
  padding: 14px;
  border-radius: 8px;
}

.alert {
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.empty {
  border: 1px dashed #b6c4d6;
  background: #f8fafc;
  color: #64748b;
}

ion-list {
  background: transparent;
}

.data-card {
  --background: #fff;
  --border-color: #e2e8f0;
  --padding-start: 12px;
  --inner-padding-end: 12px;
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 0;
}

.record-grid span,
.record-grid strong {
  display: block;
}

.record-grid span {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.record-grid strong {
  margin-top: 3px;
  overflow-wrap: anywhere;
}

.row-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .page-shell {
    padding: 14px;
  }

  .page-hero {
    display: grid;
  }

  .record-grid {
    grid-template-columns: 1fr;
  }

  .row-actions {
    display: grid;
  }
}
`;
}
function loginPageTs() {
    return `
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonLabel, IonInput, IonButton, IonText],
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
      localStorage.setItem('stackforge_demo_user', this.login);
      await this.router.navigateByUrl('/demo');
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

        localStorage.setItem('stackforge_demo_user', this.otpRecipient);
        await this.router.navigateByUrl('/demo');
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
function loginPageHtml(schema) {
    return `
<ion-content class="login-screen">
  <main class="login-shell">
    <section class="brand-panel">
      <p>Demo ${schema.appTitle}</p>
      <h1>Visualise ton application generee</h1>
      <span>Mot de passe demo ou OTP envoye par email/SMS</span>
    </section>

    <form class="login-card" (ngSubmit)="submit()">
      <p>Acces demo</p>
      <h2>Connexion</h2>
      <span class="login-hint">Mot de passe demo: dieng123. Pour OTP, indique un email ou telephone.</span>

      <ion-item>
        <ion-label position="stacked">Login</ion-label>
        <ion-input name="login" [(ngModel)]="login"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Mot de passe</ion-label>
        <ion-input type="password" name="password" [(ngModel)]="password"></ion-input>
      </ion-item>

      <div class="otp-separator">
        <span>ou connexion OTP</span>
      </div>

      <ion-item>
        <ion-label position="stacked">Email ou telephone</ion-label>
        <ion-input name="otpRecipient" [(ngModel)]="otpRecipient"></ion-input>
      </ion-item>

      <ion-button type="button" expand="block" fill="outline" (click)="requestOtp()" [disabled]="otpSending || !otpRecipient">
        {{ otpSending ? 'Envoi...' : 'Envoyer le code OTP' }}
      </ion-button>

      @if (otpMessage) {
        <ion-text color="success">{{ otpMessage }}</ion-text>
      }

      <ion-item>
        <ion-label position="stacked">Code OTP</ion-label>
        <ion-input name="otpCode" inputmode="numeric" maxlength="6" [(ngModel)]="otpCode"></ion-input>
      </ion-item>

      @if (error) {
        <ion-text color="danger">{{ error }}</ion-text>
      }

      <ion-button type="submit" expand="block">Entrer</ion-button>
    </form>
  </main>
</ion-content>
`;
}
function loginPageScss() {
    return `
.login-screen {
  --background: #f4f7fb;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 22px;
  width: min(1040px, calc(100% - 32px));
  margin: 64px auto;
}

.brand-panel,
.login-card {
  padding: 28px;
  border: 1px solid #d7dfeb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.brand-panel {
  display: grid;
  align-content: center;
  min-height: 420px;
}

.brand-panel p,
.login-card p {
  margin: 0 0 8px;
  color: #0f766e;
  font-weight: 800;
}

.brand-panel h1 {
  max-width: 520px;
  margin: 0 0 16px;
  font-size: 2.4rem;
  line-height: 1.05;
}

.brand-panel span {
  color: #64748b;
  font-weight: 700;
}

.login-card h2 {
  margin: 0 0 8px;
}

.login-hint {
  display: block;
  margin-bottom: 18px;
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 700;
}

.login-card ion-item {
  --background: #f8fafc;
  --border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #d7dfeb;
  border-radius: 8px;
}

.otp-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 12px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.otp-separator::before,
.otp-separator::after {
  flex: 1;
  height: 1px;
  background: #d7dfeb;
  content: "";
}

ion-button {
  margin-top: 20px;
}

ion-button[fill="outline"] {
  margin-top: 4px;
  margin-bottom: 12px;
}

@media (max-width: 860px) {
  .login-shell {
    grid-template-columns: 1fr;
    margin-top: 24px;
  }

  .brand-panel {
    min-height: auto;
  }
}
`;
}
function demoPageTs(schema) {
    const screens = schema.tables.map((table) => ({
        name: table.className,
        route: `/${table.routePath}`,
        description: `CRUD complet pour la table ${table.name}`
    }));
    return `
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton],
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss'
})
export class DemoPage {
  readonly screens = ${json(screens)};
}
`;
}
function demoPageHtml() {
    return `
<ion-header>
  <ion-toolbar>
    <ion-title>Demo des ecrans</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <section class="intro">
    <h1>Tous les ecrans generes</h1>
    <p>Ouvre chaque ecran pour tester les listes, formulaires et actions CRUD.</p>
  </section>

  <ion-list class="screen-grid">
    @for (screen of screens; track screen.route) {
      <ion-item class="screen-card">
        <ion-label>
          <h2>{{ screen.name }}</h2>
          <p>{{ screen.description }}</p>
        </ion-label>
        <ion-button [routerLink]="screen.route">Ouvrir</ion-button>
      </ion-item>
    }
  </ion-list>
</ion-content>
`;
}
function demoPageScss() {
    return `
.intro,
.screen-grid {
  max-width: 1060px;
  margin-inline: auto;
}

.intro {
  margin-bottom: 20px;
}

.intro h1 {
  margin-bottom: 6px;
}

.screen-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  background: transparent;
}

.screen-card {
  --background: #fff;
  --border-color: #d7dfeb;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  border: 1px solid #d7dfeb;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.screen-card h2 {
  margin-bottom: 4px;
}

.screen-card p {
  color: #64748b;
}

@media (max-width: 720px) {
  .screen-grid {
    grid-template-columns: 1fr;
  }
}
`;
}
async function generateIonicFrontend(schema, root) {
    const frontendRoot = path_1.default.join(root, 'frontend');
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'package.json'), packageJson(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'angular.json'), angularJson(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'tsconfig.json'), tsConfig());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'tsconfig.app.json'), tsConfigApp());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/main.ts'), mainTs());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/index.html'), indexHtml(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/styles.scss'), styles());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/environments/environment.ts'), environment());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/app.routes.ts'), appRoutes(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/app.component.ts'), appComponent(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/app.component.html'), appShell(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/app.component.scss'), appComponentScss());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/pages/login/login.page.ts'), loginPageTs());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/pages/login/login.page.html'), loginPageHtml(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/pages/login/login.page.scss'), loginPageScss());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/pages/demo/demo.page.ts'), demoPageTs(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/pages/demo/demo.page.html'), demoPageHtml());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/app/pages/demo/demo.page.scss'), demoPageScss());
    for (const table of schema.tables) {
        const pageRoot = path_1.default.join(frontendRoot, `src/app/pages/${table.entityName}`);
        await (0, file_writer_1.writeTextFile)(path_1.default.join(pageRoot, `${table.entityName}.model.ts`), modelFile(table));
        await (0, file_writer_1.writeTextFile)(path_1.default.join(pageRoot, `${table.entityName}.service.ts`), apiService(table));
        await (0, file_writer_1.writeTextFile)(path_1.default.join(pageRoot, `${table.entityName}.page.ts`), pageTs(table));
        await (0, file_writer_1.writeTextFile)(path_1.default.join(pageRoot, `${table.entityName}.page.html`), pageHtml(table));
        await (0, file_writer_1.writeTextFile)(path_1.default.join(pageRoot, `${table.entityName}.page.scss`), pageScss());
    }
}
//# sourceMappingURL=ionic-generator.js.map