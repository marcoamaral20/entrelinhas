import Fastify from "fastify";

import type { MessageRepository } from "./messages/message.types";
import { registerMessageRoutes } from "./messages/message.routes";
import type { ProcessingQueue } from "./processing/processing.types";
import { registerPropertyListingRoutes } from "./property-listings/property-listing.routes";
import type { PropertyListingRepository } from "./property-listings/property-listing.types";
import type { AppConfig } from "./shared/config";
import { loadConfig } from "./shared/config";
import { registerStatisticsRoutes } from "./statistics/statistics.routes";
import type { StatisticsRepository } from "./statistics/statistics.types";

type BuildAppOptions = {
  config?: AppConfig;
  messageRepository?: MessageRepository;
  processingQueue?: ProcessingQueue;
  propertyListingRepository?: PropertyListingRepository;
  statisticsRepository?: StatisticsRepository;
};

export function buildApp(options: BuildAppOptions = {}) {
  const config = options.config ?? loadConfig();
  const app = Fastify({
    logger: config.nodeEnv === "test" ? false : { level: config.logLevel },
  });

  app.get("/health", async () => ({
    environment: config.nodeEnv,
    status: "ok",
  }));

  if (options.messageRepository) {
    void registerMessageRoutes(app, {
      messageRepository: options.messageRepository,
      processingQueue: options.processingQueue,
    });
  }

  if (options.propertyListingRepository) {
    void registerPropertyListingRoutes(app, {
      propertyListingRepository: options.propertyListingRepository,
    });
  }

  if (options.statisticsRepository) {
    void registerStatisticsRoutes(app, {
      statisticsRepository: options.statisticsRepository,
    });
  }

  if (options.processingQueue?.close) {
    app.addHook("onClose", async () => {
      await options.processingQueue?.close?.();
    });
  }

  return app;
}
