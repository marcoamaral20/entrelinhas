import { describe, expect, it, vi } from "vitest";

import { processRawMessage } from "./process-raw-message";

describe("processRawMessage", () => {
  it("creates a parser result and property listing for a complete real estate message", async () => {
    const messageRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "raw-message-id",
        text: "VENDO CASA\n3 quartos\nJardim Europa\nLondrina - PR\nR$ 320.000",
      }),
      markFailed: vi.fn(),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockResolvedValue(undefined),
    };
    const parserResultRepository = {
      createForMessage: vi.fn().mockResolvedValue({
        id: "parser-result-id",
      }),
    };
    const propertyListingRepository = {
      createFromParserResult: vi.fn().mockResolvedValue(undefined),
    };

    await processRawMessage({
      messageRepository,
      parserResultRepository,
      propertyListingRepository,
      rawMessageId: "raw-message-id",
    });

    expect(messageRepository.markProcessing).toHaveBeenCalledWith("raw-message-id");
    expect(parserResultRepository.createForMessage).toHaveBeenCalledWith({
      rawMessageId: "raw-message-id",
      reason: null,
      status: "listing_created",
    });
    expect(propertyListingRepository.createFromParserResult).toHaveBeenCalledWith({
      bedrooms: 3,
      city: "Londrina",
      contactPhone: null,
      intent: "sale",
      locationText: "Jardim Europa, Londrina - PR",
      neighborhood: "Jardim Europa",
      parserResultId: "parser-result-id",
      priceAmount: 320000,
      propertyType: "house",
      rawMessageId: "raw-message-id",
      state: "PR",
    });
    expect(messageRepository.markProcessed).toHaveBeenCalledWith("raw-message-id");
    expect(messageRepository.markFailed).not.toHaveBeenCalled();
  });

  it("creates an unstructured parser result without a property listing for incomplete real estate messages", async () => {
    const messageRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "raw-message-id",
        text: "VENDO CASA\nJardim Europa\nLondrina - PR",
      }),
      markFailed: vi.fn(),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockResolvedValue(undefined),
    };
    const parserResultRepository = {
      createForMessage: vi.fn().mockResolvedValue({
        id: "parser-result-id",
      }),
    };
    const propertyListingRepository = {
      createFromParserResult: vi.fn(),
    };

    await processRawMessage({
      messageRepository,
      parserResultRepository,
      propertyListingRepository,
      rawMessageId: "raw-message-id",
    });

    expect(parserResultRepository.createForMessage).toHaveBeenCalledWith({
      rawMessageId: "raw-message-id",
      reason: "missing_price",
      status: "unstructured",
    });
    expect(propertyListingRepository.createFromParserResult).not.toHaveBeenCalled();
    expect(messageRepository.markProcessed).toHaveBeenCalledWith("raw-message-id");
  });

  it("creates a rejected parser result without a property listing for non-real-estate messages", async () => {
    const messageRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "raw-message-id",
        text: "Backend Developer remoto para startup",
      }),
      markFailed: vi.fn(),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockResolvedValue(undefined),
    };
    const parserResultRepository = {
      createForMessage: vi.fn().mockResolvedValue({
        id: "parser-result-id",
      }),
    };
    const propertyListingRepository = {
      createFromParserResult: vi.fn(),
    };

    await processRawMessage({
      messageRepository,
      parserResultRepository,
      propertyListingRepository,
      rawMessageId: "raw-message-id",
    });

    expect(parserResultRepository.createForMessage).toHaveBeenCalledWith({
      rawMessageId: "raw-message-id",
      reason: "unsupported_domain",
      status: "rejected",
    });
    expect(propertyListingRepository.createFromParserResult).not.toHaveBeenCalled();
    expect(messageRepository.markProcessed).toHaveBeenCalledWith("raw-message-id");
  });

  it("records failure visibility and rethrows technical failures", async () => {
    const messageRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "raw-message-id",
        text: "VENDO CASA\nJardim Europa\nLondrina - PR\nR$ 320.000",
      }),
      markFailed: vi.fn().mockResolvedValue(undefined),
      markProcessed: vi.fn(),
      markProcessing: vi.fn().mockResolvedValue(undefined),
    };
    const parserResultRepository = {
      createForMessage: vi.fn(),
    };
    const propertyListingRepository = {
      createFromParserResult: vi.fn(),
    };
    const error = new Error("Redis connection dropped");

    await expect(
      processRawMessage({
        messageRepository,
        parserResultRepository,
        processor: async () => {
          throw error;
        },
        propertyListingRepository,
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
