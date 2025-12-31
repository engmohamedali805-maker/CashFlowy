
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL missing' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // التأكد من وجود الجدول
    await sql`CREATE TABLE IF NOT EXISTS user_accounts (
        username TEXT PRIMARY KEY, 
        password TEXT, 
        app_state JSONB, 
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const username = req.query.username || req.body.username;
    if (!username) return res.status(400).json({ error: 'Username/Key required' });

    // معالجة الـ GET
    if (req.method === 'GET') {
      const rows = await sql`SELECT app_state FROM user_accounts WHERE username = ${username}`;
      return res.json({ state: rows.length > 0 ? rows[0].app_state : null });
    }

    // معالجة الـ POST
    if (req.method === 'POST') {
      const { action, state, password: inputPassword } = req.body;
      
      if (action === 'register') {
        const existing = await sql`SELECT username FROM user_accounts WHERE username = ${username}`;
        if (existing.length > 0) return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
        await sql`INSERT INTO user_accounts (username, password, app_state) VALUES (${username}, ${inputPassword}, '{}'::jsonb)`;
        return res.json({ success: true });
      }

      if (action === 'login') {
        const rows = await sql`SELECT password, app_state FROM user_accounts WHERE username = ${username}`;
        if (rows.length === 0 || rows[0].password !== inputPassword) {
          return res.status(401).json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' });
        }
        return res.json({ state: rows[0].app_state });
      }
      
      // مزامنة البيانات (Upsert)
      await sql`
        INSERT INTO user_accounts (username, app_state, updated_at) 
        VALUES (${username}, ${state || {}}, CURRENT_TIMESTAMP)
        ON CONFLICT (username) 
        DO UPDATE SET app_state = EXCLUDED.app_state, updated_at = CURRENT_TIMESTAMP
      `;
      
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Server Error', details: error.message });
  }
}
