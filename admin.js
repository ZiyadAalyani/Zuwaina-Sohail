const crypto = require('crypto');
const { getDb, ensureTables, clean } = require('./_db');

function validKey(value) {
  const expected = process.env.ADMIN_KEY || '';
  const a = Buffer.from(String(value || ''));
  const b = Buffer.from(expected);
  return expected && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function keyFrom(req, body = {}) {
  return req.headers['x-admin-key'] || body.key || '';
}

module.exports = async function handler(req, res) {
  try {
    let body = {};
    if (req.method === 'POST') {
      body = typeof req.body === 'object' && req.body ? req.body : {};
    }

    // Login is intentionally a tiny auth handshake. The secret is never put in the URL.
    if (req.method === 'POST' && body.action === 'login') {
      if (!validKey(body.key)) return res.status(401).json({ ok: false, error: 'Invalid admin key.' });
      return res.status(200).json({ ok: true });
    }

    const key = keyFrom(req, body);
    if (!validKey(key)) return res.status(401).json({ ok: false, error: 'Unauthorized.' });

    const sql = getDb();
    await ensureTables(sql);

    if (req.method === 'POST' && body.action === 'delete-rsvp') {
      const id = Number(body.id);
      if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'Invalid RSVP id.' });
      await sql`DELETE FROM rsvps WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST' && body.action === 'delete-wish') {
      const id = Number(body.id);
      if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'Invalid wish id.' });
      await sql`DELETE FROM wishes WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    const rsvps = await sql`SELECT id, name, guests, attending, created_at AS at FROM rsvps ORDER BY created_at DESC`;
    const wishes = await sql`SELECT id, name, message, created_at AS at FROM wishes ORDER BY created_at DESC`;
    const attending = rsvps.filter(x => x.attending);
    const declined = rsvps.filter(x => !x.attending);
    const totalGuests = attending.reduce((sum, x) => sum + Number(x.guests || 0), 0);

    return res.status(200).json({
      ok: true,
      stats: {
        rsvps: rsvps.length,
        attending: attending.length,
        declined: declined.length,
        guests: totalGuests,
        wishes: wishes.length,
        lastRsvpAt: rsvps[0]?.at || null
      },
      rsvps: rsvps.map(x => ({ ...x, guests: Number(x.guests || 0) })),
      wishes
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Unable to load admin data.' });
  }
};
