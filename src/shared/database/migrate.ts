import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type pg from "pg";

export async function runMigrations(pool: pg.Pool) {
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const migrationsDirectory = path.join(process.cwd(), "drizzle");
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  for (const filename of migrationFiles) {
    const existing = await pool.query("select 1 from schema_migrations where filename = $1", [
      filename,
    ]);

    if (existing.rowCount && existing.rowCount > 0) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDirectory, filename), "utf8");

    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query("insert into schema_migrations (filename) values ($1)", [filename]);
      await pool.query("commit");
    } catch (error) {
      await pool.query("rollback");
      throw error;
    }
  }
}
