export type IncomingMessagePayload = {
  externalMessageId: string;
  groupId: string;
  groupName: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  text: string;
};

export type RawMessage = IncomingMessagePayload & {
  id: string;
  lastProcessingError: string | null;
  processedAt: string | null;
  processingFailedAt: string | null;
  processingStartedAt: string | null;
  processingStatus: "accepted" | "processing" | "processed" | "failed";
  receivedAt: string;
};

export type CreateRawMessageResult = {
  created: boolean;
  message: RawMessage;
};

export type MessageRepository = {
  createAccepted(payload: IncomingMessagePayload): Promise<CreateRawMessageResult>;
  findById(id: string): Promise<RawMessage | null>;
  list(): Promise<RawMessage[]>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  markProcessed(id: string): Promise<void>;
  markProcessing(id: string): Promise<void>;
};
