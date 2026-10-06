"use client";

import React from "react";
import {
  Receipt,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Layers,
  ArrowUpRight,
  Flame
} from "lucide-react";
import { TransactionAnalyticsData } from "../../types/analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from "recharts";

interface TransactionAnalyticsViewProps {
  data: TransactionAnalyticsData | null;
}

export const TransactionAnalyticsView: React.FC<TransactionAnalyticsViewProps> = ({ data }) => {
  const summary = data?.summary;
  const topCategories = data?.top_categories || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transaction Volume & Merchant Dynamics</h2>
        <p className="text-xs text-slate-500">Spend velocity, payment rails distribution, platform market shares, and cross-tabulations</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${((summary?.total_value ?? 0) / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Annual gross spend</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Ticket Size</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${summary?.avg_amount.toFixed(2) ?? "148.00"}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Mean per transaction</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Median Ticket</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${summary?.median_amount.toFixed(2) ?? "115.00"}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">50th percentile spend</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Transaction Count</span>
            <Receipt className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary?.total_count.toLocaleString() ?? "65,000"}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total settled orders</p>
        </div>
      </div>

      {/* Row 1: Monthly Spend Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Transaction Trend</h3>
        <p className="text-xs text-slate-500 mb-4">Tracking monthly transaction volume and ticket size stability</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthly_trend || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="txnMonthlyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Total Volume"]} />
              <Area type="monotone" dataKey="total_value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#txnMonthlyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Spend by Category & Platform */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value by Product Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Spend Value by Product Category</h3>
          <p className="text-xs text-slate-500 mb-4">Total gross volume generated per retail category</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.category_value || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 9.5, fill: "#64748b" }} width={120} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Spend Volume"]} />
                <Bar dataKey="total_value" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Platform */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Spend by Merchant Platform</h3>
          <p className="text-xs text-slate-500 mb-4">Market share distribution across leading e-commerce destinations</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.platform_amount || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Platform Volume"]} />
                <Bar dataKey="total_value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Spend by Age Group & Payment Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Age Group */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Transaction Value by Age Segment</h3>
          <p className="text-xs text-slate-500 mb-4">Total purchase volume originated by customer age demographic</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.age_group_value || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Spend Volume"]} />
                <Bar dataKey="total_value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Type Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Payment Rail Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Credit Card vs Debit Card vs UPI / Alternative Payments</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.payment_type_distribution || []} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="payment_type" angle={-15} textAnchor="end" tick={{ fontSize: 9.5, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Settled Volume"]} />
                <Bar dataKey="total_value" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Category x Payment Type Cross-Tab Heatmap */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Category × Payment Type Cross-Tabulation Matrix</h3>
          <p className="text-xs text-slate-500">Gross transaction dollars ($) cross-classified by product vertical and payment instrument</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3 text-left">Category</th>
                {(data?.payment_columns || []).map((col, idx) => (
                  <th key={idx} className="py-2.5 px-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {(data?.category_payment_matrix || []).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 text-left font-sans font-semibold text-slate-800">{row.category}</td>
                  {(data?.payment_columns || []).map((pCol, cIdx) => {
                    const amt = Number(row[pCol] || 0);
                    return (
                      <td key={cIdx} className="py-2 px-2.5 text-slate-700">
                        ${Math.round(amt).toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Top Categories Ranked Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">Top Product Categories Ranking</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Product Category</th>
                <th className="py-2.5 px-3 text-right">Total Spend ($)</th>
                <th className="py-2.5 px-3 text-right">Average Ticket ($)</th>
                <th className="py-2.5 px-3 text-right">Transaction Count</th>
                <th className="py-2.5 px-3 text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCategories.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-bold text-indigo-600">#{item.rank}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.category}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ${Math.round(item.total_value).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ${item.avg_amount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
                      {item.share_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
