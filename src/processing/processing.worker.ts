import { Worker } from "bullmq";

import type { MessageRepository } from "../messages/message.types";
import { processRawMessage } from "./process-raw-message";
import { rawMessageProcessingQueueName } from "./processing.queue";
import type { RawMessageProcessingJob } from "./processing.types";
import { createRedisConnectionOptions } from "./redis";

type ProcessingWorkerOptions = {
  messageRepository: MessageRepository;
  redisUrl: string;
};

export function createProcessingWorker({ messageRepository, redisUrl }: ProcessingWorkerOptions) {
  return new Worker<RawMessageProcessingJob>(
    rawMessageProcessingQueueName,
    async (job) => {
      await processRawMessage({
        messageRepository,
        rawMessageId: job.data.rawMessageId,
      });
    },
    {
      connection: createRedisConnectionOptions(redisUrl),
    },
  );
}
