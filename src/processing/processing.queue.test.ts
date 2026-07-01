import { describe, expect, it, vi } from "vitest";

import { enqueueRawMessageProcessing } from "./processing.queue";

describe("enqueueRawMessageProcessing", () => {
  it("uses the raw message id as the job id and applies bounded retry options", async () => {
    const queue = {
      add: vi.fn().mockResolvedValue(undefined),
    };

    await enqueueRawMessageProcessing(queue, "raw-message-id");

    expect(queue.add).toHaveBeenCalledWith(
      "process-raw-message",
      { rawMessageId: "raw-message-id" },
      {
        attempts: 3,
        backoff: {
          delay: 1000,
          type: "exponential",
        },
        jobId: "raw-message-id",
      },
    );
  });
});
