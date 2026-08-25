import { createClient } from '@supabase/supabase-js';
import { requireAuth } from './admin/_verify.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple in-memory rate limiter (per IP, max 30 req/min per endpoint)
const rateLimit = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const window = 60_000;
  const maxReqs = 30;
  const entry = rateLimit.get(ip) || { count: 0, resetAt: now + window };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + window; }
  entry.count++;
  if (entry.count > maxReqs) return false;
  rateLimit.set(ip, entry);
  return true;
}

// Only allow known content keys (prevents arbitrary writes)
const ALLOWED_KEYS = new Set([
  'service_webdesign_price',
  'service_video_price',
  'service_writing_price',
  'service_thumbnail_price',
  'service_logo_price',
  'service_social_price',
  'contact_phone',
  'contact_email',
  'stat_projects_done',
  'stat_client_satisfaction',
]);

function sanitizeValue(val) {
  return String(val).trim().slice(0, 200);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigins = ['https://vortexflowmedia.vercel.app', 'http://localhost:3000'];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://vortexflowmedia.vercel.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Rate limit check
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests — slow down' });
  }

  // GET — public, returns all content as { key: value }
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('site_content').select('key, value');
      if (error) throw error;
      const content = {};
      data.forEach((row) => { content[row.key] = row.value; });
      return res.status(200).json(content);
    } catch (err) {
      console.error('GET /api/content error:', err);
      return res.status(500).json({ error: 'Failed to load content' });
    }
  }

  // PUT — admin only, upserts rows
  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return;

    const { updates } = req.body || {};
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Body must be { updates: { key: value } }' });
    }

    // Validate keys and sanitize values
    const sanitized = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: `Invalid key: "${key}" is not allowed` });
      }
      sanitized[key] = sanitizeValue(value);
    }

    try {
      const entries = Object.entries(sanitized);
      const rows = entries.map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
      if (error) throw error;

      return res.status(200).json({ success: true, updatedKeys: entries.map(([k]) => k) });
    } catch (err) {
      console.error('PUT /api/content error:', err);
      return res.status(500).json({ error: 'Failed to save changes' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
