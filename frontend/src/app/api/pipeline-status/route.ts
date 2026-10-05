import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function GET() {
  return proxyToBackend("/api/pipeline-status", "GET", undefined, async () => {
    const store = getDataStore();
    return {
      stages: store.pipelineStages,
      is_cleaned: store.isCleaned
    };
  });
}
