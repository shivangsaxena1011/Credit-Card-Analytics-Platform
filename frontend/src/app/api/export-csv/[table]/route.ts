import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const tbl = table.toLowerCase();

    const response = await fetch(`${BACKEND_BASE_URL}/api/export-csv/${tbl}`);
    if (!response.ok) {
      return NextResponse.json({ error: `Backend error: ${response.statusText}` }, { status: response.status });
    }

    const csvData = await response.text();
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to download CSV" }, { status: 500 });
  }
}
