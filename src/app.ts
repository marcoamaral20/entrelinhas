import Fastify from "fastify";

import type { MessageRepository } from "./messages/message.types";
import { registerMessageRoutes } from "./messages/message.routes";
import type { ProcessingQueue } from "./processing/processing.types";
import type { AppConfig } from "./shared/config";
import { loadConfig } from "./shared/config";

type BuildAppOptions = {
  config?: AppConfig;
  messageRepository?: MessageRepository;
  processingQueue?: ProcessingQueue;
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

  if (options.processingQueue?.close) {
    app.addHook("onClose", async () => {
      await options.processingQueue?.close?.();
    });
  }

  return app;
}
