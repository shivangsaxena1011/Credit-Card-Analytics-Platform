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
  InsightsData,
  AgeGroupConfig,
  PipelineStages
} from "../types/analytics";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function handleResponse<T = any>(res: Response, defaultError: string): Promise<T> {
  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    const msg =
      errJson?.error ||
      (typeof errJson?.detail === "string" ? errJson.detail : null) ||
      `${defaultError} (${res.status})`;
    throw new Error(msg);
  }
  const data = await res.json();
  return data as T;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/health`, { cache: "no-store" });
    return handleResponse(res, "Backend health check failed");
  },

  async getPipelineStatus(): Promise<{ stages: PipelineStages; is_cleaned: boolean }> {
    const res = await fetch(`${BASE_URL}/api/pipeline-status`, { cache: "no-store" });
    return handleResponse(res, "Failed to fetch pipeline status");
  },

  async resetData(seed: number = 42) {
    const res = await fetch(`${BASE_URL}/api/reset-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seed })
    });
    return handleResponse(res, "Failed to reset dataset");
  },

  async cleanData(): Promise<CleaningReport> {
    const res = await fetch(`${BASE_URL}/api/clean`, { method: "POST" });
    return handleResponse(res, "Failed to run cleaning pipeline");
  },

  async getDataQuality(): Promise<DataQualityData> {
    const res = await fetch(`${BASE_URL}/api/data-quality`, { cache: "no-store" });
    return handleResponse(res, "Failed to inspect data quality");
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
    return handleResponse(res, "Failed to fetch overview analytics");
  },

  async getCustomerAnalytics(filters: FilterState): Promise<CustomerAnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    return handleResponse(res, "Failed to fetch customer analytics");
  },

  async getCreditAnalytics(filters: FilterState): Promise<CreditAnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    return handleResponse(res, "Failed to fetch credit analytics");
  },

  async getTransactionAnalytics(filters: FilterState): Promise<TransactionAnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    return handleResponse(res, "Failed to fetch transaction analytics");
  },

  async getSegments(ageGroups?: AgeGroupConfig[], filters?: FilterState): Promise<SegmentationData> {
    const res = await fetch(`${BASE_URL}/api/segments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age_groups: ageGroups, filters })
    });
    return handleResponse(res, "Failed to fetch segmentation data");
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
    return handleResponse(res, "Failed to fetch target segment analysis");
  },

  async getInsights(filters: FilterState): Promise<InsightsData> {
    const res = await fetch(`${BASE_URL}/api/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    return handleResponse(res, "Failed to generate automated insights");
  },

  async exportReport(): Promise<{ report: any; printable_html: string }> {
    const res = await fetch(`${BASE_URL}/api/export-report`, {
      method: "POST"
    });
    return handleResponse(res, "Failed to generate report");
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
    return handleResponse(res, "Failed to query data explorer");
  },

  getCsvExportUrl(tableName: string): string {
    return `${BASE_URL}/api/export-csv/${tableName}`;
  }
};
