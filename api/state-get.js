import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    const { id = "default" } = req.query;

    const result = await pool.query(
      "select state from app_state where id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json(null);
    }

    return res.status(200).json(result.rows[0].state);
  } catch (err) {
    console.error("STATE GET ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
