
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not found in environment variables' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Ensure table exists with password and state columns
    await sql`
      CREATE TABLE IF NOT EXISTS user_accounts (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        app_state JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const { action, username, password, state } = req.body || req.query;

    if (!username) return res.status(400).json({ error: 'Username required' });

    // --- Action: Register ---
    if (action === 'register') {
      try {
        await sql`
          INSERT INTO user_accounts (username, password, app_state)
          VALUES (${username}, ${password}, ${state || {}})
        `;
        return res.json({ success: true });
      } catch (e: any) {
        if (e.message.includes('unique constraint')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        throw e;
      }
    }

    // --- Action: Login ---
    if (action === 'login') {
      const rows = await sql`
        SELECT password, app_state FROM user_accounts WHERE username = ${username}
      `;
      if (rows.length === 0 || rows[0].password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      return res.json({ success: true, state: rows[0].app_state });
    }

    // --- Action: Sync (Update State) ---
    if (req.method === 'POST' && action === 'sync') {
      await sql`
        UPDATE user_accounts 
        SET app_state = ${state}, updated_at = CURRENT_TIMESTAMP
        WHERE username = ${username}
      `;
      return res.json({ success: true });
    }

    // --- Action: Fetch (For refreshing) ---
    if (req.method === 'GET') {
        const rows = await sql`SELECT app_state FROM user_accounts WHERE username = ${username}`;
        return res.json({ state: rows[0]?.app_state || {} });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message });
  }
}
