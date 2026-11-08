const { neon } = require('@neondatabase/serverless');

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Add a Neon/Postgres DATABASE_URL in Vercel project settings.');
  }
  return neon(process.env.DATABASE_URL);
}

async function ensureTables(sql) {
  await sql`CREATE TABLE IF NOT EXISTS rsvps (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    attending BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS wishes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  // CREATE TABLE IF NOT EXISTS does not update an older table. Add columns
  // used by the current API so an existing Neon database can be upgraded safely.
  await sql`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guests INTEGER NOT NULL DEFAULT 1`;
  await sql`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS attending BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
  await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
}

function clean(value, max = 300) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
}

module.exports = { getDb, ensureTables, clean };
