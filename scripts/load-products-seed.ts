import { readFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;

const file = "products_seed.json";
const data = JSON.parse(readFileSync(file, "utf-8"));

if (!Array.isArray(data)) {
  throw new Error(`${file} must be an array`);
}

const cs = process.env.DATABASE_URL;
if (!cs) throw new Error("DATABASE_URL is required");

const client = new Client({ connectionString: cs });
await client.connect();

await client.query("TRUNCATE public.products_seed");

for (const p of data) {
  const slug = p.slug;
  if (!slug) throw new Error("Product without slug in seed file");

  await client.query(
    `INSERT INTO public.products_seed(slug, payload)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (slug) DO UPDATE SET payload = EXCLUDED.payload`,
    [slug, JSON.stringify(p)]
  );
}

await client.end();
console.log("seed loaded:", data.length);
