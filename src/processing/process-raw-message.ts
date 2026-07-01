import type { MessageRepository } from "../messages/message.types";
import type { ParserResultRepository } from "../parser/parser-result.types";
import { parseRealEstateMessage } from "../parser/real-estate-parser";
import type { PropertyListingRepository } from "../property-listings/property-listing.types";

type ProcessRawMessageDependencies = {
  messageRepository: Pick<
    MessageRepository,
    "findById" | "markFailed" | "markProcessed" | "markProcessing"
  >;
  parserResultRepository: ParserResultRepository;
  processor?: () => Promise<void>;
  propertyListingRepository: PropertyListingRepository;
  rawMessageId: string;
};

export async function processRawMessage({
  messageRepository,
  parserResultRepository,
  processor = async () => undefined,
  propertyListingRepository,
  rawMessageId,
}: ProcessRawMessageDependencies) {
  try {
    await messageRepository.markProcessing(rawMessageId);
    await processor();

    const rawMessage = await messageRepository.findById(rawMessageId);

    if (!rawMessage) {
      throw new Error(`Raw message not found for processing: ${rawMessageId}`);
    }

    const parserResult = parseRealEstateMessage(rawMessage.text);
    const persistedParserResult = await parserResultRepository.createForMessage({
      rawMessageId,
      reason: parserResult.reason,
      status: parserResult.status,
    });

    if (parserResult.listing) {
      await propertyListingRepository.createFromParserResult({
        ...parserResult.listing,
        parserResultId: persistedParserResult.id,
        rawMessageId,
      });
    }

    await messageRepository.markProcessed(rawMessageId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown processing failure";

    await messageRepository.markFailed(rawMessageId, errorMessage);
    throw error;
  }
}
