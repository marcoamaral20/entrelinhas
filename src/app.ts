import Fastify from "fastify";

import type { AppConfig } from "./shared/config";
import { loadConfig } from "./shared/config";

export function buildApp(config: AppConfig = loadConfig()) {
  const app = Fastify({
    logger: config.nodeEnv === "test" ? false : { level: config.logLevel },
  });

  app.get("/health", async () => ({
    environment: config.nodeEnv,
    status: "ok",
  }));

  return app;
}
