"use client";

import React, { useState } from "react";
import {
  Gauge,
  Sliders,
  Info,
  Layers,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { PowerAnalysisData } from "../../types/analytics";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";

interface PowerAnalysisViewProps {
  data: PowerAnalysisData | null;
  onUpdateParams: (alpha: number, power: number, effectSize: number, alt: string) => void;
  isLoading: boolean;
}

export const PowerAnalysisView: React.FC<PowerAnalysisViewProps> = ({
  data,
  onUpdateParams,
  isLoading
}) => {
  const [alpha, setAlpha] = useState<number>(data?.inputs?.alpha ?? 0.05);
  const [power, setPower] = useState<number>(data?.inputs?.power ?? 0.80);
  const [effectSize, setEffectSize] = useState<number>(data?.inputs?.effect_size ?? 0.20);
  const [alt, setAlt] = useState<string>(data?.inputs?.alternative ?? "larger");

  const handleApply = (newAlpha = alpha, newPower = power, newES = effectSize, newAlt = alt) => {
    onUpdateParams(newAlpha, newPower, newES, newAlt);
  };

  const reqPerGroup = data?.required_sample_per_group ?? 310;
  const totalReq = data?.total_required_sample ?? 620;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Statistical Power & Sample Size Architecture</h2>
        <p className="text-xs text-slate-500">
          Pre-experiment power sizing and sensitivity profiling to prevent Type II (false negative) decision errors
        </p>
      </div>

      {/* Main Required Sample Size KPI Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Optimal Pre-Experiment Sizing
            </span>
            <span className="text-xs text-slate-400 font-mono">Two-Sample Design</span>
          </div>
          <h3 className="text-3xl font-black text-white">
            Required Sample: <span className="text-indigo-400">{reqPerGroup.toLocaleString()}</span> Accounts / Group
          </h3>
          <p className="text-xs text-slate-300">
            Total Experiment Size: <strong className="text-white">{totalReq.toLocaleString()}</strong> across 2 balanced arms (1:1 Allocation)
          </p>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 max-w-md text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
            <Info className="w-3.5 h-3.5" />
            <span>Statistical Principle</span>
          </div>
          <p className="text-slate-300 italic">
            "{data?.interpretation || 'Smaller expected effects generally require larger samples to detect reliably.'}"
          </p>
        </div>
      </div>

      {/* Interactive Power Calculator Controls (Section 20 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Interactive Power Calculator Controls</span>
            </h3>
            <p className="text-xs text-slate-500">Tune statistical thresholds to dynamically recalculate sample adequacy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {/* Alpha Level */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Significance Level (α)</span>
              <span className="font-mono font-bold text-indigo-600">{alpha}</span>
            </div>
            <select
              value={alpha}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAlpha(val);
                handleApply(val, power, effectSize, alt);
              }}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
            >
              <option value={0.01}>α = 0.01 (99% Confidence)</option>
              <option value={0.05}>α = 0.05 (95% Confidence - Standard)</option>
              <option value={0.10}>α = 0.10 (90% Confidence)</option>
            </select>
            <p className="text-[10px] text-slate-500">Probability of Type I error (false positive)</p>
          </div>

          {/* Statistical Power */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Statistical Power (1 - β)</span>
              <span className="font-mono font-bold text-indigo-600">{Math.round(power * 100)}%</span>
            </div>
            <select
              value={power}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPower(val);
                handleApply(alpha, val, effectSize, alt);
              }}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
            >
              <option value={0.70}>0.70 (70% Power)</option>
              <option value={0.80}>0.80 (80% Power - Industry Standard)</option>
              <option value={0.90}>0.90 (90% High Precision)</option>
              <option value={0.95}>0.95 (95% Ultra Rigorous)</option>
            </select>
            <p className="text-[10px] text-slate-500">Probability of correctly rejecting false null</p>
          </div>

          {/* Expected Effect Size (Cohen's d) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Effect Size (Cohen's d)</span>
              <span className="font-mono font-bold text-indigo-600">{effectSize.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.08"
              max="1.0"
              step="0.02"
              value={effectSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEffectSize(val);
                handleApply(alpha, power, val, alt);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Standardized difference between group means</p>
          </div>

          {/* Hypothesis Direction */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Hypothesis Direction</span>
              <span className="font-mono font-bold text-indigo-600">{alt}</span>
            </div>
            <select
              value={alt}
              onChange={(e) => {
                const val = e.target.value;
                setAlt(val);
                handleApply(alpha, power, effectSize, val);
              }}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
            >
              <option value="larger">One-Sided Right (Test &gt; Ctrl)</option>
              <option value="two-sided">Two-Sided (Test ≠ Ctrl)</option>
              <option value="smaller">One-Sided Left (Test &lt; Ctrl)</option>
            </select>
            <p className="text-[10px] text-slate-500">Test tail distribution topology</p>
          </div>
        </div>
      </div>

      {/* Row 2: Sensitivity Grid & Effect Size vs Sample Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensitivity Table (Section 20 Requirement) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Effect-Size Sensitivity Table</h3>
            <p className="text-xs text-slate-500">Required group sizes across varying anticipated effect magnitudes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Effect Size (d)</th>
                  <th className="py-2.5 px-3">Magnitude Label</th>
                  <th className="py-2.5 px-3 text-right">Per Group (N)</th>
                  <th className="py-2.5 px-3 text-right">Total Sample</th>
                  <th className="py-2.5 px-3 text-center">Execution Feasibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {(data?.sensitivity_table || []).map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition ${
                      Math.abs(row.effect_size - effectSize) < 0.01 ? "bg-indigo-50/60 font-bold" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{row.effect_size.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800">{row.effect_label}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900">{row.required_sample_per_group.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{row.total_sample_required.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.feasibility === "Very High"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.feasibility === "High"
                          ? "bg-blue-100 text-blue-800"
                          : row.feasibility === "Moderate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {row.feasibility}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Effect Size vs Required Sample Size Curve (Section 20 Requirement) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Effect Size vs. Required Sample Curve</h3>
            <p className="text-xs text-slate-500 mb-4">Non-linear relationship: Sample requirement scales with 1 / d²</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.power_curve || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="powerCurveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="effect_size"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  label={{ value: "Effect Size (Cohen's d)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#475569" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => `${v.toLocaleString()}`}
                  label={{ value: "Sample Size / Arm", angle: -90, position: "insideLeft", fontSize: 11, fill: "#475569" }}
                />
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} Accounts`, "Required Sample"]} />
                <Area type="monotone" dataKey="required_sample" stroke="#4f46e5" strokeWidth={2.5} fill="url(#powerCurveGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 mt-2">
            <strong>Analyst Takeaway:</strong> Detecting a subtle 2% lift (d ≈ 0.10) demands over 1,200 accounts per arm, whereas a robust 8% lift (d ≈ 0.30) requires under 150 accounts per group.
          </div>
        </div>
      </div>
    </div>
  );
};
