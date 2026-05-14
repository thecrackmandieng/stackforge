"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDatabaseSchema = readDatabaseSchema;
const promise_1 = __importDefault(require("mysql2/promise"));
const { Client } = require('pg');
const CONNECTION_TIMEOUT_MS = 10000;
function requireConnectionField(config, field) {
    if (!config[field]) {
        throw new Error(`Le champ database.${field} est obligatoire.`);
    }
}
function validateConnectionConfig(config) {
    requireConnectionField(config, 'provider');
    requireConnectionField(config, 'host');
    requireConnectionField(config, 'user');
    requireConnectionField(config, 'database');
}
function normalizeHost(host) {
    return host.trim().toLowerCase() === 'localhost' ? '127.0.0.1' : host.trim();
}
function normalizeDatabaseError(error, provider) {
    const err = error;
    const code = err.code || '';
    const message = err.message || '';
    if (code === 'ECONNREFUSED') {
        return new Error(`Connexion refusee par ${provider}. Verifie le host et le port.`);
    }
    if (code === 'ETIMEDOUT' || code === 'PROTOCOL_SEQUENCE_TIMEOUT' || message.toLowerCase().includes('timeout')) {
        return new Error(`Connexion ${provider} trop longue. Verifie que la base est demarree et accessible.`);
    }
    if (code === 'ENOTFOUND') {
        return new Error(`Host introuvable pour ${provider}. Verifie l'adresse du serveur.`);
    }
    if (message.toLowerCase().includes('ssl') || message.toLowerCase().includes('tls')) {
        return new Error(`${provider} exige SSL/TLS. Active l'option SSL/TLS dans la connexion DB.`);
    }
    if (code === 'ER_ACCESS_DENIED_ERROR' || code === '28P01') {
        return new Error(`Identifiants ${provider} invalides. Verifie l'utilisateur et le mot de passe.`);
    }
    if (code === 'ER_BAD_DB_ERROR' || code === '3D000') {
        return new Error(`Base de donnees introuvable sur ${provider}.`);
    }
    return error instanceof Error ? error : new Error(`Connexion ${provider} impossible.`);
}
function mapMysqlColumn(row) {
    return {
        name: row.COLUMN_NAME,
        type: row.DATA_TYPE,
        nullable: row.IS_NULLABLE === 'YES',
        primaryKey: row.COLUMN_KEY === 'PRI',
        autoIncrement: String(row.EXTRA || '').includes('auto_increment')
    };
}
function mapPostgresColumn(row) {
    return {
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: Boolean(row.is_primary),
        autoIncrement: String(row.column_default || '').includes('nextval')
    };
}
async function readMysqlSchema(config) {
    validateConnectionConfig(config);
    let connection;
    try {
        connection = await promise_1.default.createConnection({
            host: normalizeHost(config.host),
            port: config.port || 3306,
            user: config.user,
            password: config.password,
            database: config.database,
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
            connectTimeout: CONNECTION_TIMEOUT_MS
        });
    }
    catch (error) {
        throw normalizeDatabaseError(error, 'MySQL');
    }
    try {
        const [rows] = await connection.execute(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
      `, [config.database]);
        const tables = new Map();
        for (const row of rows) {
            const tableName = row.TABLE_NAME;
            if (!tables.has(tableName)) {
                tables.set(tableName, []);
            }
            tables.get(tableName).push(mapMysqlColumn(row));
        }
        const schema = {
            provider: 'mysql',
            database: config.database,
            tables: Array.from(tables.entries()).map(([name, columns]) => ({ name, columns }))
        };
        if (!schema.tables.length) {
            throw new Error(`Aucune table trouvee dans la base MySQL "${config.database}".`);
        }
        return schema;
    }
    finally {
        await connection.end();
    }
}
async function readPostgresSchema(config) {
    validateConnectionConfig(config);
    const client = new Client({
        host: normalizeHost(config.host),
        port: config.port || 5432,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: CONNECTION_TIMEOUT_MS
    });
    try {
        await client.connect();
    }
    catch (error) {
        throw normalizeDatabaseError(error, 'PostgreSQL');
    }
    try {
        const result = await client.query(`
      SELECT
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.table_schema = kcu.table_schema
        AND c.table_name = kcu.table_name
        AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_schema = tc.constraint_schema
        AND kcu.constraint_name = tc.constraint_name
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position
      `);
        const tables = new Map();
        for (const row of result.rows) {
            const tableName = row.table_name;
            if (!tables.has(tableName)) {
                tables.set(tableName, []);
            }
            tables.get(tableName).push(mapPostgresColumn(row));
        }
        const schema = {
            provider: 'postgres',
            database: config.database,
            tables: Array.from(tables.entries()).map(([name, columns]) => ({ name, columns }))
        };
        if (!schema.tables.length) {
            throw new Error(`Aucune table trouvee dans le schema public PostgreSQL de "${config.database}".`);
        }
        return schema;
    }
    finally {
        await client.end();
    }
}
async function readDatabaseSchema(request) {
    if (request.schema) {
        return request.schema;
    }
    if (!request.database) {
        throw new Error('Fournis soit une configuration database, soit un schema JSON.');
    }
    if (request.database.provider === 'mysql') {
        return readMysqlSchema(request.database);
    }
    if (request.database.provider === 'postgres') {
        return readPostgresSchema(request.database);
    }
    throw new Error(`Provider non supporte: ${request.database.provider}`);
}
//# sourceMappingURL=database-reader.js.map