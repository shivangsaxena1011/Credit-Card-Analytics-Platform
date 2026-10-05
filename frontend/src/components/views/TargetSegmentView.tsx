"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  RotateCcw
} from "lucide-react";
import { TargetScoringData, SegmentItem } from "../../types/analytics";

interface TargetSegmentViewProps {
  data: TargetScoringData | null;
  onUpdateWeights: (weights: Record<string, number>) => void;
  isLoading: boolean;
}

export const TargetSegmentView: React.FC<TargetSegmentViewProps> = ({
  data,
  onUpdateWeights,
  isLoading
}) => {
  const [weights, setWeights] = useState<Record<string, number>>({
    segment_size: 20,
    income_opportunity: 15,
    credit_opportunity: 20,
    transaction_activity: 20,
    card_usage_gap: 15,
    category_engagement: 10
  });

  const [expandedBreakdown, setExpandedBreakdown] = useState<boolean>(false);

  const recommended = data?.recommended_segment;
  const runnerUps = data?.runner_ups || [];

  const handleSliderChange = (key: string, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
  };

  const handleApplyWeights = () => {
    // Convert percentages to fractions
    const fractionWeights: Record<string, number> = {};
    for (const [k, v] of Object.entries(weights)) {
      fractionWeights[k] = v / 100.0;
    }
    onUpdateWeights(fractionWeights);
  };

  const handleResetWeights = () => {
    const defaultW = {
      segment_size: 20,
      income_opportunity: 15,
      credit_opportunity: 20,
      transaction_activity: 20,
      card_usage_gap: 15,
      category_engagement: 10
    };
    setWeights(defaultW);
    const fractionWeights: Record<string, number> = {};
    for (const [k, v] of Object.entries(defaultW)) {
      fractionWeights[k] = v / 100.0;
    }
    onUpdateWeights(fractionWeights);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Target Segment Recommendation Engine</h2>
        <p className="text-xs text-slate-500">Multi-criteria optimization model dynamically ranking candidate cohorts for card acquisition</p>
      </div>

      {/* Main Showcase: Recommended Segment Profile (Section 16 Requirement) */}
      {recommended && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-7 border border-indigo-700/50 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Top Recommended Target</span>
                </span>
                <span className="text-xs text-slate-400">Opportunity Score: {recommended.opportunity_score}/100</span>
              </div>

              <div>
                <h3 className="text-3xl font-black tracking-tight text-white flex items-baseline gap-3">
                  <span>Cohort: {recommended.name}</span>
                  <span className="text-base font-normal text-indigo-300">({recommended.label})</span>
                </h3>
              </div>

              {/* Dynamic Opportunity Narrative generated from actual metrics */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed space-y-2">
                <div className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">Opportunity Narrative (Data-Driven)</div>
                <p>{recommended.opportunity_narrative}</p>
                <div className="text-[11px] text-slate-400 italic">
                  <strong>Selection Rationale:</strong> {recommended.why_selected}
                </div>
              </div>
            </div>

            {/* Target Cohort Metrics Snapshot */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-xl p-5 border border-slate-700 lg:w-80 shrink-0 space-y-3.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-700 flex items-center justify-between">
                <span>Cohort Financial Profile</span>
                <span className="text-emerald-400 font-mono">Rank #1</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Share</span>
                  <span className="font-bold text-white">{recommended.customer_percentage}% ({recommended.customer_count} accounts)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Annual Income</span>
                  <span className="font-bold text-white">${Math.round(recommended.avg_income).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Credit Score</span>
                  <span className="font-bold text-white">{Math.round(recommended.avg_credit_score)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Credit Limit</span>
                  <span className="font-bold text-white">${Math.round(recommended.avg_credit_limit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credit Card Share</span>
                  <span className="font-bold text-amber-400">{recommended.credit_card_payment_share}% (Card Gap)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Ticket Size</span>
                  <span className="font-bold text-emerald-400">${recommended.avg_transaction_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-300">
                <span className="text-slate-400">Key Categories:</span>{" "}
                <span className="font-medium text-white">{recommended.top_product_categories.slice(0, 2).join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Weight Tuning Controls (Section 15 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Multi-Criteria Scoring Weight Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Adjust dimension weights to test sensitivity and evaluate alternate business strategic priorities
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
              totalWeight === 100 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              Total Weight: {totalWeight}%
            </span>
            <button
              onClick={handleResetWeights}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleApplyWeights}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              Re-Calculate Scores
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {[
            { key: "segment_size", label: "Segment Size Weight", desc: "Total customer count scale" },
            { key: "income_opportunity", label: "Income Opportunity Weight", desc: "Earning capacity and affordability" },
            { key: "credit_opportunity", label: "Credit Profile Opportunity", desc: "Healthy credit capacity for expansion" },
            { key: "transaction_activity", label: "Transaction Activity", desc: "Purchase frequency and velocity" },
            { key: "card_usage_gap", label: "Card Usage Gap Weight", desc: "Whitespace for credit-card conversion" },
            { key: "category_engagement", label: "Category Engagement", desc: "Relevance in high-yield merchant spend" },
          ].map((dim) => (
            <div key={dim.key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">{dim.label}</span>
                <span className="font-mono font-bold text-indigo-600">{weights[dim.key]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={weights[dim.key]}
                onChange={(e) => handleSliderChange(dim.key, Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Runner-Up Segments Comparison */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Ranked Candidate Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.ranked_segments || []).map((seg, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition shadow-xs flex flex-col justify-between ${
                idx === 0
                  ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    idx === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    Rank #{idx + 1}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">{seg.opportunity_score}/100</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-0.5">{seg.name} Cohort</h4>
                <p className="text-xs text-slate-500 mb-3">{seg.label}</p>
              </div>

              <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Count</span>
                  <span className="font-semibold text-slate-800">{seg.customer_count} ({seg.customer_percentage}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Income</span>
                  <span className="font-semibold text-slate-800">${Math.round(seg.avg_income).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Card Share</span>
                  <span className="font-semibold text-slate-800">{seg.credit_card_payment_share}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Spend Ticket</span>
                  <span className="font-semibold text-slate-800">${seg.avg_transaction_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable "How this score was calculated" Section (Section 15 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setExpandedBreakdown(!expandedBreakdown)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              How this Opportunity Score was Calculated (Mathematical Methodology)
            </span>
          </div>
          {expandedBreakdown ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedBreakdown && (
          <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Candidate segment scores are derived through multi-criteria decision analysis (MCDA).
              Each dimension metric is min-max normalized across candidates into standard utility values \([0.2, 1.0]\).
              Card usage gap is inverted so that lower current credit-card penetration awards a higher expansion score.
              The composite score is the weighted linear sum:
              <code className="block bg-slate-100 p-2 rounded text-[11px] font-mono text-indigo-700 mt-2">
                Score = 100 × ∑ (w_i × norm_i)
              </code>
            </p>

            {recommended?.scoring_breakdown && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                      <th className="py-2 px-3">Scoring Dimension</th>
                      <th className="py-2 px-3 text-right">Raw Metric</th>
                      <th className="py-2 px-3 text-right">Normalized (0-1)</th>
                      <th className="py-2 px-3 text-right">Weight (%)</th>
                      <th className="py-2 px-3 text-right">Points Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {Object.entries(recommended.scoring_breakdown).map(([dimKey, dimVal]) => (
                      <tr key={dimKey}>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800 capitalize">
                          {dimKey.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700">{dimVal.raw}</td>
                        <td className="py-2 px-3 text-right text-indigo-600 font-semibold">{dimVal.normalized}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{data?.weights && (data.weights as any)[dimKey] ? `${Math.round((data.weights as any)[dimKey] * 100)}%` : "20%"}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{dimVal.weighted} pts</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="py-2 px-3 font-sans text-slate-900">Total Composite Opportunity Score</td>
                      <td colSpan={3}></td>
                      <td className="py-2 px-3 text-right text-indigo-700">{recommended.opportunity_score} / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
