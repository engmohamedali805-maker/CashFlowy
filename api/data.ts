
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not found' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const { action, username, password, state } = req.body || req.query;

    if (!username) return res.status(400).json({ error: 'Username required' });

    // --- Login ---
    if (action === 'login') {
      const rows = await sql`SELECT password, app_state FROM user_accounts WHERE username = ${username}`;
      if (rows.length === 0 || rows[0].password !== password) {
        return res.status(401).json({ error: 'Invalid login' });
      }
      return res.json({ success: true, state: rows[0].app_state });
    }

    // --- Sync ---
    if (action === 'sync' && req.method === 'POST') {
      await sql`UPDATE user_accounts SET app_state = ${state}, updated_at = CURRENT_TIMESTAMP WHERE username = ${username}`;
      return res.json({ success: true });
    }

    // --- Fetch ---
    if (req.method === 'GET') {
      const rows = await sql`SELECT app_state FROM user_accounts WHERE username = ${username}`;
      return res.json({ state: rows[0]?.app_state || {} });
    }

    // --- Register (Fallback only) ---
    if (action === 'register') {
      // Setup table only during registration to save time on normal requests
      await sql`CREATE TABLE IF NOT EXISTS user_accounts (username TEXT PRIMARY KEY, password TEXT, app_state JSONB, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`INSERT INTO user_accounts (username, password, app_state) VALUES (${username}, ${password}, ${state || {}})`;
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
