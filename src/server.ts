import { buildApp } from "./app";
import { loadConfig } from "./shared/config";

async function start() {
  const config = loadConfig();
  const app = buildApp(config);

  try {
    await app.listen({
      host: config.host,
      port: config.port,
    });
  } catch (error) {
    app.log.error(error, "Failed to start Garimzap");
    process.exitCode = 1;
  }
}

void start();
