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
  processingStatus: "accepted";
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
};
