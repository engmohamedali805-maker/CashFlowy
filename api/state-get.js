export default async function handler(req, res) {
  const id = req.query.id || "default";
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  const r = await pool.query("select state from app_state where id=$1", [id]);
  res.status(200).json(r.rows[0]?.state ?? null);
}
