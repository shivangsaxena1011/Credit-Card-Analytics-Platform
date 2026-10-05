import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeExperiment } from "@/lib/analytics/experiment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = getDataStore();
    const baseData = store.getActiveData();
    const result = analyzeExperiment(
      baseData.experiment,
      body.control_label || "Control",
      body.test_label || "Test",
      body.metric_name || "Average Transaction Value"
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch experiment summary" }, { status: 500 });
  }
}
