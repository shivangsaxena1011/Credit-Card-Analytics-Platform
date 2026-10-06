"use client";

import React from "react";
import { Filter, RotateCcw, Menu, Smartphone, Monitor } from "lucide-react";
import { FilterState } from "../types/analytics";
import { DeviceType } from "../hooks/useDeviceDetection";

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  filters: FilterState;
  onOpenFilters: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onToggleMobileMenu?: () => void;
  deviceType?: DeviceType;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  pageSubtitle,
  filters,
  onOpenFilters,
  onRefresh,
  isLoading,
  onToggleMobileMenu,
  deviceType = "desktop"
}) => {
  // Count active non-default filters
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "use_raw") return false;
    if (v === "All" || v === "" || v === undefined || v === null) return false;
    return true;
  }).length;

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger Button & Title */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle Button (Visible only on mobile & tablet) */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer shrink-0"
          aria-label="Open mobile navigation menu"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Subtitle */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate flex items-center gap-1.5">
              <span className="truncate">{pageTitle}</span>
              {isLoading && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </h1>
            {/* Screen Device Detection Pill */}
            <span className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              {deviceType === "mobile" ? (
                <>
                  <Smartphone className="w-3 h-3 text-indigo-500" />
                  <span>Phone</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3 h-3 text-slate-500" />
                  <span className="capitalize">{deviceType}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate hidden sm:block">{pageSubtitle}</p>
        </div>
      </div>

      {/* Right Action Controls: Filter & Refresh Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Filters Trigger Button */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
            activeFilterCount > 0
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 shadow-xs"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          }`}
          title="Open Filters"
        >
          <Filter className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? "text-indigo-600" : "text-slate-500"}`} />
          <span className="hidden xs:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Quick Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Data"
          className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition disabled:opacity-50 cursor-pointer shrink-0"
          aria-label="Refresh Data"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
};
