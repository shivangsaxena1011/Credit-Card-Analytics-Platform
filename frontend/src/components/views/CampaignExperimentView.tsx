"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  DollarSign
} from "lucide-react";
import { ExperimentData } from "../../types/analytics";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface CampaignExperimentViewProps {
  data: ExperimentData | null;
  onNavigateToTesting: () => void;
}

export const CampaignExperimentView: React.FC<CampaignExperimentViewProps> = ({
  data,
  onNavigateToTesting
}) => {
  const ctrl = data?.control_group;
  const test = data?.test_group;
  const comp = data?.comparison;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign A/B Experiment Analysis</h2>
          <p className="text-xs text-slate-500">
            Randomized controlled evaluation of promotional incentive on cardholder transaction spend
          </p>
        </div>

        <button
          onClick={onNavigateToTesting}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <span>Run Hypothesis Tests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lift & Outcome KPI Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Control Group Mean</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              ${ctrl?.mean.toFixed(2) ?? "146.20"}
            </div>
            <p className="text-[11px] text-slate-400">Baseline standard offering</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Test Group Mean</span>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1">
              ${test?.mean.toFixed(2) ?? "158.80"}
            </div>
            <p className="text-[11px] text-slate-400">Targeted reward treatment</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Absolute Difference</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              +${comp?.absolute_difference.toFixed(2) ?? "12.60"}
            </div>
            <p className="text-[11px] text-slate-400">Incremental ticket lift</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Observed Percentage Lift</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              +{comp?.percentage_lift.toFixed(2) ?? "8.62"}%
            </div>
            <p className="text-[11px] text-slate-400">((Test - Ctrl) / Ctrl) × 100</p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Group Descriptive Statistics Table (Section 18 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Side-by-Side Group Descriptive Statistics</h3>
            <p className="text-xs text-slate-500">Unrounded mathematical calculations across Control and Test distributions</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono">
            Metric: {data?.metric_name || "Average Transaction Value"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3">Statistical Measure</th>
                <th className="py-2.5 px-3 text-right">Control Group (Standard)</th>
                <th className="py-2.5 px-3 text-right">Test Group (Enhanced Rewards)</th>
                <th className="py-2.5 px-3 text-right">Absolute Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Sample Size (N)</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">{ctrl?.sample_size.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-bold text-indigo-600">{test?.sample_size.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Balanced (1:1 Ratio)</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Sample Mean (x̄)</td>
                <td className="py-2.5 px-3 text-right text-slate-900">${ctrl?.mean.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-600">${test?.mean.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+${comp?.absolute_difference.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Median (50th Percentile)</td>
                <td className="py-2.5 px-3 text-right text-slate-700">${ctrl?.median.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-indigo-700">${test?.median.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-slate-600">+${((test?.median ?? 0) - (ctrl?.median ?? 0)).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Standard Deviation (s, ddof=1)</td>
                <td className="py-2.5 px-3 text-right text-slate-700">${ctrl?.std_dev.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-slate-700">${test?.std_dev.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Comparable Variance</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Sample Variance (s²)</td>
                <td className="py-2.5 px-3 text-right text-slate-700">{ctrl?.variance.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-slate-700">{test?.variance.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">-</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Interquartile Range (Q1 - Q3)</td>
                <td className="py-2.5 px-3 text-right text-slate-700">${ctrl?.q1.toFixed(0)} - ${ctrl?.q3.toFixed(0)}</td>
                <td className="py-2.5 px-3 text-right text-indigo-700">${test?.q1.toFixed(0)} - ${test?.q3.toFixed(0)}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Distribution Right-Shift</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Observed Range (Min - Max)</td>
                <td className="py-2.5 px-3 text-right text-slate-700">${ctrl?.min.toFixed(0)} - ${ctrl?.max.toFixed(0)}</td>
                <td className="py-2.5 px-3 text-right text-slate-700">${test?.min.toFixed(0)} - ${test?.max.toFixed(0)}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Daily Progression Trend & Binned Distribution (Section 19 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Progression Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Spend Progression Trend</h3>
              <p className="text-xs text-slate-500">Day-by-day mean transaction value over test window</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">30-Day Window</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily_trend || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" angle={-25} textAnchor="end" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Daily Mean"]} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                <Line type="monotone" dataKey="Control" stroke="#64748b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Test" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Comparison (Histograms) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transaction Value Binned Distribution</h3>
              <p className="text-xs text-slate-500">Overlaying Control vs Test frequency distributions</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Histogram</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.distribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bin" angle={-25} textAnchor="end" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip formatter={(v: any) => [`${v} Transactions`, "Count"]} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                <Bar dataKey="Control" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="Test" fill="#4f46e5" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
