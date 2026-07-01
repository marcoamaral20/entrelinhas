import { describe, expect, it, vi } from "vitest";

import { processRawMessage } from "./process-raw-message";

describe("processRawMessage", () => {
  it("moves a message from processing to processed when the no-op processor succeeds", async () => {
    const messageRepository = {
      markFailed: vi.fn(),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockResolvedValue(undefined),
    };

    await processRawMessage({
      messageRepository,
      rawMessageId: "raw-message-id",
    });

    expect(messageRepository.markProcessing).toHaveBeenCalledWith("raw-message-id");
    expect(messageRepository.markProcessed).toHaveBeenCalledWith("raw-message-id");
    expect(messageRepository.markFailed).not.toHaveBeenCalled();
  });

  it("records failure visibility and rethrows technical failures", async () => {
    const messageRepository = {
      markFailed: vi.fn().mockResolvedValue(undefined),
      markProcessed: vi.fn(),
      markProcessing: vi.fn().mockResolvedValue(undefined),
    };
    const error = new Error("Redis connection dropped");

    await expect(
      processRawMessage({
        messageRepository,
        processor: async () => {
          throw error;
        },
        rawMessageId: "raw-message-id",
      }),
    ).rejects.toThrow("Redis connection dropped");

    expect(messageRepository.markProcessing).toHaveBeenCalledWith("raw-message-id");
    expect(messageRepository.markProcessed).not.toHaveBeenCalled();
    expect(messageRepository.markFailed).toHaveBeenCalledWith(
      "raw-message-id",
      "Redis connection dropped",
    );
  });
});
