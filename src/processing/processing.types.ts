export type RawMessageProcessingJob = {
  rawMessageId: string;
};

export type ProcessingQueue = {
  close?(): Promise<void>;
  enqueueRawMessage(rawMessageId: string): Promise<void>;
};
