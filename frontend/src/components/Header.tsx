"use client";

import React from "react";
import { Filter, RotateCcw, Sparkles, CheckCircle2, CircleDashed } from "lucide-react";
import { PipelineStages, FilterState } from "../types/analytics";

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  pipelineStages: PipelineStages;
  filters: FilterState;
  onOpenFilters: () => void;
  onLoadDemo: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  pageSubtitle,
  pipelineStages,
  filters,
  onOpenFilters,
  onLoadDemo,
  onRefresh,
  isLoading
}) => {
  // Count active non-default filters
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "use_raw") return false;
    if (v === "All" || v === "" || v === undefined || v === null) return false;
    return true;
  }).length;

  const stagesList = [
    { key: "RAW_DATA", label: "Raw Data" },
    { key: "VALIDATED", label: "Validated" },
    { key: "CLEANED", label: "Cleaned" },
    { key: "ANALYZED", label: "Analyzed" },
    { key: "SEGMENTED", label: "Segmented" },
    { key: "EXPERIMENT_READY", label: "Exp Ready" },
    { key: "TESTED", label: "Tested" }
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
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

      {/* Action Controls & Pipeline Status */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Pipeline Stage Indicators (Compact) */}
        <div className="hidden xl:flex items-center space-x-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
          <span className="text-slate-500 font-semibold uppercase text-[10px] mr-1">Pipeline:</span>
          {stagesList.map((stage, i) => {
            const isDone = (pipelineStages as any)[stage.key] === "Completed";
            return (
              <React.Fragment key={stage.key}>
                <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded font-medium ${
                  isDone ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <CircleDashed className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{stage.label}</span>
                </div>
                {i < stagesList.length - 1 && (
                  <span className="text-slate-300 font-bold">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Global Filters Trigger Button */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
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

        {/* Load Demo Dataset Button */}
        <button
          onClick={onLoadDemo}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/30 transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Demo Dataset</span>
        </button>

        {/* Quick Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Current View"
          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
};
