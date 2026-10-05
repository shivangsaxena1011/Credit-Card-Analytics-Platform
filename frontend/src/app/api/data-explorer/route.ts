import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/data-explorer", "POST", body, async () => {
    const tableName = (body.table_name || "customers").toLowerCase();
    const page = Math.max(1, Number(body.page) || 1);
    const pageSize = Math.max(1, Math.min(200, Number(body.page_size) || 25));
    const searchTerm = (body.search_term || "").trim().toLowerCase();
    const sortBy = body.sort_by;
    const sortDirection = (body.sort_direction || "asc").toLowerCase();

    const store = getDataStore();
    let rows: any[] = [];

    if (tableName === "customers") {
      rows = store.rawData.customers;
    } else if (tableName === "cleaned_customers") {
      rows = store.cleanedData.customers;
    } else if (tableName === "credit_profiles") {
      rows = store.rawData.credit_profiles;
    } else if (tableName === "cleaned_credit") {
      rows = store.cleanedData.credit_profiles;
    } else if (tableName === "transactions") {
      rows = store.rawData.transactions;
    } else if (tableName === "cleaned_transactions") {
      rows = store.cleanedData.transactions;
    } else if (tableName === "experiment") {
      rows = store.rawData.experiment;
    } else {
      throw new Error(`Unknown table: ${tableName}`);
    }

    const totalRows = rows.length;
    let filtered = [...rows];

    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some(
          (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(searchTerm)
        )
      );
    }

    const filteredRows = filtered.length;

    if (sortBy) {
      filtered.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedData = filtered.slice(startIdx, endIdx);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      table_name: tableName,
      page,
      page_size: pageSize,
      total_rows: totalRows,
      filtered_rows: filteredRows,
      total_pages: Math.ceil(filteredRows / pageSize) || 1,
      columns,
      data: pagedData
    };
  });
}
