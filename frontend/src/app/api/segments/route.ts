import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { segmentCustomers } from "@/lib/analytics/segmentation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = getDataStore();
    const data = store.filterData(body.filters || {});
    const result = segmentCustomers(data.customers, data.credit_profiles, data.transactions, body.age_groups);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch segmentation data" }, { status: 500 });
  }
}
