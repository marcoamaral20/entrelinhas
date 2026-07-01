import { Worker } from "bullmq";

import type { MessageRepository } from "../messages/message.types";
import type { ParserResultRepository } from "../parser/parser-result.types";
import type { PropertyListingRepository } from "../property-listings/property-listing.types";
import { processRawMessage } from "./process-raw-message";
import { rawMessageProcessingQueueName } from "./processing.queue";
import type { RawMessageProcessingJob } from "./processing.types";
import { createRedisConnectionOptions } from "./redis";

type ProcessingWorkerOptions = {
  messageRepository: MessageRepository;
  parserResultRepository: ParserResultRepository;
  propertyListingRepository: PropertyListingRepository;
  redisUrl: string;
};

export function createProcessingWorker({
  messageRepository,
  parserResultRepository,
  propertyListingRepository,
  redisUrl,
}: ProcessingWorkerOptions) {
  return new Worker<RawMessageProcessingJob>(
    rawMessageProcessingQueueName,
    async (job) => {
      await processRawMessage({
        messageRepository,
        parserResultRepository,
        propertyListingRepository,
        rawMessageId: job.data.rawMessageId,
      });
    },
    {
      connection: createRedisConnectionOptions(redisUrl),
    },
  );
}
