import crypto from 'crypto';

function sign(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${h}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};

  if (
    !username || !password ||
    (username !== process.env.ADMIN_USERNAME && username !== process.env.ADMIN_EMAIL) ||
    password !== process.env.ADMIN_MASTER_PASSWORD
  ) {
    return res.status(401).json({ error: 'Incorrect credentials' });
  }

  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const token = sign(String(expiresAt));

  return res.status(200).json({ token, expiresAt });
}
