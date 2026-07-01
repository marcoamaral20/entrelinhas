import { loadConfig } from "../src/shared/config";
import { createDatabase } from "../src/shared/database/database";
import { runMigrations } from "../src/shared/database/migrate";

async function main() {
  const config = loadConfig();
  const database = createDatabase(config.databaseUrl);

  try {
    await runMigrations(database.pool);
  } finally {
    await database.pool.end();
  }
}

void main();
