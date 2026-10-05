import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const seed = Number(body.seed) || 42;
    const store = getDataStore();
    store.reset(seed);

    return NextResponse.json({
      message: `Dataset successfully generated and reset with seed ${store.seed}`,
      seed: store.seed,
      is_cleaned: store.isCleaned,
      pipeline_stages: store.pipelineStages
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reset dataset" }, { status: 500 });
  }
}
