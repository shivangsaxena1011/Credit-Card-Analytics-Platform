import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeTransactions } from "@/lib/analytics/transactionAnalysis";

export async function POST(req: NextRequest) {
  const filters = await req.json().catch(() => ({}));
  return proxyToBackend("/api/transactions", "POST", filters, async () => {
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);
    return analyzeTransactions(data.transactions, data.customers);
  });
}
