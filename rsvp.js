const { getDb, ensureTables, clean } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const sql = getDb();
    await ensureTables(sql);
    const body = req.body || {};
    const name = clean(body.name, 80);
    if (!name) return res.status(400).json({ error: 'Please enter your name.' });
    const guests = Math.min(Math.max(Number(body.guests) || 1, 1), 10);
    const attending = body.attending !== 'no';
    await sql`INSERT INTO rsvps (name, guests, attending) VALUES (${name}, ${guests}, ${attending})`;
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Unable to save RSVP right now.' });
  }
};
