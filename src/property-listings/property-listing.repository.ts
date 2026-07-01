import { randomUUID } from "node:crypto";

import { and, asc, eq, gte, ilike, lte } from "drizzle-orm";

import type { Database } from "../shared/database/database";
import { propertyListings } from "../shared/database/schema";
import type {
  CreatePropertyListingInput,
  PropertyListing,
  PropertyListingFilters,
} from "./property-listing.types";

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

    async findById(id: string): Promise<PropertyListing | null> {
      const listing = await db.query.propertyListings.findFirst({
        where: eq(propertyListings.id, id),
      });

      return listing ? toPropertyListing(listing) : null;
    },

    async list(filters: PropertyListingFilters = {}): Promise<PropertyListing[]> {
      const where = buildListingFilters(filters);
      const listings = await db.query.propertyListings.findMany({
        orderBy: asc(propertyListings.createdAt),
        where,
      });

      return listings.map(toPropertyListing);
    },
  };
}

function buildListingFilters(filters: PropertyListingFilters) {
  const conditions = [];

  if (filters.city) {
    conditions.push(ilike(propertyListings.city, filters.city));
  }

  if (filters.neighborhood) {
    conditions.push(ilike(propertyListings.neighborhood, filters.neighborhood));
  }

  if (filters.propertyType) {
    conditions.push(eq(propertyListings.propertyType, filters.propertyType));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(propertyListings.priceAmount, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(propertyListings.priceAmount, filters.maxPrice));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
