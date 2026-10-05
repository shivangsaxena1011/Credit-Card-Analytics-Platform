import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function POST() {
  return proxyToBackend("/api/clean", "POST", undefined, async () => {
    const store = getDataStore();
    return store.applyCleaning();
  });
}
