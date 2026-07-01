import type { FastifyInstance } from "fastify";

import type { StatisticsRepository } from "./statistics.types";

type StatisticsRouteDependencies = {
  statisticsRepository: StatisticsRepository;
};

export async function registerStatisticsRoutes(
  app: FastifyInstance,
  dependencies: StatisticsRouteDependencies,
) {
  app.get("/statistics", async () => {
    const statistics = await dependencies.statisticsRepository.getProductStatistics();

    return { data: statistics };
  });
}
