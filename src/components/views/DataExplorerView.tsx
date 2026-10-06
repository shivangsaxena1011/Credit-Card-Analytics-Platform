"use client";

import React, { useState, useEffect } from "react";
import {
  TableProperties,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { api } from "../../services/api";

export const DataExplorerView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>("customers");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [dataPayload, setDataPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const tableTabs = [
    { id: "customers", label: "Raw Customers" },
    { id: "cleaned_customers", label: "Cleaned Customers" },
    { id: "credit_profiles", label: "Raw Credit Profiles" },
    { id: "cleaned_credit", label: "Cleaned Credit Profiles" },
    { id: "transactions", label: "Raw Transactions" },
    { id: "cleaned_transactions", label: "Cleaned Transactions" },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.exploreData(
        selectedTable,
        page,
        pageSize,
        searchTerm,
        sortBy,
        sortDirection
      );
      setDataPayload(res);
    } catch (err: any) {
      console.error("Failed to fetch table data", err);
      setError(err.message || "Failed to query table data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable, page, pageSize, sortBy, sortDirection]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDirection("asc");
    }
  };

  const columns = dataPayload?.columns || [];
  const rows = dataPayload?.data || [];
  const totalRows = dataPayload?.total_rows ?? 0;
  const filteredRows = dataPayload?.filtered_rows ?? 0;
  const totalPages = dataPayload?.total_pages ?? 1;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Data Explorer</h2>
          <p className="text-xs text-slate-500">Inspect raw and transformed records, apply full-text searches, and download datasets</p>
        </div>

        <a
          href={api.getCsvExportUrl(selectedTable)}
          download
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export {selectedTable}.csv</span>
        </a>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl text-xs">
        {tableTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedTable(t.id);
              setPage(1);
              setSortBy(undefined);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedTable === t.id
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar & Counter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full sm:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${selectedTable}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
          <span>Total Records: <strong className="text-slate-800">{totalRows.toLocaleString()}</strong></span>
          <span>Filtered: <strong className="text-indigo-600">{filteredRows.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
                {columns.map((col: string, idx: number) => (
                  <th
                    key={idx}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading dataset records...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length || 1} className="py-12 text-center text-rose-500 font-sans">
                    <p className="font-semibold mb-2">{error}</p>
                    <button
                      onClick={fetchData}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-xs"
                    >
                      Retry Query
                    </button>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} className="py-12 text-center text-slate-400 font-sans">
                    No matching rows found in {selectedTable}
                  </td>
                </tr>
              ) : (
                rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition">
                    {columns.map((col: string, cIdx: number) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined;
                      return (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {isNull ? (
                            <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">NULL</span>
                          ) : typeof val === "number" ? (
                            col.includes("income") || col.includes("amount") || col.includes("limit") || col.includes("debt")
                              ? `$${Number(val).toLocaleString()}`
                              : val
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="p-1 rounded border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="p-1 rounded border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
