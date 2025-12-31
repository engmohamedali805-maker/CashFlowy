export default async function handler(req, res) {
  const id = (req.query.id || "default").toString();
  const state = req.body;

  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  await pool.query(
    "insert into app_state(id, state, updated_at) values ($1,$2,now()) on conflict (id) do update set state=$2, updated_at=now()",
    [id, state]
  );

  res.status(200).json({ ok: true });
}
