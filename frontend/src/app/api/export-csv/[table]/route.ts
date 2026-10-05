import { NextRequest, NextResponse } from "next/server";
import { proxyCsvToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    return proxyCsvToBackend(table, () => {
      const store = getDataStore();
      const csv = store.toCsv(table);
      if (!csv) {
        throw new Error(`No data found for table: ${table}`);
      }
      return csv;
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to download CSV" }, { status: 500 });
  }
}
