import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { runHypothesisTest } from "@/lib/analytics/hypothesisTesting";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = getDataStore();
    const baseData = store.getActiveData();
    const expData = baseData.experiment;

    const ctrlLabel = body.control_label || "Control";
    const testLabel = body.test_label || "Test";

    const ctrlVals = expData
      .filter(r => r.group === ctrlLabel)
      .map(r => Number(r.metric_value))
      .filter(v => !isNaN(v));

    const testVals = expData
      .filter(r => r.group === testLabel)
      .map(r => Number(r.metric_value))
      .filter(v => !isNaN(v));

    const result = runHypothesisTest(
      ctrlVals,
      testVals,
      body.test_type || "z_test",
      body.alternative || "larger",
      body.alpha !== undefined ? Number(body.alpha) : 0.05
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to execute hypothesis test" }, { status: 500 });
  }
}
