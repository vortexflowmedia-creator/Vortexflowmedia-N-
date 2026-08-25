import crypto from 'crypto';

export function isValidToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;

  const [payload, sig] = token.split('.');
  const secret = process.env.ADMIN_SESSION_SECRET;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const valid =
    sig.length === expectedSig.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));

  if (!valid) return false;

  const expiresAt = Number(payload);
  return Date.now() < expiresAt;
}

export function requireAuth(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized — please log in again' });
    return false;
  }
  return true;
}
