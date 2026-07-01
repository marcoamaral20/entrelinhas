import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const rawMessages = pgTable(
  "raw_messages",
  {
    externalMessageId: text("external_message_id").notNull(),
    groupId: text("group_id").notNull(),
    groupName: text("group_name").notNull(),
    id: uuid("id").primaryKey(),
    lastProcessingError: text("last_processing_error"),
    processedAt: timestamp("processed_at", { mode: "date", withTimezone: true }),
    processingFailedAt: timestamp("processing_failed_at", { mode: "date", withTimezone: true }),
    processingStartedAt: timestamp("processing_started_at", { mode: "date", withTimezone: true }),
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

export const parserResults = pgTable(
  "parser_results",
  {
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
    id: uuid("id").primaryKey(),
    rawMessageId: uuid("raw_message_id")
      .notNull()
      .references(() => rawMessages.id),
    reason: text("reason"),
    status: text("status").notNull(),
  },
  (table) => [uniqueIndex("parser_results_raw_message_unique").on(table.rawMessageId)],
);

export const propertyListings = pgTable(
  "property_listings",
  {
    bedrooms: integer("bedrooms"),
    city: text("city"),
    contactPhone: text("contact_phone"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
    id: uuid("id").primaryKey(),
    intent: text("intent").notNull(),
    locationText: text("location_text").notNull(),
    neighborhood: text("neighborhood"),
    parserResultId: uuid("parser_result_id")
      .notNull()
      .references(() => parserResults.id),
    priceAmount: integer("price_amount").notNull(),
    propertyType: text("property_type").notNull(),
    rawMessageId: uuid("raw_message_id")
      .notNull()
      .references(() => rawMessages.id),
    state: text("state"),
  },
  (table) => [uniqueIndex("property_listings_parser_result_unique").on(table.parserResultId)],
);
