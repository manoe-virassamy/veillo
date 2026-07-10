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
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS beta BOOLEAN NOT NULL DEFAULT false`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token TEXT`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token_expires TIMESTAMPTZ`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS hibp_cache (
          email TEXT PRIMARY KEY,
          breaches JSONB NOT NULL,
          fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS waitlist (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          invited BOOLEAN NOT NULL DEFAULT false,
          invite_token TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS feedback (
          id SERIAL PRIMARY KEY,
          email TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
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

export async function createUser({ email, password, plan, firstName }) {
  await ensureSchema();
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, plan, first_name) VALUES ($1, $2, $3, $4) RETURNING *',
    [email.toLowerCase(), password, plan, firstName]
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

export async function setVerifyToken(userId, token, expiresAt) {
  await ensureSchema();
  await pool.query(
    'UPDATE users SET verify_token = $1, verify_token_expires = $2 WHERE id = $3',
    [token, expiresAt, userId]
  );
}

export async function findUserByVerifyToken(token) {
  await ensureSchema();
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE verify_token = $1 AND verify_token_expires > now()',
    [token]
  );
  return rows[0] || null;
}

export async function markEmailVerified(userId) {
  await ensureSchema();
  await pool.query(
    'UPDATE users SET email_verified = true, verify_token = NULL, verify_token_expires = NULL WHERE id = $1',
    [userId]
  );
}

export async function updateUserPlan(userId, plan, { beta = false } = {}) {
  await ensureSchema();
  const { rows } = await pool.query(
    'UPDATE users SET plan = $1, beta = $2 WHERE id = $3 RETURNING *',
    [plan, beta, userId]
  );
  return rows[0];
}

export async function countBetaUsers() {
  await ensureSchema();
  const { rows } = await pool.query('SELECT COUNT(*) FROM users WHERE beta = true');
  return Number(rows[0].count);
}

export async function setStripeCustomer(userId, customerId, subscriptionId) {
  await ensureSchema();
  await pool.query(
    'UPDATE users SET stripe_customer_id = $1, stripe_subscription_id = $2 WHERE id = $3',
    [customerId, subscriptionId, userId]
  );
}

export async function findUserByStripeSubscriptionId(subscriptionId) {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM users WHERE stripe_subscription_id = $1', [subscriptionId]);
  return rows[0] || null;
}

export async function getCachedBreaches(email) {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT breaches FROM hibp_cache WHERE email = $1 AND fetched_at > now() - interval '24 hours'",
    [email.toLowerCase()]
  );
  return rows[0] ? rows[0].breaches : null;
}

export async function setCachedBreaches(email, breaches) {
  await ensureSchema();
  await pool.query(
    `INSERT INTO hibp_cache (email, breaches, fetched_at) VALUES ($1, $2, now())
     ON CONFLICT (email) DO UPDATE SET breaches = $2, fetched_at = now()`,
    [email.toLowerCase(), JSON.stringify(breaches)]
  );
}

export async function addToWaitlist(email) {
  await ensureSchema();
  const { rows } = await pool.query(
    `INSERT INTO waitlist (email) VALUES ($1)
     ON CONFLICT (email) DO NOTHING RETURNING *`,
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

export async function listWaitlist() {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM waitlist ORDER BY created_at ASC');
  return rows;
}

export async function setWaitlistInviteToken(email, token) {
  await ensureSchema();
  await pool.query(
    'UPDATE waitlist SET invited = true, invite_token = $1 WHERE email = $2',
    [token, email.toLowerCase()]
  );
}

export async function findWaitlistByInviteToken(token) {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM waitlist WHERE invite_token = $1', [token]);
  return rows[0] || null;
}

export async function clearWaitlistInviteToken(email) {
  await ensureSchema();
  await pool.query('UPDATE waitlist SET invite_token = NULL WHERE email = $1', [email.toLowerCase()]);
}

export async function saveFeedback({ email, message }) {
  await ensureSchema();
  await pool.query('INSERT INTO feedback (email, message) VALUES ($1, $2)', [email || null, message]);
}
