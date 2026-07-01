import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import type { Database } from "../shared/database/database";
import { propertyListings } from "../shared/database/schema";
import type { CreatePropertyListingInput, PropertyListing } from "./property-listing.types";

function toPropertyListing(row: typeof propertyListings.$inferSelect): PropertyListing {
  return {
    bedrooms: row.bedrooms,
    city: row.city,
    contactPhone: row.contactPhone,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    intent: row.intent as PropertyListing["intent"],
    locationText: row.locationText,
    neighborhood: row.neighborhood,
    parserResultId: row.parserResultId,
    priceAmount: row.priceAmount,
    propertyType: row.propertyType as PropertyListing["propertyType"],
    rawMessageId: row.rawMessageId,
    state: row.state,
  };
}

export function createPostgresPropertyListingRepository(db: Database) {
  return {
    async createFromParserResult(input: CreatePropertyListingInput): Promise<PropertyListing> {
      const [created] = await db
        .insert(propertyListings)
        .values({
          ...input,
          createdAt: new Date(),
          id: randomUUID(),
        })
        .onConflictDoNothing({
          target: propertyListings.parserResultId,
        })
        .returning();

      if (created) {
        return toPropertyListing(created);
      }

      const existing = await db.query.propertyListings.findFirst({
        where: eq(propertyListings.parserResultId, input.parserResultId),
      });

      if (!existing) {
        throw new Error("Expected existing property listing after idempotent insert.");
      }

      return toPropertyListing(existing);
    },
  };
}
