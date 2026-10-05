import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeExperiment } from "@/lib/analytics/experiment";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/experiment-summary", "POST", body, async () => {
    const store = getDataStore();
    const data = store.filterData(body.filters || {});
    let expData = data.experiment;
    if (body.segment && body.segment !== "All") {
      const segExp = expData.filter((r) => (r as any).segment_name === body.segment);
      if (segExp.length > 0) {
        expData = segExp;
      }
    }
    return analyzeExperiment(
      expData,
      body.control_label || "Control",
      body.test_label || "Test",
      body.metric_name || "Average Transaction Value"
    );
  });
}
