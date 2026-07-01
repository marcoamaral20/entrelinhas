import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import type { Database } from "../shared/database/database";
import { parserResults } from "../shared/database/schema";
import type { CreateParserResultInput, ParserResult } from "./parser-result.types";

function toParserResult(row: typeof parserResults.$inferSelect): ParserResult {
  return {
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    rawMessageId: row.rawMessageId,
    reason: row.reason as ParserResult["reason"],
    status: row.status as ParserResult["status"],
  };
}

export function createPostgresParserResultRepository(db: Database) {
  return {
    async createForMessage(input: CreateParserResultInput): Promise<ParserResult> {
      const [created] = await db
        .insert(parserResults)
        .values({
          createdAt: new Date(),
          id: randomUUID(),
          rawMessageId: input.rawMessageId,
          reason: input.reason,
          status: input.status,
        })
        .onConflictDoNothing({
          target: parserResults.rawMessageId,
        })
        .returning();

      if (created) {
        return toParserResult(created);
      }

      const existing = await db.query.parserResults.findFirst({
        where: eq(parserResults.rawMessageId, input.rawMessageId),
      });

      if (!existing) {
        throw new Error("Expected existing parser result after idempotent insert.");
      }

      return toParserResult(existing);
    },
  };
}
