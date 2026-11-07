const { getDb, ensureTables, clean } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const sql = getDb();
    await ensureTables(sql);
    if (req.method === 'POST') {
      const body = req.body || {};
      const name = clean(body.name, 60);
      const message = clean(body.message, 300);
      if (!name || !message) return res.status(400).json({ error: 'Add your name and a message.' });
      await sql`INSERT INTO wishes (name, message) VALUES (${name}, ${message})`;
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'GET') {
      const rows = await sql`SELECT name, message, created_at AS at FROM wishes ORDER BY id DESC LIMIT 50`;
      return res.status(200).json(rows);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Unable to load wishes right now.' });
  }
};
