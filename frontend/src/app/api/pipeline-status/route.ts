import { NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function GET() {
  const store = getDataStore();
  return NextResponse.json({
    stages: store.pipelineStages,
    is_cleaned: store.isCleaned
  });
}
