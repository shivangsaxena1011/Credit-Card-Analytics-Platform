"use client";

import React from "react";
import {
  Users,
  CreditCard,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Copy,
  Bug,
  ShieldCheck,
  Building2,
  PieChart as PieIcon,
  Calendar
} from "lucide-react";
import { OverviewKPIs } from "../../types/analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

interface DataOverviewViewProps {
  kpis: OverviewKPIs | null;
  customerDistributions: any;
  creditDistributions: any;
  transactionDistributions: any;
  onOpenFilters: () => void;
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b", "#3b82f6"];

export const DataOverviewView: React.FC<DataOverviewViewProps> = ({
  kpis,
  customerDistributions,
  creditDistributions,
  transactionDistributions,
  onOpenFilters
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Filter Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio & Dataset Overview</h2>
          <p className="text-xs text-slate-500">Live distributions and aggregates across customers, credit profiles, and transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Visuals react dynamically to active filters</span>
          <button
            onClick={onOpenFilters}
            className="text-xs px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition"
          >
            Adjust Filters
          </button>
        </div>
      </div>

      {/* Primary KPI Cards (Top 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {[
          { label: "Total Customers", value: kpis?.total_customers?.toLocaleString() ?? "1,000", icon: Users, color: "text-blue-600" },
          { label: "Credit Profiles", value: kpis?.total_credit_profiles?.toLocaleString() ?? "1,000", icon: CreditCard, color: "text-indigo-600" },
          { label: "Transactions", value: kpis?.total_transactions?.toLocaleString() ?? "65,000", icon: Receipt, color: "text-violet-600" },
          { label: "Total Volume", value: `$${((kpis?.total_transaction_value ?? 0) / 1000000).toFixed(2)}M`, icon: DollarSign, color: "text-emerald-600" },
          { label: "Avg Ticket", value: `$${kpis?.avg_transaction_value?.toFixed(2) ?? "0.00"}`, icon: TrendingUp, color: "text-cyan-600" },
          { label: "Avg Income", value: `$${Math.round(kpis?.avg_annual_income ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-600" },
          { label: "Avg Credit Score", value: Math.round(kpis?.avg_credit_score ?? 0).toString(), icon: CreditCard, color: "text-emerald-600" },
          { label: "Avg Credit Limit", value: `$${Math.round(kpis?.avg_credit_limit ?? 0).toLocaleString()}`, icon: CreditCard, color: "text-blue-600" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">{card.label}</span>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight truncate">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Data Health & Quality Counters Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Quality Health Score</div>
            <div className="text-lg font-bold text-white">{kpis?.quality_score !== undefined ? `${kpis.quality_score.toFixed(1)}%` : "--"}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Missing Values Detected</div>
            <div className="text-lg font-bold text-amber-300">{kpis?.missing_values_detected?.toLocaleString() ?? "1,080"}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Duplicate Credit Records</div>
            <div className="text-lg font-bold text-blue-300">{kpis?.duplicate_records_detected ?? "6"}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Anomalies & Rule Violations</div>
            <div className="text-lg font-bold text-rose-300">{kpis?.anomalies_detected?.toLocaleString() ?? "364"}</div>
          </div>
        </div>
      </div>

      {/* 1. Customer Distributions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Customer Demographic Distributions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Age Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Age Distribution</div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerDistributions?.age || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="age_group" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: any) => [`${v} Customers`, "Count"]} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Gender Breakdown</div>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerDistributions?.gender || []}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {(customerDistributions?.gender || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v} Accounts`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 text-[11px] text-slate-600 mt-1">
              {(customerDistributions?.gender || []).map((g: any, i: number) => (
                <div key={i} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span>{g.gender}: <strong>{g.percentage}%</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Geographic Location</div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerDistributions?.location || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="location" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: any) => [`${v} Customers`, "Count"]} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupation Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Top Occupations</div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(customerDistributions?.occupation || []).slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="occupation" tick={{ fontSize: 9, fill: "#64748b" }} width={80} />
                  <Tooltip formatter={(v: any) => [`${v} Customers`, "Count"]} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Credit Distributions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Credit Profile Distributions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Credit Score Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Credit Score Tiers (FICO)</div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditDistributions?.score || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tier" tick={{ fontSize: 9, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: any) => [`${v} Profiles`, "Count"]} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Credit Utilization */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Credit Utilization Brackets</div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditDistributions?.utilisation || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: any) => [`${v} Accounts`, "Count"]} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Credit Limits */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Credit Limit Brackets</div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditDistributions?.limit || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: any) => [`${v} Accounts`, "Count"]} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Transaction Distributions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Receipt className="w-4 h-4 text-violet-600" />
          <span>Transaction Activity Distributions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Value */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Spend Value by Product Category</div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionDistributions?.category || []} margin={{ top: 5, right: 5, left: -10, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" angle={-35} textAnchor="end" tick={{ fontSize: 8.5, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Spend Volume"]} />
                  <Bar dataKey="total_value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Amount */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Merchant Platform Share</div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionDistributions?.platform || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="platform" tick={{ fontSize: 9, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Platform Spend"]} />
                  <Bar dataKey="total_value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2">Payment Method Share</div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionDistributions?.payment_type || []} margin={{ top: 5, right: 5, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="payment_type" angle={-25} textAnchor="end" tick={{ fontSize: 8.5, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Payment Volume"]} />
                  <Bar dataKey="total_value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
