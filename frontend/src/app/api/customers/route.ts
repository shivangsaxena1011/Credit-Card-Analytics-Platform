import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeCustomers } from "@/lib/analytics/customerAnalysis";

export async function POST(req: NextRequest) {
  const filters = await req.json().catch(() => ({}));
  return proxyToBackend("/api/customers", "POST", filters, async () => {
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);
    return analyzeCustomers(data.customers);
  });
}
