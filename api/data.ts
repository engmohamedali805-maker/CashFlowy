
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // التأكد من وجود رابط قاعدة البيانات
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'DATABASE_URL is not defined in environment variables' });
  }

  const sql = neon(databaseUrl);

  try {
    // 1. إنشاء الجدول إذا لم يكن موجوداً (Initialization)
    // نستخدم JSONB للمرونة والسرعة في التعامل مع الكائنات المعقدة
    await sql`
      CREATE TABLE IF NOT EXISTS user_accounts (
        username TEXT PRIMARY KEY,
        password TEXT,
        app_state JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const username = (req.query.username || req.body.username || '').trim();
    if (!username && req.method !== 'OPTIONS') {
      return res.status(400).json({ error: 'Username or Sync Key is required' });
    }

    // 2. معالجة طلب جلب البيانات (GET)
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT app_state FROM user_accounts WHERE username = ${username}
      `;
      // إذا لم يجد المستخدم، نرجع null بدلاً من خطأ ليبدأ التطبيق بحالة جديدة
      return res.status(200).json({ 
        state: rows.length > 0 ? rows[0].app_state : null 
      });
    }

    // 3. معالجة طلبات الحفظ والتسجيل (POST)
    if (req.method === 'POST') {
      const { action, state, password: inputPassword } = req.body;

      // أ. تسجيل حساب جديد
      if (action === 'register') {
        const existing = await sql`SELECT username FROM user_accounts WHERE username = ${username}`;
        if (existing.length > 0) {
          return res.status(400).json({ error: 'هذا الاسم مستخدم بالفعل، اختر اسماً آخر أو مفتاحاً مختلفاً' });
        }
        await sql`
          INSERT INTO user_accounts (username, password, app_state) 
          VALUES (${username}, ${inputPassword}, '{}'::jsonb)
        `;
        return res.status(200).json({ success: true });
      }

      // ب. تسجيل الدخول
      if (action === 'login') {
        const rows = await sql`
          SELECT password, app_state FROM user_accounts WHERE username = ${username}
        `;
        if (rows.length === 0 || rows[0].password !== inputPassword) {
          return res.status(401).json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' });
        }
        return res.status(200).json({ state: rows[0].app_state });
      }

      // ج. مزامنة الحالة (Sync / Update)
      // نستخدم ON CONFLICT لضمان التحديث إذا كان المستخدم موجوداً بالفعل
      // لا نحدث كلمة المرور هنا للحفاظ على الأمان
      await sql`
        INSERT INTO user_accounts (username, app_state, updated_at)
        VALUES (${username}, ${JSON.stringify(state || {})}, CURRENT_TIMESTAMP)
        ON CONFLICT (username)
        DO UPDATE SET 
          app_state = EXCLUDED.app_state,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Operation Error:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ في الاتصال بالسحابة', 
      details: error.message 
    });
  }
}
