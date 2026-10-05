import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { segmentCustomers } from "@/lib/analytics/segmentation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/segments", "POST", body, async () => {
    const store = getDataStore();
    const data = store.filterData(body.filters || {});
    return segmentCustomers(
      data.customers,
      data.credit_profiles,
      data.transactions,
      body.age_groups
    );
  });
}
