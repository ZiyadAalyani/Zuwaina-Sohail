const { getDb, ensureTables } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const sql = getDb();
    await sql`SELECT 1`;
    await ensureTables(sql);
    return res.status(200).json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      ok: false,
      database: 'not connected',
      error: process.env.DATABASE_URL
        ? 'The database connection failed. Check the DATABASE_URL value in Vercel.'
        : 'DATABASE_URL is missing from Vercel environment variables.'
    });
  }
};
