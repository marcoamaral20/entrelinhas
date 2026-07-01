export type ProductStatistics = {
  extractionSuccessRate: number;
  totalMessagesCurrentlyProcessing: number;
  totalPropertyListings: number;
  totalReceivedMessages: number;
  totalRejectedMessages: number;
  totalUnstructuredMessages: number;
};

export type StatisticsRepository = {
  getProductStatistics(): Promise<ProductStatistics>;
};
