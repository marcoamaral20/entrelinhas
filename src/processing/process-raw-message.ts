import type { MessageRepository } from "../messages/message.types";

type ProcessRawMessageDependencies = {
  messageRepository: Pick<MessageRepository, "markFailed" | "markProcessed" | "markProcessing">;
  processor?: () => Promise<void>;
  rawMessageId: string;
};

export async function processRawMessage({
  messageRepository,
  processor = async () => undefined,
  rawMessageId,
}: ProcessRawMessageDependencies) {
  try {
    await messageRepository.markProcessing(rawMessageId);
    await processor();
    await messageRepository.markProcessed(rawMessageId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown processing failure";

    await messageRepository.markFailed(rawMessageId, errorMessage);
    throw error;
  }
}
