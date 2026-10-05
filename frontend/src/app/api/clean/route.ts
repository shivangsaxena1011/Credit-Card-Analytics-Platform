import { NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function POST() {
  try {
    const store = getDataStore();
    const report = store.applyCleaning();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run cleaning pipeline" }, { status: 500 });
  }
}
