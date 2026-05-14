"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
exports.getZipPath = getZipPath;
exports.listGeneratedProjects = listGeneratedProjects;
exports.readGeneratedProjectManifest = readGeneratedProjectManifest;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const database_reader_1 = require("./database-reader");
const file_writer_1 = require("./file-writer");
const schema_analyzer_1 = require("./schema-analyzer");
const naming_1 = require("./naming");
const express_generator_1 = require("../generators/backend/express-generator");
const angular_generator_1 = require("../generators/frontend/angular-generator");
const ionic_generator_1 = require("../generators/frontend/ionic-generator");
const react_generator_1 = require("../generators/frontend/react-generator");
const react_native_generator_1 = require("../generators/frontend/react-native-generator");
const archiver = require('archiver');
const GENERATED_ROOT = path_1.default.resolve(process.cwd(), 'generated');
const MANIFEST_FILE = 'stackforge.manifest.json';
function frontendLabel(framework) {
    const labels = {
        ionic: 'Angular/Ionic',
        angular: 'Angular Web',
        react: 'React',
        'react-native': 'React Native'
    };
    return labels[framework];
}
function frontendFileExtension(framework) {
    return framework === 'react' || framework === 'react-native' ? 'tsx' : 'ts';
}
function frontendAppPath(framework) {
    if (framework === 'react') {
        return 'frontend/src/App.tsx';
    }
    if (framework === 'react-native') {
        return 'frontend/App.tsx';
    }
    return 'frontend/src/app/app.component.ts';
}
function frontendLoginPath(framework) {
    if (framework === 'react' || framework === 'react-native') {
        return frontendAppPath(framework);
    }
    return 'frontend/src/app/pages/login/login.page.ts';
}
function frontendDemoPath(framework) {
    if (framework === 'react' || framework === 'react-native') {
        return frontendAppPath(framework);
    }
    return 'frontend/src/app/pages/demo/demo.page.ts';
}
function frontendScreenPath(framework, tableEntityName) {
    if (framework === 'react') {
        return `frontend/src/features/${tableEntityName}/${tableEntityName}.view.tsx`;
    }
    if (framework === 'react-native') {
        return 'frontend/src/screens/TableScreen.tsx';
    }
    return `frontend/src/app/pages/${tableEntityName}/${tableEntityName}.page.ts`;
}
function frontendServicePath(framework, tableEntityName) {
    if (framework === 'react') {
        return `frontend/src/features/${tableEntityName}/${tableEntityName}.service.ts`;
    }
    if (framework === 'react-native') {
        return 'frontend/src/api.ts';
    }
    return `frontend/src/app/pages/${tableEntityName}/${tableEntityName}.service.ts`;
}
function buildFrontendComponents(schema, framework) {
    if (framework === 'react') {
        return schema.tables.flatMap((table) => [
            {
                name: `${table.className}Model`,
                type: 'frontend',
                path: `frontend/src/features/${table.entityName}/${table.entityName}.model.ts`,
                role: `Modele TypeScript React pour la table ${table.name}.`
            },
            {
                name: `${table.className}Service`,
                type: 'frontend',
                path: `frontend/src/features/${table.entityName}/${table.entityName}.service.ts`,
                role: `Service API React pour ${table.name}.`
            },
            {
                name: `${table.className}Controller`,
                type: 'frontend',
                path: `frontend/src/features/${table.entityName}/${table.entityName}.controller.ts`,
                role: `Controller React qui pilote le CRUD de ${table.name}.`
            },
            {
                name: `${table.className}View`,
                type: 'frontend',
                path: `frontend/src/features/${table.entityName}/${table.entityName}.view.tsx`,
                role: `Vue TSX React separee pour ${table.name}.`
            },
            {
                name: `${table.className}Styles`,
                type: 'frontend',
                path: `frontend/src/features/${table.entityName}/${table.entityName}.view.css`,
                role: `Styles CSS dedies a la vue ${table.name}.`
            }
        ]);
    }
    return schema.tables.flatMap((table) => [
        {
            name: `${table.className}Page`,
            type: 'frontend',
            path: frontendScreenPath(framework, table.entityName),
            role: `Ecran ${frontendLabel(framework)} de liste, creation, modification et suppression pour ${table.name}.`
        },
        {
            name: `${table.className}Service`,
            type: 'frontend',
            path: frontendServicePath(framework, table.entityName),
            role: `Client API frontend pour ${table.name}.`
        }
    ]);
}
function rootReadme(projectName, manifest, framework) {
    const endpointRows = manifest.endpoints
        .map((endpoint) => `| ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.description} |`)
        .join('\n');
    const screenRows = manifest.screens
        .map((screen) => `| ${screen.name} | \`${screen.route}\` | ${screen.description} |`)
        .join('\n');
    return `
# ${projectName}

Projet genere automatiquement par StackForge Studio.

## Backend

\`\`\`bash
cd backend
cp .env.example .env
npm install
npm run dev
\`\`\`

## Frontend ${frontendLabel(framework)}

\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

Le backend expose les routes CRUD sous \`http://localhost:3000/api\`.

## Demo frontend

- Login: \`${manifest.demo.login}\`
- Mot de passe: \`${manifest.demo.password}\`
- OTP: demande un code par email ou SMS depuis la page de connexion.
- Page de demarrage: \`${manifest.demo.startRoute}\`

## OTP email/SMS

Le backend expose:

- \`POST /api/auth/request-otp\` avec \`{ "recipient": "email@site.com" }\` ou \`{ "recipient": "+221..." }\`
- \`POST /api/auth/verify-otp\` avec \`{ "recipient": "...", "code": "123456" }\`

Configure \`.env\` pour envoyer les codes:

- Email SMTP: \`SMTP_HOST\`, \`SMTP_PORT\`, \`SMTP_USER\`, \`SMTP_PASSWORD\`, \`SMTP_FROM\`
- SMS Twilio: \`TWILIO_ACCOUNT_SID\`, \`TWILIO_AUTH_TOKEN\`, \`TWILIO_FROM\`

Si aucun fournisseur n'est configure, le code OTP est affiche dans les logs backend en mode developpement.

## Ecrans frontend

| Ecran | Route | Description |
| --- | --- | --- |
${screenRows}

## Documentation backend

| Methode | Endpoint | Description |
| --- | --- | --- |
${endpointRows}
`;
}
function buildEndpointDocs(schema) {
    const endpoints = [
        {
            method: 'GET',
            path: '/api/health',
            description: 'Verifier que le backend genere fonctionne.'
        },
        {
            method: 'POST',
            path: '/api/auth/request-otp',
            description: 'Generer et envoyer un code OTP par email ou SMS.'
        },
        {
            method: 'POST',
            path: '/api/auth/verify-otp',
            description: 'Verifier un code OTP envoye a un email ou telephone.'
        }
    ];
    for (const table of schema.tables) {
        endpoints.push({
            method: 'GET',
            path: `/api/${table.routePath}`,
            description: `Lister les donnees de ${table.name}.`
        }, {
            method: 'GET',
            path: `/api/${table.routePath}/:id`,
            description: `Lire un element ${table.name} par identifiant.`
        }, {
            method: 'POST',
            path: `/api/${table.routePath}`,
            description: `Creer un element ${table.name}.`
        }, {
            method: 'PUT',
            path: `/api/${table.routePath}/:id`,
            description: `Modifier un element ${table.name}.`
        }, {
            method: 'DELETE',
            path: `/api/${table.routePath}/:id`,
            description: `Supprimer un element ${table.name}.`
        });
    }
    return endpoints;
}
function buildManifest(schema, framework) {
    const frontendName = frontendLabel(framework);
    const backendComponents = schema.tables.flatMap((table) => [
        {
            name: `${table.className}Controller`,
            type: 'backend',
            path: `backend/src/controllers/${table.entityName}.controller.js`,
            role: `Controle les requetes HTTP pour ${table.name}.`
        },
        {
            name: `${table.className}Service`,
            type: 'backend',
            path: `backend/src/services/${table.entityName}.service.js`,
            role: `Execute les operations CRUD SQL pour ${table.name}.`
        }
    ]);
    const frontendComponents = buildFrontendComponents(schema, framework);
    return {
        projectName: schema.projectName,
        createdAt: new Date().toISOString(),
        demo: {
            login: 'dieng.tech',
            password: 'dieng123',
            otpCode: 'email ou SMS',
            startRoute: '/login'
        },
        components: [
            {
                name: 'LoginPage',
                type: 'frontend',
                path: frontendLoginPath(framework),
                role: `Page de connexion demo ${frontendName} avec mot de passe dieng123 ou OTP email/SMS.`
            },
            {
                name: 'DemoPage',
                type: 'frontend',
                path: frontendDemoPath(framework),
                role: 'Ecran de visualisation de tous les ecrans generes.'
            },
            ...backendComponents,
            ...frontendComponents
        ],
        screens: [
            {
                name: 'Connexion',
                route: '/login',
                path: frontendLoginPath(framework),
                description: 'Connexion demo avec login dieng.tech, mot de passe dieng123 ou OTP envoye par email/SMS.'
            },
            {
                name: 'Demo',
                route: '/demo',
                path: frontendDemoPath(framework),
                description: 'Vue centrale pour ouvrir tous les ecrans generes.'
            },
            ...schema.tables.map((table) => ({
                name: table.className,
                route: `/${table.routePath}`,
                path: frontendScreenPath(framework, table.entityName),
                description: `Ecran CRUD genere pour la table ${table.name}.`
            }))
        ],
        endpoints: buildEndpointDocs(schema)
    };
}
async function zipDirectory(sourceDir, zipPath) {
    await (0, promises_1.mkdir)(path_1.default.dirname(zipPath), { recursive: true });
    await new Promise((resolve, reject) => {
        const output = (0, fs_1.createWriteStream)(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        output.on('close', () => resolve());
        archive.on('error', (error) => reject(error));
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}
async function generateProject(request) {
    if (!request.name || !request.name.trim()) {
        throw new Error('Le nom du projet est obligatoire.');
    }
    const jobId = (0, crypto_1.randomUUID)();
    const projectName = (0, naming_1.sanitizePackageName)(request.name);
    const outputPath = path_1.default.join(GENERATED_ROOT, jobId, projectName);
    const zipPath = path_1.default.join(GENERATED_ROOT, jobId, `${projectName}.zip`);
    const frontendFramework = request.frontend?.framework || 'ionic';
    if (!['ionic', 'angular', 'react', 'react-native'].includes(frontendFramework)) {
        throw new Error('Le type de frontend doit etre ionic, angular, react ou react-native.');
    }
    const rawSchema = await (0, database_reader_1.readDatabaseSchema)(request);
    const schema = (0, schema_analyzer_1.normalizeSchema)(projectName, rawSchema);
    const manifest = buildManifest(schema, frontendFramework);
    await (0, file_writer_1.resetDirectory)(outputPath);
    await (0, express_generator_1.generateExpressBackend)(schema, outputPath);
    if (frontendFramework === 'angular') {
        await (0, angular_generator_1.generateAngularFrontend)(schema, outputPath);
    }
    else if (frontendFramework === 'react') {
        await (0, react_generator_1.generateReactFrontend)(schema, outputPath);
    }
    else if (frontendFramework === 'react-native') {
        await (0, react_native_generator_1.generateReactNativeFrontend)(schema, outputPath);
    }
    else {
        await (0, ionic_generator_1.generateIonicFrontend)(schema, outputPath);
    }
    await (0, file_writer_1.writeTextFile)(path_1.default.join(outputPath, MANIFEST_FILE), JSON.stringify(manifest, null, 2));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(outputPath, 'README.md'), rootReadme(schema.appTitle, manifest, frontendFramework));
    await zipDirectory(outputPath, zipPath);
    return {
        jobId,
        projectName,
        outputPath,
        zipPath,
        downloadUrl: `/download/${jobId}/${projectName}.zip`,
        tables: schema.tables.map((table) => table.name),
        manifest
    };
}
function getZipPath(jobId, fileName) {
    const safeJobId = jobId.replace(/[^a-zA-Z0-9-]/g, '');
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-.]/g, '');
    return path_1.default.join(GENERATED_ROOT, safeJobId, safeFileName);
}
async function listGeneratedProjects() {
    let jobIds;
    try {
        jobIds = await (0, promises_1.readdir)(GENERATED_ROOT);
    }
    catch {
        return [];
    }
    const projects = await Promise.all(jobIds.map(async (jobId) => {
        const jobPath = path_1.default.join(GENERATED_ROOT, jobId);
        const jobStat = await (0, promises_1.stat)(jobPath).catch(() => null);
        if (!jobStat?.isDirectory()) {
            return null;
        }
        const entries = await (0, promises_1.readdir)(jobPath).catch(() => []);
        const zipFile = entries.find((entry) => entry.endsWith('.zip'));
        const projectName = zipFile?.replace(/\.zip$/, '') || entries.find((entry) => entry !== zipFile);
        if (!zipFile || !projectName) {
            return null;
        }
        const outputPath = path_1.default.join(jobPath, projectName);
        const zipPath = path_1.default.join(jobPath, zipFile);
        const zipStat = await (0, promises_1.stat)(zipPath).catch(() => jobStat);
        const manifest = await readGeneratedProjectManifest(jobId).catch(() => undefined);
        const summary = {
            jobId,
            projectName,
            outputPath,
            zipPath,
            downloadUrl: `/download/${jobId}/${zipFile}`,
            createdAt: manifest?.createdAt || zipStat.mtime.toISOString()
        };
        if (manifest) {
            summary.manifest = manifest;
        }
        return summary;
    }));
    return projects
        .filter((project) => Boolean(project))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function readGeneratedProjectManifest(jobId) {
    const safeJobId = jobId.replace(/[^a-zA-Z0-9-]/g, '');
    const jobPath = path_1.default.join(GENERATED_ROOT, safeJobId);
    const entries = await (0, promises_1.readdir)(jobPath);
    const zipFile = entries.find((entry) => entry.endsWith('.zip'));
    const projectName = zipFile?.replace(/\.zip$/, '') || entries.find((entry) => entry !== zipFile);
    if (!projectName) {
        throw new Error('Projet genere introuvable.');
    }
    const manifestPath = path_1.default.join(jobPath, projectName, MANIFEST_FILE);
    const content = await (0, promises_1.readFile)(manifestPath, 'utf8');
    return JSON.parse(content);
}
//# sourceMappingURL=generator.js.map