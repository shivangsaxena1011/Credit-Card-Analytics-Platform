"use client";

import React from "react";
import {
  LayoutDashboard,
  Database,
  ShieldCheck,
  Users,
  CreditCard,
  Receipt,
  PieChart,
  FlaskConical,
  Gauge,
  Scale,
  Lightbulb,
  TableProperties,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ChevronRight,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCleaned: boolean;
  onApplyClean: () => void;
  isCleaning: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isCleaned,
  onApplyClean,
  isCleaning
}) => {
  const navSections: NavSection[] = [
    {
      title: "OVERVIEW & DATA",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "overview", label: "Data Overview", icon: Database },
        { id: "quality", label: "Data Quality & Cleaning", icon: ShieldCheck, badge: isCleaned ? "Clean" : "Dirty" },
        { id: "explorer", label: "Data Explorer", icon: TableProperties },
      ]
    },
    {
      title: "ANALYTICS DOMAINS",
      items: [
        { id: "customers", label: "Customer Analytics", icon: Users },
        { id: "credit", label: "Credit Analytics", icon: CreditCard },
        { id: "transactions", label: "Transaction Analytics", icon: Receipt },
      ]
    },
    {
      title: "SEGMENTATION & STRATEGY",
      items: [
        { id: "segmentation", label: "Age Segmentation", icon: PieChart },
        { id: "target", label: "Target Segment Engine", icon: Sparkles, highlight: true },
      ]
    },
    {
      title: "A/B TESTING & STATISTICS",
      items: [
        { id: "experiment", label: "Campaign Experiment", icon: FlaskConical },
        { id: "power", label: "Power & Sample Size", icon: Gauge },
        { id: "testing", label: "Hypothesis Testing", icon: Scale },
      ]
    },
    {
      title: "DECISIONS & EXPORTS",
      items: [
        { id: "insights", label: "Insights & Decisions", icon: Lightbulb },
        { id: "report", label: "Executive Report", icon: FileSpreadsheet },
        { id: "settings", label: "Settings & Demo", icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-white text-base tracking-tight">CreditIQ</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400">Enterprise Banking Intelligence</p>
        </div>
      </div>

      {/* Dataset Status Banner */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isCleaned ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"}`} />
          <span className="text-slate-300 font-medium">
            Dataset: <strong className={isCleaned ? "text-emerald-400" : "text-amber-400"}>{isCleaned ? "Cleaned" : "Raw Data"}</strong>
          </span>
        </div>
        {!isCleaned && (
          <button
            onClick={onApplyClean}
            disabled={isCleaning}
            className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            {isCleaning ? "Cleaning..." : "Clean"}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        item.badge === "Clean" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    )}
                    <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between bg-slate-950/40">
        <div>
          <p className="font-semibold text-slate-400">CreditIQ Engine</p>
          <p>Local Runtime • Fast Python Engine</p>
        </div>
        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
          v1.0.0
        </span>
      </div>
    </aside>
  );
};
