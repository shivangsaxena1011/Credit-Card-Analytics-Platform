import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { segmentCustomers } from "@/lib/analytics/segmentation";
import { evaluateTargetSegments } from "@/lib/analytics/targetScoring";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/target-segment-analysis", "POST", body, async () => {
    const store = getDataStore();
    const data = store.filterData(body.filters || {});
    const segRes = segmentCustomers(data.customers, data.credit_profiles, data.transactions, body.age_groups);
    return evaluateTargetSegments(segRes.segments, body.weights);
  });
}
