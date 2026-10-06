"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Info,
  Sliders,
  Activity,
  Award,
  Wallet,
  Compass,
  Gift,
  RefreshCw,
  Copy,
  ChevronDown
} from "lucide-react";
import {
  lookupBin,
  SAMPLE_BIN_PRESETS,
  computeCardHealthScore,
  computeLimitReadiness,
  generatePersonalizedRecommendations,
  CardBinInfo
} from "../../services/cardIntelligenceData";

export const CardIntelligenceView: React.FC = () => {
  // BIN Inspector state
  const [binInput, setBinInput] = useState<string>("437551");
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  // Financial inputs for utilization & health analysis
  const [creditLimit, setCreditLimit] = useState<number>(250000);
  const [currentBalance, setCurrentBalance] = useState<number>(55000);
  const [paymentHabit, setPaymentHabit] = useState<"always_full" | "min_due" | "occasional_late">("always_full");
  const [accountVintageMonths, setAccountVintageMonths] = useState<number>(18);
  const [isSpikySpend, setIsSpikySpend] = useState<boolean>(false);
  const [selectedRecCategory, setSelectedRecCategory] = useState<string>("All");

  // Dynamic BIN identification
  const cardInfo: CardBinInfo = useMemo(() => {
    return lookupBin(binInput);
  }, [binInput]);

  // Utilization calculations
  const utilizationPercent = useMemo(() => {
    if (creditLimit <= 0) return 0;
    return Math.min(100, Math.max(0, (currentBalance / creditLimit) * 100));
  }, [creditLimit, currentBalance]);

  const safeMonthlyLimit = useMemo(() => creditLimit * 0.3, [creditLimit]);
  const availableCredit = useMemo(() => Math.max(0, creditLimit - currentBalance), [creditLimit, currentBalance]);
  const amountToOptimal = useMemo(() => Math.max(0, currentBalance - safeMonthlyLimit), [currentBalance, safeMonthlyLimit]);

  // Card Health calculations
  const healthFactors = useMemo(() => {
    const ageYears = accountVintageMonths / 12;
    return computeCardHealthScore(utilizationPercent, paymentHabit, ageYears, isSpikySpend);
  }, [utilizationPercent, paymentHabit, accountVintageMonths, isSpikySpend]);

  // Limit Increase Readiness
  const readiness = useMemo(() => {
    return computeLimitReadiness(utilizationPercent, paymentHabit, accountVintageMonths, creditLimit);
  }, [utilizationPercent, paymentHabit, accountVintageMonths, creditLimit]);

  // Personalized Recommendations
  const allRecommendations = useMemo(() => {
    return generatePersonalizedRecommendations(cardInfo, utilizationPercent, creditLimit, currentBalance);
  }, [cardInfo, utilizationPercent, creditLimit, currentBalance]);

  const filteredRecommendations = useMemo(() => {
    if (selectedRecCategory === "All") return allRecommendations;
    return allRecommendations.filter((r) => r.category === selectedRecCategory);
  }, [allRecommendations, selectedRecCategory]);

  const handleBinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 8);
    setBinInput(rawVal);
  };

  const handleApplyPreset = (presetBin: string) => {
    setBinInput(presetBin);
  };

  const handleCopyCardInfo = () => {
    navigator.clipboard.writeText(`${cardInfo.issuer} ${cardInfo.cardName} (${cardInfo.network} - BIN: ${cardInfo.bin})`);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Format masked display: e.g. 4375 51•• •••• ••••
  const maskedCardNumber = useMemo(() => {
    const digits = binInput.padEnd(6, "•");
    const part1 = digits.slice(0, 4);
    const part2 = digits.slice(4, 6) + (digits.length > 6 ? digits.slice(6, 8) : "••");
    return `${part1} ${part2.padEnd(4, "•")} •••• ••••`;
  }, [binInput]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Customer-Only Strict Privacy & Security Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-emerald-300">Bank-Grade Privacy & Zero-Knowledge Architecture</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Customer Safe
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                We strictly <strong>NEVER</strong> request or store your CVV, Expiry Date, OTP, PIN, or full 16-digit card number. Only the <strong>first 6–8 digits (IIN / BIN)</strong> are inspected to recognize your card network, issuer bank, and rewards tier. All analytics run 100% locally in your secure session.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400/90 shrink-0 font-medium bg-emerald-950/60 px-3 py-2 rounded-lg border border-emerald-800/40">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Client-Side Isolated</span>
          </div>
        </div>
      </div>

      {/* 2. BIN Inspector & Interactive Virtual Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: BIN Input & Quick Selectors (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Card BIN Identification (6–8 Digits)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Enter the first 6 or 8 digits of your credit/debit card to decode issuing parameters.
              </p>
            </div>
            <button
              onClick={handleCopyCardInfo}
              className="text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedStatus ? "Copied!" : "Copy Details"}</span>
            </button>
          </div>

          {/* Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Card BIN (First 6–8 Digits Only)</span>
              <span className="text-[11px] font-normal text-emerald-600 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>No CVV or Expiry needed</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={binInput}
                onChange={handleBinChange}
                placeholder="e.g. 437551 or 524182"
                maxLength={8}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
              />
              <div className="absolute right-3.5 top-3.5 flex items-center space-x-2">
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {cardInfo.network}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Only enter digits (0-9). Example standard BIN formats: 6 digits (traditional) or 8 digits (ISO 2022+ standard).
            </p>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600">Quick Test Cards (Click to load):</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAMPLE_BIN_PRESETS.map((preset) => {
                const isSelected = binInput.startsWith(preset.bin);
                return (
                  <button
                    key={preset.bin}
                    onClick={() => handleApplyPreset(preset.bin)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{preset.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">{preset.bin}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">{preset.network}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Issuing Bank</span>
              <span className="font-semibold text-slate-900 mt-0.5 block truncate" title={cardInfo.issuer}>
                {cardInfo.issuer}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Rail</span>
              <span className="font-semibold text-indigo-600 mt-0.5 block">{cardInfo.network}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Card Type & Tier</span>
              <span className="font-semibold text-slate-900 mt-0.5 block truncate">{cardInfo.tier}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Country & Currency</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {cardInfo.country} ({cardInfo.currency})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Realistic Virtual Card Render (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-br ${cardInfo.themeGradient} text-white shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden group transition-all duration-300 transform hover:scale-[1.01]`}>
            {/* Glossy Overlay Highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            {/* Top Row: Issuer Bank & Contactless Symbol */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 block">
                  {cardInfo.issuer}
                </span>
                <span className="text-xs font-bold text-white tracking-tight">{cardInfo.tier}</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Contactless symbol */}
                <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/80">
                  <span className="text-[10px] font-bold">)))</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Gold Chip & Masked Digits */}
            <div className="relative z-10 space-y-3 my-auto">
              {/* EMV Chip Representation */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 shadow-inner flex flex-col justify-around p-1">
                <div className="w-full h-0.5 bg-amber-700/40 rounded-full" />
                <div className="w-full h-0.5 bg-amber-700/40 rounded-full" />
              </div>

              {/* Masked Card Number */}
              <div className="font-mono text-lg md:text-xl font-bold tracking-widest text-slate-100 drop-shadow-md">
                {maskedCardNumber}
              </div>
            </div>

            {/* Bottom Row: Cardholder Name, Valid Thru & Network Brand */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Cardholder</div>
                <div className="text-xs font-bold tracking-wider text-white">PRIORITY CARDMEMBER</div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm border border-white/20">
                  {cardInfo.network}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Highlights of this card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Domestic Airport Lounge:</span>
              <span className={`font-semibold ${cardInfo.loungeAccess ? "text-emerald-600" : "text-slate-600"}`}>
                {cardInfo.loungeAccess ? "✓ Complimentary Access" : "Not Included"}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Reward Structure:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[220px] truncate" title={cardInfo.rewardRate}>
                {cardInfo.rewardRate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Annual Fee & Waiver:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[220px] truncate" title={cardInfo.annualFeeEstimate}>
                {cardInfo.annualFeeEstimate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Credit Utilization Diagnostics Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Percent className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Credit Utilization & Safe Threshold Analysis</h3>
            </div>
            <p className="text-xs text-slate-500">
              Credit bureaus (CIBIL, Experian) recommend keeping credit utilization strictly below 30% to maximize your credit score.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                utilizationPercent <= 30
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : utilizationPercent <= 50
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {utilizationPercent <= 30
                ? "🟢 Optimal Zone (<30%)"
                : utilizationPercent <= 50
                ? "🟡 Moderate Caution (30–50%)"
                : "🔴 High Risk Zone (>50%)"}
            </span>
          </div>
        </div>

        {/* Input Sliders & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200/60">
          {/* Credit Limit Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Total Credit Limit ({cardInfo.currencySymbol})</span>
              <span className="text-indigo-600 font-mono text-sm">{cardInfo.currencySymbol}{creditLimit.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={1500000}
              step={10000}
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹20,000</span>
              <span>₹7,50,000</span>
              <span>₹15,00,000</span>
            </div>
          </div>

          {/* Current Balance Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Current Unbilled Spend / Balance ({cardInfo.currencySymbol})</span>
              <span className="text-indigo-600 font-mono text-sm">{cardInfo.currencySymbol}{currentBalance.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={creditLimit}
              step={2000}
              value={currentBalance}
              onChange={(e) => setCurrentBalance(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>50% Limit</span>
              <span>{cardInfo.currencySymbol}{creditLimit.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Visual Utilization Gauge / Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Current Utilization Rate: <strong className="text-sm font-bold text-slate-900">{utilizationPercent.toFixed(1)}%</strong>
            </span>
            <span className="text-slate-500">
              Available Credit: <strong>{cardInfo.currencySymbol}{availableCredit.toLocaleString("en-IN")}</strong>
            </span>
          </div>

          {/* Multi-zone Progress Bar */}
          <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            {/* Optimal 30% Zone Guide */}
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                utilizationPercent <= 30
                  ? "bg-emerald-500"
                  : utilizationPercent <= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>

          {/* Threshold markers */}
          <div className="relative w-full flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
            <span>0%</span>
            <span className="text-emerald-600 font-bold">▲ 30% (Golden Rule Cap: {cardInfo.currencySymbol}{safeMonthlyLimit.toLocaleString("en-IN")})</span>
            <span className="text-amber-600">▲ 50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Remediation Advice or Confirmation Box */}
        {amountToOptimal > 0 ? (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950">Actionable Bureau Recommendation:</span>
              <p>
                Your utilization is currently <strong>{utilizationPercent.toFixed(1)}%</strong>. To drop back into the optimal <strong>&lt; 30%</strong> green tier, make a mid-cycle payment of at least <strong>{cardInfo.currencySymbol}{Math.ceil(amountToOptimal).toLocaleString("en-IN")}</strong> before your upcoming billing cycle date.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-950">Stellar Credit Utilization Health:</span>
              <p>
                You are utilizing only <strong>{utilizationPercent.toFixed(1)}%</strong> of your credit limit (Safe ceiling: {cardInfo.currencySymbol}{safeMonthlyLimit.toLocaleString("en-IN")}). This behavior earns the highest creditworthiness score from credit reporting bureaus.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Card Health Score & Diagnostic Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Overall Health Score Gauge (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Activity className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Card Health Score</h3>
            </div>
            <p className="text-xs text-slate-500">
              Proprietary diagnostic score (0–1000) measuring risk, utilization discipline, and account health.
            </p>
          </div>

          {/* Central Score Circle Indicator */}
          <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`${
                    healthFactors.totalScore >= 800
                      ? "stroke-emerald-500"
                      : healthFactors.totalScore >= 700
                      ? "stroke-indigo-500"
                      : healthFactors.totalScore >= 600
                      ? "stroke-amber-500"
                      : "stroke-rose-500"
                  } transition-all duration-700`}
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * (healthFactors.totalScore / 1000))}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {healthFactors.totalScore}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  / 1000 pts
                </span>
              </div>
            </div>

            <div className="mt-4 text-center space-y-1">
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  healthFactors.totalScore >= 800
                    ? "bg-emerald-100 text-emerald-800"
                    : healthFactors.totalScore >= 700
                    ? "bg-indigo-100 text-indigo-800"
                    : healthFactors.totalScore >= 600
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {healthFactors.rating} Health
              </span>
              <p className="text-xs text-slate-600 px-4 mt-2 leading-relaxed">
                {healthFactors.summary}
              </p>
            </div>
          </div>

          {/* Interactive Customer Persona Adjusters */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">Interactive Customer Profile Toggles:</span>

            {/* Payment Habit Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Repayment Habit</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => setPaymentHabit("always_full")}
                  className={`p-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    paymentHabit === "always_full"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Pay Full (100%)
                </button>
                <button
                  onClick={() => setPaymentHabit("min_due")}
                  className={`p-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    paymentHabit === "min_due"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Minimum Due
                </button>
                <button
                  onClick={() => setPaymentHabit("occasional_late")}
                  className={`p-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    paymentHabit === "occasional_late"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Delayed / Past
                </button>
              </div>
            </div>

            {/* Account Vintage Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Account Vintage</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => setAccountVintageMonths(4)}
                  className={`p-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    accountVintageMonths < 6
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  &lt; 6 Months
                </button>
                <button
                  onClick={() => setAccountVintageMonths(18)}
                  className={`p-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    accountVintageMonths >= 6 && accountVintageMonths < 24
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  6–24 Months
                </button>
                <button
                  onClick={() => setAccountVintageMonths(36)}
                  className={`p-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    accountVintageMonths >= 24
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  2+ Years
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 5 Health Pillars Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Card Health Factor Breakdown</h3>
            <p className="text-xs text-slate-500">
              Detailed weighted evaluation of your card performance across five key underwriting pillars.
            </p>
          </div>

          <div className="space-y-4">
            {/* Pillar 1: Utilization Discipline */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>1. Utilization Discipline (Weight: 35%)</span>
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  {healthFactors.utilizationScore} / 350 pts
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(healthFactors.utilizationScore / 350) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Evaluates your spend against total credit line. Less than 20% earns maximum points.
              </p>
            </div>

            {/* Pillar 2: Payment Punctuality */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>2. Payment Punctuality & Full Clearances (Weight: 25%)</span>
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  {healthFactors.paymentHistoryScore} / 250 pts
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(healthFactors.paymentHistoryScore / 250) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Consistently paying 100% of Total Amount Due prevents interest accumulation and builds prime score.
              </p>
            </div>

            {/* Pillar 3: Credit Headroom */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>3. Credit Line Headroom & Safety Buffer (Weight: 15%)</span>
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  {healthFactors.creditHeadroomScore} / 150 pts
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(healthFactors.creditHeadroomScore / 150) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Sufficient headroom guarantees you can absorb emergency expenses without maxing out cards.
              </p>
            </div>

            {/* Pillar 4: Spend Stability & Account Age */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>4. Spend Stability & Account Vintage (Weight: 15%)</span>
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  {healthFactors.spendStabilityScore} / 150 pts
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(healthFactors.spendStabilityScore / 150) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Older accounts with predictable transaction patterns signal low delinquency risk.
              </p>
            </div>

            {/* Pillar 5: Fee & Reward Efficiency */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>5. Card Reward & Fee Efficiency (Weight: 10%)</span>
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  {healthFactors.feeRoiScore} / 100 pts
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(healthFactors.feeRoiScore / 100) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                You are effectively deriving higher cashback and reward value than the card&apos;s maintenance fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Limit Increase Readiness & Safe Spending Envelope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Limit Increase Readiness (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Limit Increase Readiness</h3>
              </div>
              <p className="text-xs text-slate-500">
                Bank underwriting readiness score for automatic or requested credit line enhancement.
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              {readiness.readinessPercentage}% Ready
            </span>
          </div>

          {/* Readiness Meter */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  readiness.readinessPercentage >= 75
                    ? "bg-emerald-500"
                    : readiness.readinessPercentage >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${readiness.readinessPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-slate-500">Readiness Status:</span>
              <span className={readiness.readinessPercentage >= 75 ? "text-emerald-700" : "text-amber-700"}>
                {readiness.status}
              </span>
            </div>
          </div>

          {/* Underwriting Criteria Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">Bank Underwriting Checklist:</span>
            {readiness.criteria.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                {item.status ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className={`font-semibold ${item.status ? "text-slate-800" : "text-slate-700"}`}>
                    {item.title}
                  </span>
                  <p className="text-[11px] text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation Action Note */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs space-y-1 text-indigo-900">
            <span className="font-bold flex items-center space-x-1.5 text-indigo-950">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recommended Customer Next Step:</span>
            </span>
            <p className="leading-relaxed">{readiness.recommendedAction}</p>
          </div>
        </div>

        {/* Safe Spending & Estimated Limit Range (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Wallet className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Safe Spending & Estimated Limit Range</h3>
            </div>
            <p className="text-xs text-slate-500">
              Optimal monthly budget allocation to avoid interest traps and maintain peak credit score.
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 block">
                Safe Monthly Spend (30%)
              </span>
              <span className="text-xl font-extrabold text-emerald-950 font-mono block">
                {cardInfo.currencySymbol}{Math.round(safeMonthlyLimit).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-emerald-700 block">
                Keeps you strictly within optimal credit score bracket
              </span>
            </div>

            <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-800 block">
                Safe Daily Spend Velocity
              </span>
              <span className="text-xl font-extrabold text-indigo-950 font-mono block">
                {cardInfo.currencySymbol}{Math.round(safeMonthlyLimit / 30).toLocaleString("en-IN")} / day
              </span>
              <span className="text-[10px] text-indigo-700 block">
                Smooth transaction pace prevents fraud alerts
              </span>
            </div>
          </div>

          {/* Estimated Limit Range for this Card Tier */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Card Tier Limit Benchmark ({cardInfo.tier})</span>
              <span className="text-[11px] text-slate-500">Standard Market Range</span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <span>{cardInfo.currencySymbol}1,50,000</span>
              <div className="flex-1 h-2 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-700 rounded-full" />
              <span>{cardInfo.currencySymbol}8,00,000+</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Based on your {cardInfo.issuer} {cardInfo.tier} tier, accounts typically qualify for limit scaling up to 3X to 4X their net monthly income once a 6-month clear repayment history is demonstrated.
            </p>
          </div>

          {/* Spending Risk Zones Reference */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-700 block">Monthly Spend Zones Guide:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-800 block">0% – 30%</span>
                <span className="text-[10px] text-emerald-700">Safe / Score Boost</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-800 block">30% – 50%</span>
                <span className="text-[10px] text-amber-700">Caution / Score Plateau</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                <span className="font-bold text-rose-800 block">&gt; 50%</span>
                <span className="text-[10px] text-rose-700">Danger / Score Drop</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. AI-Based Personalized Recommendations */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">AI-Powered Personalized Recommendations</h3>
            </div>
            <p className="text-xs text-slate-500">
              Smart tailored action items synthesized dynamically from your card network ({cardInfo.network}), tier, and utilization behavior.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {["All", "Credit Health", "Rewards", "Billing Cycle", "Smart Features"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedRecCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedRecCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 bg-gradient-to-b from-white to-slate-50/40"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {rec.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rec.impactColor}`}>
                    {rec.impactTag}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Card Intelligence Directive</span>
                <button className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer">
                  <span>{rec.actionText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
