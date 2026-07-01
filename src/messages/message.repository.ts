import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";

import type { Database } from "../shared/database/database";
import { rawMessages } from "../shared/database/schema";
import type { CreateRawMessageResult, IncomingMessagePayload, RawMessage } from "./message.types";

function toRawMessage(row: typeof rawMessages.$inferSelect): RawMessage {
  return {
    externalMessageId: row.externalMessageId,
    groupId: row.groupId,
    groupName: row.groupName,
    id: row.id,
    processingStatus: "accepted",
    receivedAt: row.receivedAt.toISOString(),
    senderId: row.senderId,
    senderName: row.senderName,
    sentAt: row.sentAt.toISOString(),
    text: row.text,
  };
}

export function createPostgresMessageRepository(db: Database) {
  return {
    async createAccepted(payload: IncomingMessagePayload): Promise<CreateRawMessageResult> {
      const [created] = await db
        .insert(rawMessages)
        .values({
          ...payload,
          id: randomUUID(),
          processingStatus: "accepted",
          receivedAt: new Date(),
          sentAt: new Date(payload.sentAt),
        })
        .onConflictDoNothing({
          target: [rawMessages.externalMessageId, rawMessages.groupId],
        })
        .returning();

      if (created) {
        return {
          created: true,
          message: toRawMessage(created),
        };
      }

      const existing = await db.query.rawMessages.findFirst({
        where: and(
          eq(rawMessages.externalMessageId, payload.externalMessageId),
          eq(rawMessages.groupId, payload.groupId),
        ),
      });

      if (!existing) {
        throw new Error("Expected existing raw message after idempotent insert.");
      }

      return {
        created: false,
        message: toRawMessage(existing),
      };
    },

    async findById(id: string): Promise<RawMessage | null> {
      const message = await db.query.rawMessages.findFirst({
        where: eq(rawMessages.id, id),
      });

      return message ? toRawMessage(message) : null;
    },

    async list(): Promise<RawMessage[]> {
      const messages = await db.query.rawMessages.findMany({
        orderBy: desc(rawMessages.receivedAt),
      });

      return messages.map(toRawMessage);
    },
  };
}
