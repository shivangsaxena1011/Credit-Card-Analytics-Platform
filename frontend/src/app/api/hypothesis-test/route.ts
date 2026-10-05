import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { runHypothesisTest } from "@/lib/analytics/hypothesisTesting";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/hypothesis-test", "POST", body, async () => {
    const store = getDataStore();
    const baseData = store.getActiveData();
    let expData = baseData.experiment;

    if (body.segment && body.segment !== "All") {
      const segExp = expData.filter((r) => (r as any).segment_name === body.segment);
      if (segExp.length > 0) {
        expData = segExp;
      }
    }

    const ctrlLabel = body.control_label || "Control";
    const testLabel = body.test_label || "Test";

    const ctrlVals = expData
      .filter((r) => r.group === ctrlLabel)
      .map((r) => Number(r.metric_value))
      .filter((v) => !isNaN(v));

    const testVals = expData
      .filter((r) => r.group === testLabel)
      .map((r) => Number(r.metric_value))
      .filter((v) => !isNaN(v));

    return runHypothesisTest(
      ctrlVals,
      testVals,
      body.test_type || "z_test",
      body.alternative || "larger",
      body.alpha !== undefined ? Number(body.alpha) : 0.05
    );
  });
}
