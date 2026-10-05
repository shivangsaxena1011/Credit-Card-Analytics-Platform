import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function POST() {
  return proxyToBackend("/api/clean", "POST", undefined, async () => {
    const store = getDataStore();
    const report = store.applyCleaning();
    return {
      ...report,
      engine: "typescript-standalone",
      fallback_used: true,
      notice: "Processed via Next.js TypeScript engine with dynamically verified quality scores"
    };
  });
}
