import { query } from '../db.js';

const tableName = "clients";
const columns = [
  "id",
  "name"
];
const editableColumns = [
  "name"
];
const primaryKey = "id";

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
  return query(`SELECT ${columns.map((column) => `\`${column}\``).join(', ')} FROM \`${tableName}\` ORDER BY \`${primaryKey}\` DESC`);
}

export async function findById(id) {
  const rows = await query(`SELECT ${columns.map((column) => `\`${column}\``).join(', ')} FROM \`${tableName}\` WHERE \`${primaryKey}\` = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function create(payload) {
  const data = pickPayload(payload);
  const keys = Object.keys(data);
  if (!keys.length) {
    throw new Error('Aucune donnee a enregistrer.');
  }
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO \`${tableName}\` (${keys.map((key) => `\`${key}\``).join(', ')}) VALUES (${placeholders})`;
  const result = await query(sql, keys.map((key) => data[key]));
  return findById(result.insertId);
}

export async function update(id, payload) {
  const data = pickPayload(payload);
  const keys = Object.keys(data);
  if (!keys.length) {
    return findById(id);
  }
  const assignments = keys.map((key) => `\`${key}\` = ?`).join(', ');
  await query(`UPDATE \`${tableName}\` SET ${assignments} WHERE \`${primaryKey}\` = ?`, [...keys.map((key) => data[key]), id]);
  return findById(id);
}

export async function remove(id) {
  await query(`DELETE FROM \`${tableName}\` WHERE \`${primaryKey}\` = ?`, [id]);
  return { deleted: true };
}
