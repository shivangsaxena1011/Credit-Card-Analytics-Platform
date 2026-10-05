"use client";

import React, { useState } from "react";
import {
  Settings,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Database,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Sliders
} from "lucide-react";
import { PipelineStages } from "../../types/analytics";

interface SettingsViewProps {
  pipelineStages: PipelineStages;
  onResetData: (seed: number) => void;
  onApplyClean: () => void;
  isLoading: boolean;
  isCleaned: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  pipelineStages,
  onResetData,
  onApplyClean,
  isLoading,
  isCleaned
}) => {
  const [seed, setSeed] = useState<number>(42);

  const handleReset = () => {
    onResetData(seed);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Settings & Simulation Control</h2>
        <p className="text-xs text-slate-500">Configure synthetic data generation seeds, re-initialize data pipelines, and verify system state</p>
      </div>

      {/* Demo Dataset Reset Card (Section 36 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Synthetic Data Simulation & Seed Control</h3>
            <p className="text-xs text-slate-500">Generate fresh synthetic portfolios with controlled distributions and controlled dirty data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-slate-800 block">Random Seed Number</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
            />
            <p className="text-[10px] text-slate-500">Seed ensures 100% reproducible statistical distributions</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Full Dataset Reset</span>
              <p className="text-[10px] text-slate-500 mt-1">Re-generates 1k customers, 1k credit profiles, 65k txns, and A/B test arm</p>
            </div>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>Regenerate Dataset (Seed: {seed})</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Cleaning Pipeline Trigger</span>
              <p className="text-[10px] text-slate-500 mt-1">Re-execute median imputation, deduplication, and IQR capping</p>
            </div>
            <button
              onClick={onApplyClean}
              disabled={isLoading}
              className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Apply Cleaning Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Stages Verification Panel (Section 28 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Pipeline Lifecycle Stage Architecture</h3>
        <p className="text-xs text-slate-500">Live operational status of banking analytics transformation stages</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[
            { stage: "RAW DATA", key: "RAW_DATA", desc: "1,000 customers & 65k txns generated" },
            { stage: "VALIDATED", key: "VALIDATED", desc: "Data quality audit calculated" },
            { stage: "CLEANED", key: "CLEANED", desc: "Deterministic imputation applied" },
            { stage: "ANALYZED", key: "ANALYZED", desc: "Multi-domain metrics aggregated" },
            { stage: "SEGMENTED", key: "SEGMENTED", desc: "Age cohorts clustered" },
            { stage: "EXP READY", key: "EXPERIMENT_READY", desc: "Control & Test partitioned" },
            { stage: "TESTED", key: "TESTED", desc: "Z/t statistical hypothesis solved" },
          ].map((item, idx) => {
            const isCompleted = (pipelineStages as any)[item.key] === "Completed";
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isCompleted ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.stage}</span>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-600" : "text-slate-400"}`} />
                  </div>
                  <div className="text-xs font-extrabold">{isCompleted ? "Completed" : "Pending"}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Technical Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">System Technical Stack & Environmental Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] font-sans">Backend Runtime</span>
            <div className="font-bold text-slate-900 mt-0.5">Python 3.14 + FastAPI</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] font-sans">Statistical Engine</span>
            <div className="font-bold text-slate-900 mt-0.5">SciPy 1.18 + Statsmodels</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] font-sans">Frontend Framework</span>
            <div className="font-bold text-slate-900 mt-0.5">Next.js 16 + React 19</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] font-sans">Data Persistence</span>
            <div className="font-bold text-slate-900 mt-0.5">In-Memory Store / CSV Export</div>
          </div>
        </div>
      </div>
    </div>
  );
};
