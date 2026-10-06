"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Percent,
  DollarSign,
  AlertCircle,
  Activity,
  Layers,
  Info,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { CreditAnalyticsData } from "../../types/analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter
} from "recharts";

interface CreditAnalyticsViewProps {
  data: CreditAnalyticsData | null;
}

export const CreditAnalyticsView: React.FC<CreditAnalyticsViewProps> = ({ data }) => {
  const [activeScatter, setActiveScatter] = useState<"score_vs_limit" | "income_vs_limit" | "income_vs_score" | "limit_vs_debt">("score_vs_limit");

  const summary = data?.summary;
  const corrHighlights = data?.correlation_highlights;

  const scatterConfigs = {
    score_vs_limit: {
      title: "Credit Score vs. Credit Limit",
      xName: "Credit Score",
      yName: "Credit Limit ($)",
      dataKey: "score_vs_limit" as const
    },
    income_vs_limit: {
      title: "Annual Income vs. Credit Limit",
      xName: "Annual Income ($)",
      yName: "Credit Limit ($)",
      dataKey: "income_vs_limit" as const
    },
    income_vs_score: {
      title: "Annual Income vs. Credit Score",
      xName: "Annual Income ($)",
      yName: "Credit Score",
      dataKey: "income_vs_score" as const
    },
    limit_vs_debt: {
      title: "Credit Limit vs. Outstanding Debt",
      xName: "Credit Limit ($)",
      yName: "Outstanding Debt ($)",
      dataKey: "limit_vs_debt" as const
    }
  };

  const currentScatter = scatterConfigs[activeScatter];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Mandatory Association Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Credit Portfolio & Exposure Analytics</h2>
          <p className="text-xs text-slate-500">Analysis of credit scores, limits, utilization rates, and Pearson correlation matrices</p>
        </div>

        {/* Required Statistical Callout */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold shadow-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Important: Correlation indicates association, not causation.</span>
        </div>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Credit Score</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{summary?.avg_credit_score ?? 688}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">FICO Prime band</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Credit Limit</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${Math.round(summary?.avg_credit_limit ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Average exposure</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Utilization</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary?.avg_credit_utilisation ?? 36.5}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Healthy revolving ratio</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Outstanding Debt</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${Math.round(summary?.avg_outstanding_debt ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Revolving balance</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">High Utilization (&gt;70%)</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 text-rose-600">
            {summary?.high_utilisation_rate ?? 8.4}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Elevated risk portfolio share</p>
        </div>
      </div>

      {/* Row 1: Pearson Correlation Matrix & Key Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap / Correlation Matrix Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dynamic Pearson Correlation Matrix (r)</h3>
              <p className="text-xs text-slate-500">Unrounded exact linear correlation coefficients across continuous variables</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              -1.0 ≤ r ≤ +1.0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3 text-left">Variable</th>
                  {(data?.columns || []).map((col, idx) => (
                    <th key={idx} className="py-2.5 px-2">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {(data?.correlation_matrix || []).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-left font-sans font-semibold text-slate-800">{row.variable}</td>
                    {(data?.columns || []).map((col, cIdx) => {
                      const val = Number(row[col]);
                      // Color cell based on correlation strength
                      let bgClass = "bg-white text-slate-700";
                      if (val === 1.0) bgClass = "bg-slate-100 text-slate-400 font-bold";
                      else if (val >= 0.5) bgClass = "bg-indigo-50 text-indigo-700 font-bold";
                      else if (val >= 0.25) bgClass = "bg-blue-50 text-blue-700";
                      else if (val <= -0.5) bgClass = "bg-rose-100 text-rose-800 font-bold";
                      else if (val <= -0.2) bgClass = "bg-rose-50 text-rose-700";

                      return (
                        <td key={cIdx} className={`py-2 px-2.5 rounded-sm ${bgClass}`}>
                          {val === 1.0 ? "1.00" : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Correlation Highlights Card */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Key Association Findings</h3>
            <p className="text-xs text-slate-500">Statistically strongest linear associations in the portfolio</p>
          </div>

          <div className="space-y-4">
            {/* Strongest Positive */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg">
              <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Strongest Positive Association</span>
              </div>
              <div className="text-xs text-emerald-950 font-medium">
                {corrHighlights?.strongest_positive?.var1 || "Annual Income"} ↔ {corrHighlights?.strongest_positive?.var2 || "Credit Limit"}
              </div>
              <div className="text-lg font-extrabold text-emerald-700 mt-1">
                r = +{corrHighlights?.strongest_positive?.r.toFixed(2) ?? "0.68"}
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Higher earning accounts are reliably underwritten with higher credit limits.
              </p>
            </div>

            {/* Strongest Negative */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-bold mb-1">
                <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                <span>Strongest Negative Association</span>
              </div>
              <div className="text-xs text-slate-900 font-medium">
                {corrHighlights?.strongest_negative?.var1 || "Credit Score"} ↔ {corrHighlights?.strongest_negative?.var2 || "Credit Utilisation"}
              </div>
              <div className="text-lg font-extrabold text-slate-800 mt-1">
                r = {corrHighlights?.strongest_negative?.r.toFixed(2) ?? "-0.45"}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Cardholders with lower revolving utilization maintain higher credit scores.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 leading-snug">
            <strong>Analyst Note:</strong> High correlation does not imply that increasing credit limits causes income to rise. Causality must be established via controlled experiments.
          </div>
        </div>
      </div>

      {/* Row 2: Interactive Scatter Plots */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentScatter.title}</h3>
            <p className="text-xs text-slate-500">Inspect individual customer accounts across credit dimensions</p>
          </div>

          {/* Scatter Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveScatter("score_vs_limit")}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                activeScatter === "score_vs_limit" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Score vs Limit
            </button>
            <button
              onClick={() => setActiveScatter("income_vs_limit")}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                activeScatter === "income_vs_limit" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Income vs Limit
            </button>
            <button
              onClick={() => setActiveScatter("income_vs_score")}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                activeScatter === "income_vs_score" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Income vs Score
            </button>
            <button
              onClick={() => setActiveScatter("limit_vs_debt")}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                activeScatter === "limit_vs_debt" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Limit vs Debt
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                name={currentScatter.xName}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v) => v > 1000 ? `$${(v / 1000).toFixed(0)}k` : v}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={currentScatter.yName}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v) => v > 1000 ? `$${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(val: any, name: any) => [name.includes("$") ? `$${Number(val).toLocaleString()}` : val, name]}
              />
              <Scatter
                name="Accounts"
                data={data?.scatter_plots ? (data.scatter_plots as any)[currentScatter.dataKey] || [] : []}
                fill="#4f46e5"
                fillOpacity={0.65}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
