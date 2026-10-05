import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeCredit } from "@/lib/analytics/creditAnalysis";

export async function POST(req: NextRequest) {
  const filters = await req.json().catch(() => ({}));
  return proxyToBackend("/api/credit", "POST", filters, async () => {
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);
    return analyzeCredit(data.credit_profiles, data.customers);
  });
}
