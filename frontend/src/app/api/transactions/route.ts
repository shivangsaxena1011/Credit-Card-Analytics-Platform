import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeTransactions } from "@/lib/analytics/transactionAnalysis";

export async function POST(req: NextRequest) {
  try {
    const filters = await req.json().catch(() => ({}));
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);
    const result = analyzeTransactions(data.transactions, data.customers);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch transaction analytics" }, { status: 500 });
  }
}
