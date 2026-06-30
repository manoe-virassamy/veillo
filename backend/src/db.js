import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const DB_PATH = join(DATA_DIR, 'users.json');

function ensureDB() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) writeFileSync(DB_PATH, JSON.stringify({ users: [] }));
}

function readDB() {
  ensureDB();
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  ensureDB();
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email) {
  const { users } = readDB();
  return users.find(u => u.email === email.toLowerCase()) || null;
}

export function findUserById(id) {
  const { users } = readDB();
  return users.find(u => u.id === id) || null;
}

export function createUser({ email, password, plan }) {
  const db = readDB();
  const user = {
    id: String(Date.now()),
    email: email.toLowerCase(),
    password,
    plan,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDB(db);
  return user;
}
