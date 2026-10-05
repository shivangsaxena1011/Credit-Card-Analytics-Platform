import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function GET() {
  return proxyToBackend("/api/health", "GET", undefined, async () => {
    const store = getDataStore();
    const active = store.getActiveData();
    return {
      status: "healthy",
      app_name: "CreditIQ Analytics",
      version: "1.0.0",
      engine: "typescript-standalone",
      data_status: {
        is_cleaned: store.isCleaned,
        seed: store.seed,
        customer_count: active.customers.length,
        credit_profile_count: active.credit_profiles.length,
        transaction_count: active.transactions.length,
        experiment_count: active.experiment.length
      },
      pipeline_stages: store.pipelineStages
    };
  });
}
