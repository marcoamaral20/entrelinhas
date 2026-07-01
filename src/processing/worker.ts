import { createPostgresMessageRepository } from "../messages/message.repository";
import { createPostgresParserResultRepository } from "../parser/parser-result.repository";
import { createPostgresPropertyListingRepository } from "../property-listings/property-listing.repository";
import { loadConfig } from "../shared/config";
import { createDatabase } from "../shared/database/database";
import { createProcessingWorker } from "./processing.worker";

async function start() {
  const config = loadConfig();
  const database = createDatabase(config.databaseUrl);
  const worker = createProcessingWorker({
    messageRepository: createPostgresMessageRepository(database.db),
    parserResultRepository: createPostgresParserResultRepository(database.db),
    propertyListingRepository: createPostgresPropertyListingRepository(database.db),
    redisUrl: config.redisUrl,
  });

  worker.on("completed", (job) => {
    console.info({ jobId: job.id }, "Raw message processing job completed");
  });

  worker.on("failed", (job, error) => {
    console.error({ error, jobId: job?.id }, "Raw message processing job failed");
  });
}

void start();
