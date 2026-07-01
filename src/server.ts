import { buildApp } from "./app";
import { createPostgresMessageRepository } from "./messages/message.repository";
import { createBullMqProcessingQueue } from "./processing/processing.queue";
import { loadConfig } from "./shared/config";
import { createDatabase } from "./shared/database/database";

async function start() {
  const config = loadConfig();
  const database = createDatabase(config.databaseUrl);
  const processingQueue = createBullMqProcessingQueue(config.redisUrl);
  const app = buildApp({
    config,
    messageRepository: createPostgresMessageRepository(database.db),
    processingQueue,
  });

  try {
    await app.listen({
      host: config.host,
      port: config.port,
    });
  } catch (error) {
    app.log.error(error, "Failed to start Garimzap");
    process.exitCode = 1;
  }
}

void start();
