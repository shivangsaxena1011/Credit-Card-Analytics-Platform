"use client";

import React from "react";
import {
  Users,
  DollarSign,
  Briefcase,
  Calendar,
  MapPin,
  Heart,
  TrendingUp
} from "lucide-react";
import { CustomerAnalyticsData } from "../../types/analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface CustomerAnalyticsViewProps {
  data: CustomerAnalyticsData | null;
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

export const CustomerAnalyticsView: React.FC<CustomerAnalyticsViewProps> = ({ data }) => {
  const summary = data?.summary;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Demographics & Income Profiling</h2>
        <p className="text-xs text-slate-500">In-depth behavioral analysis of customer age cohorts, earning capacity, and employment patterns</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Median Income</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${Math.round(summary?.median_income ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">50th percentile baseline</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Income</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ${Math.round(summary?.avg_income ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Mean customer salary</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Youngest Valid</span>
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary?.youngest_age ?? 18} Years
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Minimum account holder</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Oldest Valid</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {summary?.oldest_age ?? 75} Years
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Maximum verified customer</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Top Occupation</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 truncate">
            {summary?.largest_occupation ?? "Consultant"}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Largest customer cohort</p>
        </div>
      </div>

      {/* Row 1: Age & Income Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Age Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Customer population count across age intervals</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.age_distribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="age_group" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip formatter={(v: any) => [`${v} Customers`, "Count"]} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Income Distribution Brackets</h3>
          <p className="text-xs text-slate-500 mb-4">Annual customer earnings brackets (USD)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.income_distribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="income_bracket" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip formatter={(v: any) => [`${v} Customers`, "Count"]} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Income by Occupation & Scatter Income vs Age */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Occupation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Median Income by Occupation</h3>
          <p className="text-xs text-slate-500 mb-4">Ranked median earnings across professional segments</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.income_by_occupation || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="occupation" tick={{ fontSize: 10, fill: "#64748b" }} width={110} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Median Income"]} />
                <Bar dataKey="median_income" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot: Income vs Age */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Income vs. Customer Age (Scatter)</h3>
          <p className="text-xs text-slate-500 mb-4">Visualizing the life-cycle earnings trajectory</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="age" name="Age" domain={[15, 80]} tick={{ fontSize: 10, fill: "#64748b" }} unit=" yrs" />
                <YAxis type="number" dataKey="income" name="Income" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(val: any, name: any) => [name === "Income" ? `$${Number(val).toLocaleString()}` : val, name]}
                />
                <Scatter name="Customers" data={data?.income_vs_age || []} fill="#4f46e5" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Location, Gender, Marital Cross-Distribution Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Geographic Distribution</span>
          </h4>
          <div className="space-y-2.5">
            {(data?.location_distribution || []).map((loc, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{loc.location}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{loc.count}</span>
                  <span className="text-[11px] text-slate-400">({loc.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-600" />
            <span>Gender Breakdown</span>
          </h4>
          <div className="space-y-2.5">
            {(data?.gender_distribution || []).map((g, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{g.gender}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{g.count}</span>
                  <span className="text-[11px] text-slate-400">({g.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marital Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Marital Status</span>
          </h4>
          <div className="space-y-2.5">
            {(data?.marital_distribution || []).map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{m.marital_status}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{m.count}</span>
                  <span className="text-[11px] text-slate-400">({m.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
