import type { ParserResultReason, ParserResultStatus } from "./real-estate-parser";

export type ParserResult = {
  createdAt: string;
  id: string;
  rawMessageId: string;
  reason: ParserResultReason | null;
  status: ParserResultStatus;
};

export type CreateParserResultInput = {
  rawMessageId: string;
  reason: ParserResultReason | null;
  status: ParserResultStatus;
};

export type ParserResultRepository = {
  createForMessage(input: CreateParserResultInput): Promise<ParserResult>;
};
