import { NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { inspectDataQuality } from "@/lib/analytics/dataQuality";

export async function GET() {
  try {
    const store = getDataStore();
    const result = inspectDataQuality(
      store.rawData.customers,
      store.rawData.credit_profiles,
      store.rawData.transactions
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to inspect data quality" }, { status: 500 });
  }
}
