import { describe, expect, it } from "vitest";

import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("returns safe development defaults when optional environment variables are omitted", () => {
    const config = loadConfig({});

    expect(config).toEqual({
      host: "0.0.0.0",
      logLevel: "info",
      nodeEnv: "development",
      port: 3000,
    });
  });

  it("parses explicit environment values", () => {
    const config = loadConfig({
      HOST: "127.0.0.1",
      LOG_LEVEL: "debug",
      NODE_ENV: "test",
      PORT: "4000",
    });

    expect(config).toEqual({
      host: "127.0.0.1",
      logLevel: "debug",
      nodeEnv: "test",
      port: 4000,
    });
  });

  it("rejects invalid port values", () => {
    expect(() => loadConfig({ PORT: "not-a-number" })).toThrow("Invalid environment");
  });
});
