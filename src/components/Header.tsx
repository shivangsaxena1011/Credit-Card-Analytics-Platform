"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { FilterState } from "../types/analytics";

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  filters: FilterState;
  onOpenFilters: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  pageSubtitle,
  filters,
  onOpenFilters,
  onRefresh,
  isLoading
}) => {
  // Count active non-default filters
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "use_raw") return false;
    if (v === "All" || v === "" || v === undefined || v === null) return false;
    return true;
  }).length;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Title & Context */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {pageTitle}
          {isLoading && (
            <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          )}
        </h1>
        <p className="text-xs text-slate-500">{pageSubtitle}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Global Filters Trigger Button */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
            activeFilterCount > 0
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 shadow-xs"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <Filter className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? "text-indigo-600" : "text-slate-500"}`} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Quick Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Data"
          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
};
