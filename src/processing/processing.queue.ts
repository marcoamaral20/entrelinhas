import { Queue } from "bullmq";

import type { ProcessingQueue, RawMessageProcessingJob } from "./processing.types";
import { createRedisConnectionOptions } from "./redis";

export const rawMessageProcessingQueueName = "raw-message-processing";

type QueueLike = {
  add(
    name: string,
    data: RawMessageProcessingJob,
    options: {
      attempts: number;
      backoff: {
        delay: number;
        type: "exponential";
      };
      jobId: string;
    },
  ): Promise<unknown>;
};

export async function enqueueRawMessageProcessing(queue: QueueLike, rawMessageId: string) {
  await queue.add(
    "process-raw-message",
    { rawMessageId },
    {
      attempts: 3,
      backoff: {
        delay: 1000,
        type: "exponential",
      },
      jobId: rawMessageId,
    },
  );
}

export function createBullMqProcessingQueue(
  redisUrl: string,
): ProcessingQueue & { close(): Promise<void> } {
  const queue = new Queue<RawMessageProcessingJob>(rawMessageProcessingQueueName, {
    connection: createRedisConnectionOptions(redisUrl),
  });

  return {
    async close() {
      await queue.close();
    },
    async enqueueRawMessage(rawMessageId: string) {
      await enqueueRawMessageProcessing(queue, rawMessageId);
    },
  };
}
