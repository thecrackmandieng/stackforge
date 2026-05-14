"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExpressBackend = generateExpressBackend;
const path_1 = __importDefault(require("path"));
const naming_1 = require("../../core/naming");
const file_writer_1 = require("../../core/file-writer");
function json(value) {
    return JSON.stringify(value, null, 2);
}
function envExample(schema) {
    const port = schema.provider === 'mysql' ? 3306 : 5432;
    return `
PORT=3000
DB_PROVIDER=${schema.provider}
DB_HOST=localhost
DB_PORT=${port}
DB_USER=root
DB_PASSWORD=
DB_DATABASE=${schema.database}

# OTP email via SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=no-reply@stackforge.local

# OTP SMS via Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
`;
}
function packageJson(schema) {
    const dbDependency = schema.provider === 'mysql' ? { mysql2: '^3.12.0' } : { pg: '^8.13.1' };
    return json({
        name: `${schema.packageName}-backend`,
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
            dev: 'node --watch src/server.js',
            start: 'node src/server.js'
        },
        dependencies: {
            cors: '^2.8.5',
            dotenv: '^16.4.7',
            express: '^4.21.2',
            nodemailer: '^6.9.16',
            ...dbDependency
        }
    });
}
function dbFile(schema) {
    if (schema.provider === 'mysql') {
        return `
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
`;
    }
    return `
import pg from 'pg';

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}
`;
}
function serviceFile(schema, table) {
    const tableName = (0, naming_1.quoteJs)(table.name);
    const columns = table.columns.map((column) => column.name);
    const editableColumns = table.editableColumns.map((column) => column.name);
    const primaryKey = table.primaryKey.name;
    if (schema.provider === 'mysql') {
        return `
import { query } from '../db.js';

const tableName = ${tableName};
const columns = ${json(columns)};
const editableColumns = ${json(editableColumns)};
const primaryKey = ${(0, naming_1.quoteJs)(primaryKey)};

function pickPayload(payload) {
  const data = {};
  for (const column of editableColumns) {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      data[column] = payload[column];
    }
  }
  return data;
}

export async function findAll() {
  return query(\`SELECT \${columns.map((column) => \`\\\`\${column}\\\`\`).join(', ')} FROM \\\`\${tableName}\\\` ORDER BY \\\`\${primaryKey}\\\` DESC\`);
}

export async function findById(id) {
  const rows = await query(\`SELECT \${columns.map((column) => \`\\\`\${column}\\\`\`).join(', ')} FROM \\\`\${tableName}\\\` WHERE \\\`\${primaryKey}\\\` = ? LIMIT 1\`, [id]);
  return rows[0] || null;
}

export async function create(payload) {
  const data = pickPayload(payload);
  const keys = Object.keys(data);
  if (!keys.length) {
    throw new Error('Aucune donnee a enregistrer.');
  }
  const placeholders = keys.map(() => '?').join(', ');
  const sql = \`INSERT INTO \\\`\${tableName}\\\` (\${keys.map((key) => \`\\\`\${key}\\\`\`).join(', ')}) VALUES (\${placeholders})\`;
  const result = await query(sql, keys.map((key) => data[key]));
  return findById(result.insertId);
}

export async function update(id, payload) {
  const data = pickPayload(payload);
  const keys = Object.keys(data);
  if (!keys.length) {
    return findById(id);
  }
  const assignments = keys.map((key) => \`\\\`\${key}\\\` = ?\`).join(', ');
  await query(\`UPDATE \\\`\${tableName}\\\` SET \${assignments} WHERE \\\`\${primaryKey}\\\` = ?\`, [...keys.map((key) => data[key]), id]);
  return findById(id);
}

export async function remove(id) {
  await query(\`DELETE FROM \\\`\${tableName}\\\` WHERE \\\`\${primaryKey}\\\` = ?\`, [id]);
  return { deleted: true };
}
`;
    }
    return `
import { query } from '../db.js';

const tableName = ${tableName};
const columns = ${json(columns)};
const editableColumns = ${json(editableColumns)};
const primaryKey = ${(0, naming_1.quoteJs)(primaryKey)};

function q(identifier) {
  return '"' + identifier.replaceAll('"', '""') + '"';
}

function pickPayload(payload) {
  const data = {};
  for (const column of editableColumns) {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      data[column] = payload[column];
    }
  }
  return data;
}

export async function findAll() {
  return query(\`SELECT \${columns.map(q).join(', ')} FROM \${q(tableName)} ORDER BY \${q(primaryKey)} DESC\`);
}

export async function findById(id) {
  const rows = await query(\`SELECT \${columns.map(q).join(', ')} FROM \${q(tableName)} WHERE \${q(primaryKey)} = $1 LIMIT 1\`, [id]);
  return rows[0] || null;
}

export async function create(payload) {
  const data = pickPayload(payload);
  const keys = Object.keys(data);
  if (!keys.length) {
    throw new Error('Aucune donnee a enregistrer.');
  }
  const placeholders = keys.map((_, index) => \`$\${index + 1}\`).join(', ');
  const sql = \`INSERT INTO \${q(tableName)} (\${keys.map(q).join(', ')}) VALUES (\${placeholders}) RETURNING \${columns.map(q).join(', ')}\`;
  const rows = await query(sql, keys.map((key) => data[key]));
  return rows[0];
}

export async function update(id, payload) {
  const data = pickPayload(payload);
  const keys = Object.keys(data);
  if (!keys.length) {
    return findById(id);
  }
  const assignments = keys.map((key, index) => \`\${q(key)} = $\${index + 1}\`).join(', ');
  const sql = \`UPDATE \${q(tableName)} SET \${assignments} WHERE \${q(primaryKey)} = $\${keys.length + 1} RETURNING \${columns.map(q).join(', ')}\`;
  const rows = await query(sql, [...keys.map((key) => data[key]), id]);
  return rows[0] || null;
}

export async function remove(id) {
  await query(\`DELETE FROM \${q(tableName)} WHERE \${q(primaryKey)} = $1\`, [id]);
  return { deleted: true };
}
`;
}
function controllerFile(table) {
    const variableName = table.variableName;
    return `
import * as service from '../services/${table.entityName}.service.js';

export async function list(req, res, next) {
  try {
    res.json(await service.findAll());
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const item = await service.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: '${variableName} introuvable.' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await service.create(req.body));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const item = await service.update(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ message: '${variableName} introuvable.' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    res.json(await service.remove(req.params.id));
  } catch (error) {
    next(error);
  }
}
`;
}
function routeFile(table) {
    return `
import { Router } from 'express';
import * as controller from '../controllers/${table.entityName}.controller.js';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
`;
}
function serverFile(schema) {
    const imports = schema.tables
        .map((table) => `import ${(0, naming_1.toCamelCase)(table.name)}Routes from './routes/${table.entityName}.routes.js';`)
        .join('\n');
    const routeUses = schema.tables
        .map((table) => `app.use('/api/${table.routePath}', ${(0, naming_1.toCamelCase)(table.name)}Routes);`)
        .join('\n');
    return `
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
${imports}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: true, service: '${schema.appTitle} API' });
});

app.use('/api/auth', authRoutes);
${routeUses}

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || 'Erreur serveur'
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(\`${schema.appTitle} backend running on http://localhost:\${port}\`);
});
`;
}
function authServiceFile() {
    return `
import nodemailer from 'nodemailer';

const otps = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeRecipient(recipient) {
  return String(recipient || '').trim().toLowerCase();
}

function detectChannel(recipient) {
  return recipient.includes('@') ? 'email' : 'sms';
}

function storeCode(recipient, code) {
  otps.set(recipient, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS
  });
}

async function sendEmail(recipient, code) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: 'Votre code OTP',
    text: \`Votre code OTP est \${code}. Il expire dans 5 minutes.\`
  });

  return true;
}

async function sendSms(recipient, code) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    return false;
  }

  const body = new URLSearchParams({
    To: recipient,
    From: from,
    Body: \`Votre code OTP est \${code}. Il expire dans 5 minutes.\`
  });

  const response = await fetch(\`https://api.twilio.com/2010-04-01/Accounts/\${sid}/Messages.json\`, {
    method: 'POST',
    headers: {
      Authorization: \`Basic \${Buffer.from(\`\${sid}:\${token}\`).toString('base64')}\`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    throw new Error('Envoi SMS impossible.');
  }

  return true;
}

export async function requestOtp(rawRecipient) {
  const recipient = normalizeRecipient(rawRecipient);

  if (!recipient) {
    throw new Error('Email ou telephone obligatoire.');
  }

  const code = generateCode();
  const channel = detectChannel(recipient);
  storeCode(recipient, code);

  const sent = channel === 'email' ? await sendEmail(recipient, code) : await sendSms(recipient, code);

  if (!sent) {
    console.log(\`[DEV OTP] \${recipient}: \${code}\`);
  }

  return {
    sent,
    channel,
    message: sent
      ? \`Code OTP envoye par \${channel === 'email' ? 'email' : 'SMS'}.\`
      : 'Mode developpement: fournisseur OTP non configure, code affiche dans les logs backend.'
  };
}

export function verifyOtp(rawRecipient, code) {
  const recipient = normalizeRecipient(rawRecipient);
  const entry = otps.get(recipient);

  if (!entry || Date.now() > entry.expiresAt) {
    otps.delete(recipient);
    return false;
  }

  const valid = entry.code === String(code || '').trim();
  if (valid) {
    otps.delete(recipient);
  }

  return valid;
}
`;
}
function authControllerFile() {
    return `
import * as service from '../services/auth.service.js';

export async function requestOtp(req, res, next) {
  try {
    res.json(await service.requestOtp(req.body.recipient));
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const valid = service.verifyOtp(req.body.recipient, req.body.code);
    if (!valid) {
      return res.status(401).json({ message: 'Code OTP invalide ou expire.' });
    }

    res.json({ status: true, message: 'Connexion OTP validee.' });
  } catch (error) {
    next(error);
  }
}
`;
}
function authRouteFile() {
    return `
import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';

const router = Router();

router.post('/request-otp', controller.requestOtp);
router.post('/verify-otp', controller.verifyOtp);

export default router;
`;
}
async function generateExpressBackend(schema, root) {
    const backendRoot = path_1.default.join(root, 'backend');
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, 'package.json'), packageJson(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, '.env.example'), envExample(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, 'src/db.js'), dbFile(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, 'src/server.js'), serverFile(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, 'src/services/auth.service.js'), authServiceFile());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, 'src/controllers/auth.controller.js'), authControllerFile());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, 'src/routes/auth.routes.js'), authRouteFile());
    for (const table of schema.tables) {
        await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, `src/services/${table.entityName}.service.js`), serviceFile(schema, table));
        await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, `src/controllers/${table.entityName}.controller.js`), controllerFile(table));
        await (0, file_writer_1.writeTextFile)(path_1.default.join(backendRoot, `src/routes/${table.entityName}.routes.js`), routeFile(table));
    }
}
//# sourceMappingURL=express-generator.js.map