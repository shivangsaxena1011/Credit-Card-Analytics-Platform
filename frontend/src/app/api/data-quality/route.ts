import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { inspectDataQuality } from "@/lib/analytics/dataQuality";

export async function GET() {
  return proxyToBackend("/api/data-quality", "GET", undefined, async () => {
    const store = getDataStore();
    return inspectDataQuality(
      store.rawData.customers,
      store.rawData.credit_profiles,
      store.rawData.transactions
    );
  });
}
