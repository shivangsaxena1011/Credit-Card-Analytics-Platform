import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const tbl = table.toLowerCase();
    const store = getDataStore();

    let rows: any[] = [];
    if (tbl === "customers") {
      rows = store.rawData.customers;
    } else if (tbl === "cleaned_customers") {
      rows = store.cleanedData.customers;
    } else if (tbl === "credit_profiles") {
      rows = store.rawData.credit_profiles;
    } else if (tbl === "cleaned_credit") {
      rows = store.cleanedData.credit_profiles;
    } else if (tbl === "transactions") {
      rows = store.rawData.transactions;
    } else if (tbl === "cleaned_transactions") {
      rows = store.cleanedData.transactions;
    } else if (tbl === "experiment") {
      rows = store.rawData.experiment;
    } else {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    if (!rows.length) {
      return new NextResponse("", {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`
        }
      });
    }

    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")];

    for (const r of rows) {
      const vals = headers.map(h => {
        const v = r[h];
        if (v === null || v === undefined) return "";
        if (typeof v === "string" && (v.includes(",") || v.includes("\"") || v.includes("\n"))) {
          return `"${v.replace(/"/g, '""')}"`;
        }
        return String(v);
      });
      lines.push(vals.join(","));
    }

    const csvContent = lines.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to export CSV" }, { status: 500 });
  }
}
