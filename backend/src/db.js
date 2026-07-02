import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          plan TEXT NOT NULL DEFAULT 'free',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS checks (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          score INTEGER NOT NULL,
          label TEXT NOT NULL,
          breach_count INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`);
    })();
  }
  return schemaReady;
}

export async function findUserByEmail(email) {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

export async function findUserById(id) {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createUser({ email, password, plan }) {
  await ensureSchema();
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, plan) VALUES ($1, $2, $3) RETURNING *',
    [email.toLowerCase(), password, plan]
  );
  return rows[0];
}

export async function saveCheck({ userId, email, score, label, breachCount }) {
  await ensureSchema();
  await pool.query(
    'INSERT INTO checks (user_id, email, score, label, breach_count) VALUES ($1, $2, $3, $4, $5)',
    [userId, email, score, label, breachCount]
  );
}

export async function getLatestCheck(userId) {
  await ensureSchema();
  const { rows } = await pool.query(
    'SELECT * FROM checks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

export async function deleteUser(id) {
  await ensureSchema();
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function setResetToken(email, token, expiresAt) {
  await ensureSchema();
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
    [token, expiresAt, email.toLowerCase()]
  );
}

export async function findUserByResetToken(token) {
  await ensureSchema();
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > now()',
    [token]
  );
  return rows[0] || null;
}

export async function resetPassword(userId, hashedPassword) {
  await ensureSchema();
  await pool.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
    [hashedPassword, userId]
  );
}

export async function updateUserPlan(userId, plan) {
  await ensureSchema();
  const { rows } = await pool.query(
    'UPDATE users SET plan = $1 WHERE id = $2 RETURNING *',
    [plan, userId]
  );
  return rows[0];
}
