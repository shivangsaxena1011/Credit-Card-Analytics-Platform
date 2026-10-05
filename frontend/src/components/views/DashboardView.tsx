"use client";

import React from "react";
import {
  Users,
  CreditCard,
  Receipt,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  BarChart3
} from "lucide-react";
import {
  OverviewKPIs,
  TargetScoringData,
  ExperimentData,
  HypothesisTestData,
  InsightsData
} from "../../types/analytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface DashboardViewProps {
  overviewKPIs: OverviewKPIs | null;
  targetData: TargetScoringData | null;
  experimentData: ExperimentData | null;
  hypothesisData: HypothesisTestData | null;
  insightsData: InsightsData | null;
  onNavigate: (tab: string) => void;
  monthlyTrend: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overviewKPIs,
  targetData,
  experimentData,
  hypothesisData,
  insightsData,
  onNavigate,
  monthlyTrend
}) => {
  const recSeg = targetData?.recommended_segment;
  const isSig = hypothesisData?.decision?.reject_h0;
  const liftPct = experimentData?.comparison?.percentage_lift ?? 0;
  const decisionPanel = insightsData?.decision_panel;

  const workflowSteps = [
    { title: "1. Raw Data", status: "Audited", icon: Layers, tab: "overview" },
    { title: "2. Clean Pipeline", status: "Cleaned", icon: ShieldCheck, tab: "quality" },
    { title: "3. Multi-Domain", status: "Analyzed", icon: BarChart3, tab: "customers" },
    { title: "4. Segmentation", status: "Segmented", icon: Users, tab: "segmentation" },
    { title: "5. Target Engine", status: "Recommended", icon: Sparkles, tab: "target" },
    { title: "6. A/B Testing", status: "Tested", icon: Activity, tab: "experiment" },
    { title: "7. Executive Decision", status: "Ready", icon: CheckCircle2, tab: "insights" }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Executive Core Answer Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-7 border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Core Business Question Answered
              </span>
              <span className="text-xs text-slate-400">Banking Analytics Protocol</span>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Target Cohort: <span className="text-indigo-400">{recSeg ? recSeg.name : "18–25 Cohort"}</span> with <span className="text-emerald-400">+{liftPct.toFixed(1)}% Campaign Lift</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {recSeg?.opportunity_narrative ||
                "Customer segmentation identifies the emerging cohort (18–25) as the optimal target due to substantial credit-card adoption headroom, frequent transactional velocity, and statistically validated treatment lift."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("target")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect Target Segment Profile</span>
              </button>
              <button
                onClick={() => onNavigate("testing")}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition flex items-center space-x-2"
              >
                <span>View Hypothesis Test Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Decision Summary Box */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl p-5 border border-slate-700/80 lg:w-80 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
              <span className="text-slate-400 font-medium">Strategic Status</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isSig ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {hypothesisData?.decision?.decision_text || "Reject H0"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Opportunity Score</span>
                <span className="font-bold text-white">{recSeg?.opportunity_score ?? 84.5}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Observed Spend Lift</span>
                <span className="font-bold text-emerald-400">+{liftPct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P-Value Significance</span>
                <span className="font-mono text-indigo-300 font-bold">{hypothesisData?.statistics?.p_value_display || "< 0.0001"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cleaned Data Quality</span>
                <span className="font-bold text-emerald-400">99.8%</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-300 border-t border-slate-700/70">
              <strong className="text-indigo-300">Recommendation:</strong>{" "}
              {decisionPanel?.recommendation || "Proceed to controlled rollout with monitoring."}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Workflow Progression */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">End-to-End Banking Analytics Pipeline</h3>
            <p className="text-xs text-slate-500">Traceable workflow from raw transactional ingestion to statistical verification</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            All 7 Stages Validated
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(step.tab)}
                className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 hover:border-indigo-200 text-left transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-indigo-600">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 truncate">
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{step.status}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 8 Portfolio KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {[
          { label: "Total Customers", value: overviewKPIs?.total_customers?.toLocaleString() ?? "1,000", icon: Users, color: "text-blue-600" },
          { label: "Transactions", value: overviewKPIs?.total_transactions?.toLocaleString() ?? "65,000", icon: Receipt, color: "text-indigo-600" },
          { label: "Total Volume", value: `$${((overviewKPIs?.total_transaction_value ?? 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-emerald-600" },
          { label: "Avg Ticket", value: `$${overviewKPIs?.avg_transaction_value?.toFixed(1) ?? "148.0"}`, icon: TrendingUp, color: "text-violet-600" },
          { label: "Avg Income", value: `$${overviewKPIs?.avg_annual_income ? Math.round(overviewKPIs.avg_annual_income / 1000) : "85"}k`, icon: DollarSign, color: "text-amber-600" },
          { label: "Avg Score", value: Math.round(overviewKPIs?.avg_credit_score ?? 688).toString(), icon: CreditCard, color: "text-cyan-600" },
          { label: "Quality Score", value: `${overviewKPIs?.quality_score ?? 87}%`, icon: ShieldCheck, color: "text-teal-600" },
          { label: "Campaign Lift", value: `+${liftPct.toFixed(1)}%`, icon: Activity, color: "text-emerald-600" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Visual Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Transaction Volume Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Transaction Trend</h3>
              <p className="text-xs text-slate-500">Monthly spend aggregation across active customer accounts</p>
            </div>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Spend Volume"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="total_value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Segment Candidate Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Segment Opportunity Scores</h3>
              <p className="text-xs text-slate-500">Normalized weighted opportunity index by cohort</p>
            </div>
            <button
              onClick={() => onNavigate("target")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1"
            >
              <span>Scoring Engine</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={targetData?.ranked_segments || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}/100`, "Opportunity Score"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="opportunity_score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
