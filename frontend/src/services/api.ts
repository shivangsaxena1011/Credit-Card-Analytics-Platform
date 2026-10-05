import {
  FilterState,
  OverviewKPIs,
  DataQualityData,
  CleaningReport,
  CustomerAnalyticsData,
  CreditAnalyticsData,
  TransactionAnalyticsData,
  SegmentationData,
  TargetScoringData,
  ExperimentData,
  PowerAnalysisData,
  HypothesisTestData,
  InsightsData,
  AgeGroupConfig,
  PipelineStages
} from "../types/analytics";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend health check failed");
    return res.json();
  },

  async getPipelineStatus(): Promise<{ stages: PipelineStages; is_cleaned: boolean }> {
    const res = await fetch(`${BASE_URL}/api/pipeline-status`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch pipeline status");
    return res.json();
  },

  async resetData(seed: number = 42) {
    const res = await fetch(`${BASE_URL}/api/reset-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seed })
    });
    if (!res.ok) throw new Error("Failed to reset dataset");
    return res.json();
  },

  async cleanData(): Promise<CleaningReport> {
    const res = await fetch(`${BASE_URL}/api/clean`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to run cleaning pipeline");
    return res.json();
  },

  async getDataQuality(): Promise<DataQualityData> {
    const res = await fetch(`${BASE_URL}/api/data-quality`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to inspect data quality");
    return res.json();
  },

  async getOverview(filters: FilterState): Promise<{
    kpis: OverviewKPIs;
    customer_distributions: any;
    credit_distributions: any;
    transaction_distributions: any;
  }> {
    const res = await fetch(`${BASE_URL}/api/overview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error("Failed to fetch overview analytics");
    return res.json();
  },

  async getCustomerAnalytics(filters: FilterState): Promise<CustomerAnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error("Failed to fetch customer analytics");
    return res.json();
  },

  async getCreditAnalytics(filters: FilterState): Promise<CreditAnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error("Failed to fetch credit analytics");
    return res.json();
  },

  async getTransactionAnalytics(filters: FilterState): Promise<TransactionAnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error("Failed to fetch transaction analytics");
    return res.json();
  },

  async getSegments(ageGroups?: AgeGroupConfig[], filters?: FilterState): Promise<SegmentationData> {
    const res = await fetch(`${BASE_URL}/api/segments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age_groups: ageGroups, filters })
    });
    if (!res.ok) throw new Error("Failed to fetch segmentation data");
    return res.json();
  },

  async getTargetSegmentAnalysis(
    weights?: Record<string, number>,
    ageGroups?: AgeGroupConfig[],
    filters?: FilterState
  ): Promise<TargetScoringData> {
    const res = await fetch(`${BASE_URL}/api/target-segment-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights, age_groups: ageGroups, filters })
    });
    if (!res.ok) throw new Error("Failed to fetch target segment analysis");
    return res.json();
  },

  async getExperimentSummary(
    controlLabel: string = "Control",
    testLabel: string = "Test",
    metricName: string = "Average Transaction Value"
  ): Promise<ExperimentData> {
    const res = await fetch(`${BASE_URL}/api/experiment-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ control_label: controlLabel, test_label: testLabel, metric_name: metricName })
    });
    if (!res.ok) throw new Error("Failed to fetch experiment summary");
    return res.json();
  },

  async getPowerAnalysis(
    alpha: number = 0.05,
    power: number = 0.80,
    effectSize: number = 0.20,
    alternative: string = "larger"
  ): Promise<PowerAnalysisData> {
    const res = await fetch(`${BASE_URL}/api/power-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alpha, power, effect_size: effectSize, alternative })
    });
    if (!res.ok) throw new Error("Failed to calculate power analysis");
    return res.json();
  },

  async runHypothesisTest(
    testType: string = "z_test",
    alternative: string = "larger",
    alpha: number = 0.05,
    controlLabel: string = "Control",
    testLabel: string = "Test"
  ): Promise<HypothesisTestData> {
    const res = await fetch(`${BASE_URL}/api/hypothesis-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test_type: testType,
        alternative,
        alpha,
        control_label: controlLabel,
        test_label: testLabel
      })
    });
    if (!res.ok) throw new Error("Failed to execute hypothesis test");
    return res.json();
  },

  async getInsights(filters: FilterState): Promise<InsightsData> {
    const res = await fetch(`${BASE_URL}/api/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error("Failed to generate automated insights");
    return res.json();
  },

  async exportReport(): Promise<{ report: any; printable_html: string }> {
    const res = await fetch(`${BASE_URL}/api/export-report`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to generate report");
    return res.json();
  },

  async exploreData(
    tableName: string,
    page: number = 1,
    pageSize: number = 25,
    searchTerm: string = "",
    sortBy?: string,
    sortDirection: string = "asc"
  ) {
    const res = await fetch(`${BASE_URL}/api/data-explorer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_name: tableName,
        page,
        page_size: pageSize,
        search_term: searchTerm,
        sort_by: sortBy,
        sort_direction: sortDirection
      })
    });
    if (!res.ok) throw new Error("Failed to query data explorer");
    return res.json();
  },

  getCsvExportUrl(tableName: string): string {
    return `${BASE_URL}/api/export-csv/${tableName}`;
  }
};
