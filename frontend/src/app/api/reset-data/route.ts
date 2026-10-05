import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/reset-data", "POST", body, async () => {
    const seed = Number(body.seed) || 42;
    const store = getDataStore();
    store.reset(seed);

    return {
      message: `Dataset successfully generated and reset with seed ${store.seed}`,
      seed: store.seed,
      is_cleaned: store.isCleaned,
      pipeline_stages: store.pipelineStages
    };
  });
}
