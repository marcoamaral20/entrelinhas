import type { PropertyListingIntent, PropertyListingType } from "../parser/real-estate-parser";

export type PropertyListing = {
  bedrooms: number | null;
  city: string | null;
  contactPhone: string | null;
  createdAt: string;
  id: string;
  intent: PropertyListingIntent;
  locationText: string;
  neighborhood: string | null;
  parserResultId: string;
  priceAmount: number;
  propertyType: PropertyListingType;
  rawMessageId: string;
  state: string | null;
};

export type CreatePropertyListingInput = Omit<PropertyListing, "createdAt" | "id">;

export type PropertyListingFilters = {
  city?: string;
  maxPrice?: number;
  minPrice?: number;
  neighborhood?: string;
  propertyType?: PropertyListingType;
};

export type PropertyListingRepository = {
  createFromParserResult(input: CreatePropertyListingInput): Promise<PropertyListing>;
  findById(id: string): Promise<PropertyListing | null>;
  list(filters?: PropertyListingFilters): Promise<PropertyListing[]>;
};
