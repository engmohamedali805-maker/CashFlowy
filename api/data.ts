
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // 1. Check for Database Connection String
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'Configuration Error: DATABASE_URL is missing.' });
  }

  const sql = neon(databaseUrl);

  try {
    // 2. Initialize Table (if not exists)
    await sql`
      CREATE TABLE IF NOT EXISTS user_accounts (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        app_state JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Ensure Admin User 'Mali' Exists
    // We do this every time to ensure the admin access is always restored if deleted
    const adminUser = 'Mali';
    const adminPass = 'mali@159753@';
    
    // Check if Mali exists, if not insert him. If he exists, ensure password matches.
    await sql`
      INSERT INTO user_accounts (username, password, app_state)
      VALUES (${adminUser}, ${adminPass}, '{}'::jsonb)
      ON CONFLICT (username) 
      DO UPDATE SET password = ${adminPass}
    `;

    // 4. Handle Request Methods
    const username = (req.query.username || req.body.username || '').trim();

    if (!username && req.method !== 'OPTIONS') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // --- GET: Fetch Data ---
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT app_state FROM user_accounts WHERE username = ${username}
      `;
      
      if (rows.length === 0) {
        // User not found in DB
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ state: rows[0].app_state });
    }

    // --- POST: Login, Register, Sync ---
    if (req.method === 'POST') {
      const { action, state, password } = req.body;

      // A. Register
      if (action === 'register') {
        if (username.toLowerCase() === 'mali') {
            return res.status(400).json({ error: 'Admin username is reserved.' });
        }
        
        const existing = await sql`SELECT username FROM user_accounts WHERE username = ${username}`;
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Username already taken.' });
        }

        await sql`
          INSERT INTO user_accounts (username, password, app_state) 
          VALUES (${username}, ${password}, '{}'::jsonb)
        `;
        return res.status(200).json({ success: true });
      }

      // B. Login
      if (action === 'login') {
        const rows = await sql`
          SELECT password, app_state FROM user_accounts WHERE username = ${username}
        `;

        if (rows.length === 0) {
           return res.status(401).json({ error: 'Account does not exist.' });
        }

        if (rows[0].password !== password) {
          return res.status(401).json({ error: 'Incorrect password.' });
        }

        return res.status(200).json({ state: rows[0].app_state });
      }

      // C. Sync (Save Data)
      if (action === 'sync') {
        // We assume the user is authenticated on the client side via state management
        // In a real production app, you would verify a JWT token here.
        await sql`
          UPDATE user_accounts 
          SET app_state = ${JSON.stringify(state || {})}, updated_at = CURRENT_TIMESTAMP
          WHERE username = ${username}
        `;
        return res.status(200).json({ success: true });
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Database connection failed.', details: error.message });
  }
}
