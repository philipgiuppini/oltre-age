import { readFileSync } from "node:fs";
import { Client } from "pg";

// carica .env.local minimale
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : "";
};
const conn = get("DATABASE_URL");
if (!conn) {
  console.error("DATABASE_URL mancante in .env.local");
  process.exit(1);
}
const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select (select count(*) from public.apartments) as apt, (select count(*) from public.banca_items) as banca"
  );
  console.log("OK schema applicato. apartments=", rows[0].apt, " banca_items=", rows[0].banca);
} catch (e) {
  console.error("ERRORE:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
