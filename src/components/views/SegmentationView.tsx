"use client";

import React, { useState } from "react";
import {
  PieChart as PieIcon,
  Users,
  Settings2,
  RefreshCw,
  TrendingUp,
  CreditCard,
  DollarSign,
  Percent,
  Check
} from "lucide-react";
import { SegmentationData, AgeGroupConfig } from "../../types/analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface SegmentationViewProps {
  data: SegmentationData | null;
  onUpdateAgeGroups: (groups: AgeGroupConfig[]) => void;
  isLoading: boolean;
}

export const SegmentationView: React.FC<SegmentationViewProps> = ({
  data,
  onUpdateAgeGroups,
  isLoading
}) => {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [customGroups, setCustomGroups] = useState<AgeGroupConfig[]>([
    { id: "seg_18_25", name: "18–25", min_age: 18, max_age: 25, label: "Young Adults / New-to-Credit" },
    { id: "seg_26_48", name: "26–48", min_age: 26, max_age: 48, label: "Prime Earning & Growth" },
    { id: "seg_49_65", name: "49–65+", min_age: 49, max_age: 80, label: "Mature & Established (49–65+)" }
  ]);

  const handleGroupChange = (idx: number, field: "min_age" | "max_age" | "name", value: any) => {
    const next = [...customGroups];
    next[idx] = {
      ...next[idx],
      [field]: field === "name" ? value : Number(value)
    };
    setCustomGroups(next);
  };

  const handleApplyConfig = () => {
    onUpdateAgeGroups(customGroups);
    setShowConfig(false);
  };

  const segments = data?.segments || [];
  const charts = data?.charts;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header with Config Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Cohort Segmentation</h2>
          <p className="text-xs text-slate-500">Demographic clustering and comparative financial behavior across customer age brackets</p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{showConfig ? "Hide Segment Boundaries" : "Configure Age Segments"}</span>
        </button>
      </div>

      {/* Configurable Age Boundaries Panel */}
      {showConfig && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Customize Age Segment Thresholds</h3>
              <p className="text-xs text-indigo-700">Define custom age boundaries for dynamic portfolio re-clustering</p>
            </div>
            <button
              onClick={handleApplyConfig}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Boundaries</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {customGroups.map((grp, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800">Segment #{idx + 1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Min Age</label>
                    <input
                      type="number"
                      value={grp.min_age}
                      onChange={(e) => handleGroupChange(idx, "min_age", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Max Age</label>
                    <input
                      type="number"
                      value={grp.max_age}
                      onChange={(e) => handleGroupChange(idx, "max_age", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Display Name</label>
                  <input
                    type="text"
                    value={grp.name}
                    onChange={(e) => handleGroupChange(idx, "name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Multi-Metric Comparison Table (Section 14 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Segment Comparative Financial Benchmark</h3>
            <p className="text-xs text-slate-500">All 11 required dimensions calculated dynamically per customer segment</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
            N = {data?.total_customers_segmented ?? 1000} Customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3">Segment Name</th>
                <th className="py-2.5 px-2 text-right">Customer Count</th>
                <th className="py-2.5 px-2 text-right">Share (%)</th>
                <th className="py-2.5 px-2 text-right">Avg Income ($)</th>
                <th className="py-2.5 px-2 text-right">Median Income ($)</th>
                <th className="py-2.5 px-2 text-right">Avg Credit Score</th>
                <th className="py-2.5 px-2 text-right">Avg Credit Limit ($)</th>
                <th className="py-2.5 px-2 text-right">Utilization (%)</th>
                <th className="py-2.5 px-2 text-right">Avg Debt ($)</th>
                <th className="py-2.5 px-2 text-right">Avg Ticket ($)</th>
                <th className="py-2.5 px-2 text-right">Credit Card Share (%)</th>
                <th className="py-2.5 px-3">Top Product Verticals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segments.map((seg, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition font-medium">
                  <td className="py-3 px-3">
                    <span className="font-bold text-indigo-700 text-sm">{seg.name}</span>
                    <div className="text-[10px] text-slate-500 font-normal">{seg.label}</div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{seg.customer_count}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">{seg.customer_percentage}%</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-900">${Math.round(seg.avg_income).toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">${Math.round(seg.median_income).toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{Math.round(seg.avg_credit_score)}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-900">${Math.round(seg.avg_credit_limit).toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono text-amber-700">{seg.avg_credit_utilisation}%</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">${Math.round(seg.avg_outstanding_debt).toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-900">${seg.avg_transaction_amount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-mono">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      seg.credit_card_payment_share < 35 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {seg.credit_card_payment_share}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {seg.top_product_categories.slice(0, 2).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Charts Across Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Income vs Credit Limit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 mb-1">Earning Power vs Credit Limit</h3>
          <p className="text-[11px] text-slate-500 mb-3">Comparing average income and underwriting limit</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.income_vs_limit || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="avg_income" name="Avg Income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_credit_limit" name="Avg Limit" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Credit Score vs Utilization */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 mb-1">Credit Score & Utilization</h3>
          <p className="text-[11px] text-slate-500 mb-3">Comparing credit quality and revolving leverage</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.credit_metrics || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={[0, 850]} />
                <Tooltip formatter={(v: any, name: any) => [name === "Util %" ? `${v}%` : v, name]} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="avg_credit_score" name="Credit Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Transaction Behavior & Card Share */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 mb-1">Card Usage Gap vs Ticket Size</h3>
          <p className="text-[11px] text-slate-500 mb-3">Credit Card share (%) vs Average purchase ($)</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.transaction_behavior || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                <Tooltip formatter={(v: any, name: any) => [name === "CC Share (%)" ? `${v}%` : `$${v}`, name]} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="cc_payment_share" name="CC Share (%)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_txn_amount" name="Avg Ticket ($)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
