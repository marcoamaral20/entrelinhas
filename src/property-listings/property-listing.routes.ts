import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { PropertyListingRepository } from "./property-listing.types";

const listingQuerySchema = z
  .object({
    city: z.string().trim().min(1).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    neighborhood: z.string().trim().min(1).optional(),
    propertyType: z.enum(["apartment", "commercial", "house", "land"]).optional(),
  })
  .strict();

type PropertyListingRouteDependencies = {
  propertyListingRepository: PropertyListingRepository;
};

export async function registerPropertyListingRoutes(
  app: FastifyInstance,
  dependencies: PropertyListingRouteDependencies,
) {
  app.get("/property-listings", async (request, reply) => {
    const query = listingQuerySchema.safeParse(request.query);

    if (!query.success) {
      return reply.status(400).send({
        error: "invalid_query",
        message: "Property listing query parameters are invalid.",
      });
    }

    const propertyListings = await dependencies.propertyListingRepository.list(query.data);

    return { data: propertyListings };
  });

  app.get<{ Params: { id: string } }>("/property-listings/:id", async (request, reply) => {
    const propertyListing = await dependencies.propertyListingRepository.findById(
      request.params.id,
    );

    if (!propertyListing) {
      return reply.status(404).send({
        error: "not_found",
        message: "Property listing was not found.",
      });
    }

    return { data: propertyListing };
  });
}
