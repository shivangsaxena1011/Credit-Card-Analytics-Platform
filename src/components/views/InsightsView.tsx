"use client";

import React from "react";
import {
  Lightbulb,
  Award,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Users,
  Receipt,
  Sparkles
} from "lucide-react";
import { InsightsData } from "../../types/analytics";

interface InsightsViewProps {
  data: InsightsData | null;
  onNavigateToReport: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  data,
  onNavigateToReport
}) => {
  const panel = data?.decision_panel;
  const insights = data?.insights || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Strategic Insights & Recommendations</h2>
          <p className="text-xs text-slate-500">Synthesized customer portfolio intelligence and cohort activation directives</p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <span>Export Summary Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Segment Decision Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-6">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Customer Cohort Strategic Decision Panel</h3>
        </div>

        {/* 5 Key Strategy Dimensions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Target Segment</span>
            <div className="text-lg font-extrabold text-slate-900 mt-1">{panel?.target_segment ?? "18–25"}</div>
            <p className="text-[11px] text-slate-500">Primary acquisition target</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Growth Opportunity</span>
            <div className="text-lg font-extrabold text-emerald-600 mt-1">High Upside</div>
            <p className="text-[11px] text-slate-500">Score 84.5/100</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Digital Adoption</span>
            <div className="text-lg font-extrabold text-indigo-600 mt-1">Leading</div>
            <p className="text-[11px] text-slate-500">High digital platform share</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Risk Profile</span>
            <div className="text-lg font-extrabold text-slate-900 mt-1">Prime Risk</div>
            <p className="text-[11px] text-slate-500">Controlled exposure</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Rollout Priority</span>
            <div className="text-sm font-extrabold text-emerald-600 mt-1">Tier-1 Priority</div>
            <p className="text-[11px] text-slate-500">Immediate product fit</p>
          </div>
        </div>

        {/* Formal Recommendation & Business Rationale */}
        <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-indigo-950 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Core Segment Strategy Recommendation</span>
          </div>
          <div className="text-base font-bold text-indigo-900">
            {panel?.recommendation || "Prioritize credit card acquisition and digital engagement campaigns targeted at the 18–25 young professional cohort."}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>Strategic Rationale:</strong> {panel?.business_rationale}
          </p>
        </div>

        {/* Strategic Risks & Execution Considerations */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Strategic Risks & Execution Considerations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(panel?.risks_and_caveats || []).map((risk, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                • {risk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Findings by Analytical Domain (Section 25 Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">Automated Domain Findings (Finding • Evidence • Business Meaning)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {insights.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-2 leading-snug">{item.finding}</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-slate-600">
                  <strong className="text-slate-800 text-[11px] block mb-0.5">Empirical Evidence:</strong>
                  {item.evidence}
                </div>
                <div className="p-2.5 bg-emerald-50/60 rounded border border-emerald-100 text-emerald-900">
                  <strong className="text-emerald-950 text-[11px] block mb-0.5">Commercial Implication:</strong>
                  {item.business_meaning}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
