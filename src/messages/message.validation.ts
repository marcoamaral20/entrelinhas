import { z } from "zod";

export const incomingMessageSchema = z.object({
  externalMessageId: z.string().min(1),
  groupId: z.string().min(1),
  groupName: z.string().min(1),
  senderId: z.string().min(1),
  senderName: z.string().min(1),
  sentAt: z.string().datetime(),
  text: z.string().min(1),
});
