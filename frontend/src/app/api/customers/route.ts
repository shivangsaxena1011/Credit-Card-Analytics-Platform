import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeCustomers } from "@/lib/analytics/customerAnalysis";

export async function POST(req: NextRequest) {
  try {
    const filters = await req.json().catch(() => ({}));
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);
    const result = analyzeCustomers(data.customers);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch customer analytics" }, { status: 500 });
  }
}
