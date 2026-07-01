import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const rawMessages = pgTable(
  "raw_messages",
  {
    externalMessageId: text("external_message_id").notNull(),
    groupId: text("group_id").notNull(),
    groupName: text("group_name").notNull(),
    id: uuid("id").primaryKey(),
    processingStatus: text("processing_status").notNull(),
    receivedAt: timestamp("received_at", { mode: "date", withTimezone: true }).notNull(),
    senderId: text("sender_id").notNull(),
    senderName: text("sender_name").notNull(),
    sentAt: timestamp("sent_at", { mode: "date", withTimezone: true }).notNull(),
    text: text("text").notNull(),
  },
  (table) => [
    uniqueIndex("raw_messages_external_group_unique").on(table.externalMessageId, table.groupId),
  ],
);
