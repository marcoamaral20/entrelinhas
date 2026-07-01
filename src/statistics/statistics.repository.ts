import { count, eq } from "drizzle-orm";

import type { Database } from "../shared/database/database";
import { parserResults, propertyListings, rawMessages } from "../shared/database/schema";
import type { ProductStatistics } from "./statistics.types";

export function createPostgresStatisticsRepository(db: Database) {
  return {
    async getProductStatistics(): Promise<ProductStatistics> {
      const [
        totalReceivedMessages,
        totalProcessedMessages,
        totalPropertyListings,
        totalListingCreatedResults,
        totalUnstructuredMessages,
        totalRejectedMessages,
        totalMessagesCurrentlyProcessing,
      ] = await Promise.all([
        countRows(db.select({ count: count() }).from(rawMessages)),
        countRows(
          db
            .select({ count: count() })
            .from(rawMessages)
            .where(eq(rawMessages.processingStatus, "processed")),
        ),
        countRows(db.select({ count: count() }).from(propertyListings)),
        countRows(
          db
            .select({ count: count() })
            .from(parserResults)
            .where(eq(parserResults.status, "listing_created")),
        ),
        countRows(
          db
            .select({ count: count() })
            .from(parserResults)
            .where(eq(parserResults.status, "unstructured")),
        ),
        countRows(
          db
            .select({ count: count() })
            .from(parserResults)
            .where(eq(parserResults.status, "rejected")),
        ),
        countRows(
          db
            .select({ count: count() })
            .from(rawMessages)
            .where(eq(rawMessages.processingStatus, "processing")),
        ),
      ]);

      return {
        extractionSuccessRate: calculateSuccessRatePercentage(
          totalListingCreatedResults,
          totalProcessedMessages,
        ),
        totalMessagesCurrentlyProcessing,
        totalPropertyListings,
        totalReceivedMessages,
        totalRejectedMessages,
        totalUnstructuredMessages,
      };
    },
  };
}

async function countRows(query: Promise<Array<{ count: number }>>) {
  const [result] = await query;

  return result?.count ?? 0;
}

function calculateSuccessRatePercentage(
  listingCreatedCount: number,
  processedMessageCount: number,
) {
  if (processedMessageCount === 0) {
    return 0;
  }

  return Number(((listingCreatedCount / processedMessageCount) * 100).toFixed(4));
}
