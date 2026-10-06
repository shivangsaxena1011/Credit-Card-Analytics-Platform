export interface CardBinInfo {
  bin: string;
  issuer: string;
  network: "Visa" | "Mastercard" | "RuPay" | "American Express" | "Diners Club" | "Discover" | "Unknown";
  cardType: "Credit" | "Debit" | "Prepaid";
  tier: string;
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  cardName: string;
  themeGradient: string;
  accentColor: string;
  loungeAccess: boolean;
  rewardRate: string;
  annualFeeEstimate: string;
  forexMarkup: string;
}

export const SAMPLE_BIN_PRESETS = [
  { bin: "437551", label: "HDFC Regalia Gold", issuer: "HDFC Bank", network: "Visa Signature", color: "from-blue-900 via-indigo-900 to-slate-900" },
  { bin: "524182", label: "SBI SimplyCLICK", issuer: "SBI Card", network: "Mastercard Titanium", color: "from-slate-900 via-sky-950 to-slate-900" },
  { bin: "608123", label: "ICICI Coral RuPay", issuer: "ICICI Bank", network: "RuPay Platinum", color: "from-orange-950 via-rose-950 to-slate-900" },
  { bin: "462054", label: "Axis Atlas", issuer: "Axis Bank", network: "Visa Infinite", color: "from-purple-950 via-indigo-950 to-slate-900" },
  { bin: "378282", label: "Amex Platinum", issuer: "American Express", network: "Amex Centurion/Charge", color: "from-zinc-800 via-slate-700 to-zinc-900" },
  { bin: "414720", label: "Chase Sapphire", issuer: "Chase (JPMorgan)", network: "Visa Signature", color: "from-blue-950 via-slate-900 to-sky-950" }
];

export const KNOWN_BIN_DATABASE: Record<string, Partial<CardBinInfo>> = {
  // HDFC Bank
  "437551": {
    bin: "437551",
    issuer: "HDFC Bank",
    network: "Visa",
    cardType: "Credit",
    tier: "Signature (Regalia Gold)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "HDFC Regalia Gold Credit Card",
    themeGradient: "from-blue-900 via-indigo-900 to-slate-900",
    accentColor: "#3b82f6",
    loungeAccess: true,
    rewardRate: "4 Points per ₹150 (up to 5X on SmartBuy)",
    annualFeeEstimate: "₹2,500 + GST (Waived on ₹4L spend)",
    forexMarkup: "2.0%"
  },
  "416644": {
    bin: "416644",
    issuer: "HDFC Bank",
    network: "Visa",
    cardType: "Credit",
    tier: "Infinite (Infinia Metal)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "HDFC Infinia Metal Credit Card",
    themeGradient: "from-zinc-900 via-slate-800 to-black",
    accentColor: "#f59e0b",
    loungeAccess: true,
    rewardRate: "3.3% Base (up to 33% on SmartBuy flights & hotels)",
    annualFeeEstimate: "₹12,500 + GST (Waived on ₹10L spend)",
    forexMarkup: "2.0%"
  },
  "540182": {
    bin: "540182",
    issuer: "HDFC Bank",
    network: "Mastercard",
    cardType: "Credit",
    tier: "World (Millennia)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "HDFC Millennia Credit Card",
    themeGradient: "from-indigo-900 via-purple-900 to-slate-900",
    accentColor: "#8b5cf6",
    loungeAccess: true,
    rewardRate: "5% Cashback on Amazon/Flipkart/Swiggy/Zomato",
    annualFeeEstimate: "₹1,000 + GST (Waived on ₹1L spend)",
    forexMarkup: "3.5%"
  },
  "652150": {
    bin: "652150",
    issuer: "HDFC Bank",
    network: "RuPay",
    cardType: "Credit",
    tier: "Platinum (Tata Neu Infinity)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "Tata Neu Infinity HDFC Bank RuPay Card",
    themeGradient: "from-violet-950 via-purple-900 to-slate-900",
    accentColor: "#a855f7",
    loungeAccess: true,
    rewardRate: "10% NeuCoins on Tata Neu Brands + 1.5% UPI",
    annualFeeEstimate: "₹1,499 + GST (Waived on ₹3L spend)",
    forexMarkup: "2.0%"
  },

  // SBI Card
  "524182": {
    bin: "524182",
    issuer: "State Bank of India (SBI Card)",
    network: "Mastercard",
    cardType: "Credit",
    tier: "Titanium (SimplyCLICK)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "SBI SimplyCLICK Credit Card",
    themeGradient: "from-sky-950 via-blue-900 to-slate-900",
    accentColor: "#0284c7",
    loungeAccess: false,
    rewardRate: "10X Reward Points on partner online merchants",
    annualFeeEstimate: "₹499 + GST (Waived on ₹1L spend)",
    forexMarkup: "3.5%"
  },
  "472642": {
    bin: "472642",
    issuer: "State Bank of India (SBI Card)",
    network: "Visa",
    cardType: "Credit",
    tier: "Signature (SBI Card ELITE)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "SBI Card ELITE",
    themeGradient: "from-slate-900 via-amber-950 to-slate-900",
    accentColor: "#d97706",
    loungeAccess: true,
    rewardRate: "5X points on Dining, Departmental stores & Grocery",
    annualFeeEstimate: "₹4,999 + GST (Welcome e-gift voucher ₹5,000)",
    forexMarkup: "1.99%"
  },
  "608119": {
    bin: "608119",
    issuer: "State Bank of India (SBI Card)",
    network: "RuPay",
    cardType: "Credit",
    tier: "Platinum (BPCL Octane)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "BPCL SBI Card Octane RuPay",
    themeGradient: "from-emerald-950 via-teal-950 to-slate-900",
    accentColor: "#10b981",
    loungeAccess: true,
    rewardRate: "7.25% Value back on BPCL fuel purchases",
    annualFeeEstimate: "₹1,499 + GST",
    forexMarkup: "3.5%"
  },

  // ICICI Bank
  "608123": {
    bin: "608123",
    issuer: "ICICI Bank",
    network: "RuPay",
    cardType: "Credit",
    tier: "Platinum (Coral RuPay)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "ICICI Coral RuPay Credit Card",
    themeGradient: "from-orange-950 via-rose-950 to-slate-900",
    accentColor: "#f97316",
    loungeAccess: true,
    rewardRate: "2 Reward Points per ₹100 spent (UPI compatible)",
    annualFeeEstimate: "₹500 + GST (Waived on ₹1.5L spend)",
    forexMarkup: "3.5%"
  },
  "401662": {
    bin: "401662",
    issuer: "ICICI Bank",
    network: "Visa",
    cardType: "Credit",
    tier: "Platinum (Amazon Pay ICICI)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "Amazon Pay ICICI Bank Credit Card",
    themeGradient: "from-amber-950 via-slate-900 to-slate-950",
    accentColor: "#f59e0b",
    loungeAccess: false,
    rewardRate: "5% Unlimited Cashback for Prime Members on Amazon",
    annualFeeEstimate: "Lifetime Free (₹0)",
    forexMarkup: "3.5%"
  },
  "431581": {
    bin: "431581",
    issuer: "ICICI Bank",
    network: "Visa",
    cardType: "Credit",
    tier: "Signature (Sapphiro)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "ICICI Bank Sapphiro Credit Card",
    themeGradient: "from-blue-950 via-indigo-950 to-slate-900",
    accentColor: "#38bdf8",
    loungeAccess: true,
    rewardRate: "4 Points per ₹100 on International, Buy 1 Get 1 BookMyShow",
    annualFeeEstimate: "₹3,500 + GST",
    forexMarkup: "3.5%"
  },

  // Axis Bank
  "462054": {
    bin: "462054",
    issuer: "Axis Bank",
    network: "Visa",
    cardType: "Credit",
    tier: "Infinite (Axis Atlas)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "Axis Bank Atlas Credit Card",
    themeGradient: "from-purple-950 via-slate-900 to-indigo-950",
    accentColor: "#c084fc",
    loungeAccess: true,
    rewardRate: "5 EDGE Miles per ₹100 on Airlines & Travel",
    annualFeeEstimate: "₹5,000 + GST",
    forexMarkup: "3.5%"
  },
  "539983": {
    bin: "539983",
    issuer: "Axis Bank",
    network: "Mastercard",
    cardType: "Credit",
    tier: "World (Flipkart Axis)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "Flipkart Axis Bank Credit Card",
    themeGradient: "from-blue-900 via-sky-900 to-slate-900",
    accentColor: "#38bdf8",
    loungeAccess: true,
    rewardRate: "5% Unlimited Cashback on Flipkart & Myntra",
    annualFeeEstimate: "₹500 + GST (Waived on ₹3.5L spend)",
    forexMarkup: "3.5%"
  },
  "652850": {
    bin: "652850",
    issuer: "Axis Bank",
    network: "RuPay",
    cardType: "Credit",
    tier: "Platinum (IndianOil RuPay)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "IndianOil Axis Bank RuPay Credit Card",
    themeGradient: "from-rose-950 via-orange-950 to-slate-900",
    accentColor: "#fb7185",
    loungeAccess: false,
    rewardRate: "4% Value back in EDGE Points on Fuel + 1% surcharge waiver",
    annualFeeEstimate: "₹500 + GST (Waived on ₹50k spend)",
    forexMarkup: "3.5%"
  },

  // American Express
  "378282": {
    bin: "378282",
    issuer: "American Express",
    network: "American Express",
    cardType: "Credit",
    tier: "Centurion / Platinum Charge",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "The American Express Platinum Card",
    themeGradient: "from-zinc-700 via-slate-600 to-zinc-800",
    accentColor: "#e4e4e7",
    loungeAccess: true,
    rewardRate: "3X Membership Rewards points on Overseas spends & Taj Vouchers",
    annualFeeEstimate: "₹60,000 + GST",
    forexMarkup: "3.5%"
  },
  "375987": {
    bin: "375987",
    issuer: "American Express",
    network: "American Express",
    cardType: "Credit",
    tier: "Gold (Membership Rewards)",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: "American Express Membership Rewards Credit Card",
    themeGradient: "from-amber-900 via-yellow-900 to-slate-900",
    accentColor: "#fbbf24",
    loungeAccess: false,
    rewardRate: "1,000 Bonus Points for 4 transactions of ₹1,500+ each month",
    annualFeeEstimate: "₹4,500 + GST (Waived on ₹1.5L spend)",
    forexMarkup: "3.5%"
  },

  // Global Cards
  "414720": {
    bin: "414720",
    issuer: "Chase (JPMorgan Chase Bank)",
    network: "Visa",
    cardType: "Credit",
    tier: "Signature (Sapphire Preferred)",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    currencySymbol: "$",
    cardName: "Chase Sapphire Preferred Visa Signature",
    themeGradient: "from-blue-950 via-slate-900 to-indigo-950",
    accentColor: "#60a5fa",
    loungeAccess: true,
    rewardRate: "3X Points on Dining, 2X on Travel Purchases",
    annualFeeEstimate: "$95 / year",
    forexMarkup: "0% (No Foreign Transaction Fees)"
  },
  "546616": {
    bin: "546616",
    issuer: "Citibank",
    network: "Mastercard",
    cardType: "Credit",
    tier: "World Elite (Citi Premier)",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    currencySymbol: "$",
    cardName: "Citi Premier Mastercard",
    themeGradient: "from-slate-900 via-cyan-950 to-slate-900",
    accentColor: "#22d3ee",
    loungeAccess: true,
    rewardRate: "3X Points at Restaurants, Supermarkets, Gas Stations & Air Travel",
    annualFeeEstimate: "$95 / year",
    forexMarkup: "0% (No Foreign Transaction Fees)"
  }
};

/**
 * Intelligent heuristic fallback for any 6-8 digit BIN entered
 */
export function lookupBin(binInput: string): CardBinInfo {
  const cleanDigits = binInput.replace(/\D/g, "");
  const firstSix = cleanDigits.slice(0, 6);

  // Exact 6-digit dictionary match
  if (KNOWN_BIN_DATABASE[firstSix]) {
    return {
      bin: firstSix,
      ...KNOWN_BIN_DATABASE[firstSix]
    } as CardBinInfo;
  }

  // ISO/IEC 7812 Network Detection
  let network: CardBinInfo["network"] = "Unknown";
  let themeGradient = "from-slate-900 via-indigo-950 to-slate-900";
  let accentColor = "#6366f1";
  let tier = "Platinum";
  let issuer = "Recognized Financial Institution";
  let loungeAccess = true;
  let rewardRate = "1.5% - 2.5% Accelerated Reward Point Yield";
  let annualFeeEstimate = "₹1,000 - ₹2,500 + GST (Subject to spend waiver)";
  let forexMarkup = "3.5%";

  const num = parseInt(cleanDigits.slice(0, 4) || "0", 10);
  const leadChar = cleanDigits[0];
  const leadTwo = cleanDigits.slice(0, 2);

  if (leadChar === "4") {
    network = "Visa";
    themeGradient = "from-blue-950 via-indigo-950 to-slate-900";
    accentColor = "#3b82f6";
    tier = cleanDigits.startsWith("416") || cleanDigits.startsWith("462") ? "Infinite" : "Signature";
    issuer = cleanDigits.startsWith("437") || cleanDigits.startsWith("416") ? "HDFC Bank" :
             cleanDigits.startsWith("472") || cleanDigits.startsWith("405") ? "SBI Card" :
             cleanDigits.startsWith("401") || cleanDigits.startsWith("431") ? "ICICI Bank" :
             cleanDigits.startsWith("462") || cleanDigits.startsWith("437") ? "Axis Bank" :
             "Major Retail Bank (Visa Network)";
  } else if ((num >= 5100 && num <= 5599) || (num >= 2221 && num <= 2720)) {
    network = "Mastercard";
    themeGradient = "from-slate-900 via-rose-950 to-slate-950";
    accentColor = "#f43f5e";
    tier = "World Elite / Titanium";
    issuer = cleanDigits.startsWith("524") ? "SBI Card / ICICI Bank" :
             cleanDigits.startsWith("540") ? "HDFC Bank" :
             cleanDigits.startsWith("539") ? "Axis Bank" :
             "Tier-1 Scheduled Bank (Mastercard)";
  } else if (leadTwo === "34" || leadTwo === "37") {
    network = "American Express";
    themeGradient = "from-zinc-800 via-slate-700 to-zinc-900";
    accentColor = "#38bdf8";
    tier = "Platinum / Gold Charge";
    issuer = "American Express Banking Corp.";
    annualFeeEstimate = "₹4,500 - ₹60,000 / year";
  } else if (leadTwo === "60" || leadTwo === "65" || leadTwo === "81" || leadTwo === "82") {
    network = "RuPay";
    themeGradient = "from-emerald-950 via-teal-950 to-slate-900";
    accentColor = "#10b981";
    tier = "Platinum / Select";
    issuer = cleanDigits.startsWith("608") ? "ICICI Bank / SBI Card" :
             cleanDigits.startsWith("652") ? "HDFC Bank / Axis Bank" :
             "NPCI RuPay Member Bank";
    rewardRate = "Direct UPI integration + 1.5% cashback on merchant QR scans";
  } else if (leadTwo === "36" || leadTwo === "38" || (num >= 3000 && num <= 3059)) {
    network = "Diners Club";
    themeGradient = "from-slate-900 via-sky-950 to-slate-900";
    accentColor = "#0284c7";
    tier = "Black / ClubMiles";
    issuer = "HDFC Bank (Diners Club Affiliate)";
  } else if (cleanDigits.startsWith("6011") || cleanDigits.startsWith("644") || cleanDigits.startsWith("65")) {
    network = "Discover";
    themeGradient = "from-amber-950 via-orange-950 to-slate-900";
    accentColor = "#f97316";
    tier = "Cashback Standard";
    issuer = "Discover Financial Services";
  }

  return {
    bin: firstSix.padEnd(6, "0"),
    issuer,
    network,
    cardType: "Credit",
    tier,
    country: "India",
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    cardName: `${issuer} ${tier} ${network}`,
    themeGradient,
    accentColor,
    loungeAccess,
    rewardRate,
    annualFeeEstimate,
    forexMarkup
  };
}

export interface CardHealthFactors {
  utilizationScore: number; // 0 - 350
  paymentHistoryScore: number; // 0 - 250
  creditHeadroomScore: number; // 0 - 150
  spendStabilityScore: number; // 0 - 150
  feeRoiScore: number; // 0 - 100
  totalScore: number; // 0 - 1000
  rating: "Excellent" | "Healthy" | "Fair" | "Attention Required";
  summary: string;
}

export function computeCardHealthScore(
  utilizationPercent: number,
  paymentHabit: "always_full" | "min_due" | "occasional_late",
  accountAgeYears: number,
  isSpikySpend: boolean
): CardHealthFactors {
  // 1. Utilization Score (Max 350)
  let utilScore = 350;
  if (utilizationPercent <= 10) {
    utilScore = 350;
  } else if (utilizationPercent <= 20) {
    utilScore = 330;
  } else if (utilizationPercent <= 30) {
    utilScore = 290;
  } else if (utilizationPercent <= 45) {
    utilScore = 200;
  } else if (utilizationPercent <= 65) {
    utilScore = 120;
  } else {
    utilScore = 50;
  }

  // 2. Payment History Score (Max 250)
  let paymentScore = 250;
  if (paymentHabit === "always_full") {
    paymentScore = 250;
  } else if (paymentHabit === "min_due") {
    paymentScore = 140;
  } else {
    paymentScore = 60;
  }

  // 3. Credit Headroom Score (Max 150)
  let headroomScore = 150;
  if (utilizationPercent <= 30) {
    headroomScore = 150;
  } else if (utilizationPercent <= 60) {
    headroomScore = 90;
  } else {
    headroomScore = 40;
  }

  // 4. Spend Stability (Max 150)
  let stabilityScore = isSpikySpend ? 75 : 150;
  if (accountAgeYears >= 2) stabilityScore = Math.min(150, stabilityScore + 20);

  // 5. Fee ROI (Max 100)
  const feeScore = 90;

  const totalScore = Math.min(1000, Math.max(300, utilScore + paymentScore + headroomScore + stabilityScore + feeScore));

  let rating: CardHealthFactors["rating"] = "Excellent";
  let summary = "Optimal financial habits. Your card management significantly boosts credit bureau scores.";

  if (totalScore >= 820) {
    rating = "Excellent";
    summary = "Flawless credit discipline. Strong profile for instant pre-approved credit line enhancements.";
  } else if (totalScore >= 720) {
    rating = "Healthy";
    summary = "Solid card health. Keeping utilization strictly under 30% will elevate you to Prime status.";
  } else if (totalScore >= 600) {
    rating = "Fair";
    summary = "Moderate warning signs. High revolving balances or minimum-due repayments are increasing interest cost.";
  } else {
    rating = "Attention Required";
    summary = "Immediate action advised: Prioritize clearing high card balances to prevent credit score depreciation.";
  }

  return {
    utilizationScore: utilScore,
    paymentHistoryScore: paymentScore,
    creditHeadroomScore: headroomScore,
    spendStabilityScore: stabilityScore,
    feeRoiScore: feeScore,
    totalScore,
    rating,
    summary
  };
}

export interface LimitReadinessResult {
  readinessPercentage: number;
  status: "Pre-Approved Opportunity" | "Approaching Eligibility" | "Needs Profile Maturation";
  criteria: Array<{ title: string; status: boolean; detail: string }>;
  recommendedAction: string;
}

export function computeLimitReadiness(
  utilizationPercent: number,
  paymentHabit: string,
  accountAgeMonths: number,
  limit: number
): LimitReadinessResult {
  const criteria = [
    {
      title: "Utilization under 30% threshold",
      status: utilizationPercent <= 30,
      detail: utilizationPercent <= 30 ? "Optimal (<30%) across recent cycles" : `Elevated at ${utilizationPercent.toFixed(1)}%`
    },
    {
      title: "100% Full Payment Consistency",
      status: paymentHabit === "always_full",
      detail: paymentHabit === "always_full" ? "Zero revolving interest or minimum payment penalties" : "Carrying revolving interest balances"
    },
    {
      title: "Account Vintage ≥ 6 Months",
      status: accountAgeMonths >= 6,
      detail: accountAgeMonths >= 6 ? `Card active for ${accountAgeMonths} months` : "Newer account (<6 months vintage)"
    },
    {
      title: "Active Credit History & Velocity",
      status: true,
      detail: "Regular monthly transactional volume recorded"
    }
  ];

  const passedCount = criteria.filter((c) => c.status).length;
  let readinessPercentage = Math.round((passedCount / criteria.length) * 100);

  if (utilizationPercent > 50) readinessPercentage = Math.max(30, readinessPercentage - 20);
  if (paymentHabit !== "always_full") readinessPercentage = Math.max(25, readinessPercentage - 25);

  let status: LimitReadinessResult["status"] = "Pre-Approved Opportunity";
  let recommendedAction = "You have an optimal credit risk profile. Request a limit enhancement via NetBanking or Relationship Manager now.";

  if (readinessPercentage >= 75) {
    status = "Pre-Approved Opportunity";
    recommendedAction = `Your account qualifies for a 30% - 60% limit upgrade (approx. ₹${Math.round(limit * 1.4).toLocaleString("en-IN")}). You can submit an income update or call your issuer.`;
  } else if (readinessPercentage >= 50) {
    status = "Approaching Eligibility";
    recommendedAction = "Maintain full statement clearances for 2 more billing cycles and keep utilization below 25% to trigger automatic bank limit upgrades.";
  } else {
    status = "Needs Profile Maturation";
    recommendedAction = "Stabilize payment habits by enabling Auto-Debit for Total Amount Due and clearing revolving balances before requesting a limit revision.";
  }

  return {
    readinessPercentage,
    status,
    criteria,
    recommendedAction
  };
}

export interface RecommendationCard {
  id: string;
  category: "Rewards" | "Credit Health" | "Billing Cycle" | "Smart Features";
  title: string;
  description: string;
  impactTag: string;
  impactColor: string;
  actionText: string;
}

export function generatePersonalizedRecommendations(
  cardInfo: CardBinInfo,
  utilizationPercent: number,
  limit: number,
  currentBalance: number
): RecommendationCard[] {
  const recs: RecommendationCard[] = [];

  // 1. UPI recommendation for RuPay cards
  if (cardInfo.network === "RuPay") {
    recs.push({
      id: "rupay-upi",
      category: "Smart Features",
      title: "Link Card to UPI on PhonePe / Google Pay / Paytm",
      description: `Your ${cardInfo.cardName} supports direct Credit Card on UPI. You can scan any merchant QR code to pay with your credit line while earning ${cardInfo.rewardRate}.`,
      impactTag: "Instant 0-Cost UPI",
      impactColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      actionText: "Enable in UPI App"
    });
  }

  // 2. High Utilization warning or safe spending advice
  if (utilizationPercent > 30) {
    const excess = Math.max(0, currentBalance - limit * 0.3);
    recs.push({
      id: "util-midcycle",
      category: "Credit Health",
      title: "Mid-Cycle Payment Technique (Credit Bureau Optimization)",
      description: `Pay ₹${Math.round(excess).toLocaleString("en-IN")} right now before your statement generation date. This reports <30% utilization to CIBIL & Experian, immediately safeguarding your score.`,
      impactTag: "+15 to +30 Score Boost",
      impactColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      actionText: "Make Mid-Cycle Payment"
    });
  } else {
    recs.push({
      id: "util-optimal",
      category: "Credit Health",
      title: "Golden 30% Utilization Anchor",
      description: `Your current utilization is ${utilizationPercent.toFixed(1)}%, well within the golden 30% safe zone. This builds stellar creditworthiness for future home loans and high-limit cards.`,
      impactTag: "Prime Tier Score",
      impactColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      actionText: "Maintain Balance"
    });
  }

  // 3. Grace Period Optimization
  recs.push({
    id: "grace-period",
    category: "Billing Cycle",
    title: "50-Day Interest-Free Float Strategy",
    description: "Time your major high-ticket purchases 2 to 3 days right after your monthly billing statement date. You get up to 50 interest-free days before the due date, preserving working capital.",
    impactTag: "0% Interest Capital",
    impactColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    actionText: "Check Statement Date"
  });

  // 4. Rewards Optimization
  recs.push({
    id: "rewards-accelerator",
    category: "Rewards",
    title: `${cardInfo.issuer} Multiplier & Milestone Strategy`,
    description: `Maximize your ${cardInfo.tier} tier by routing utility, insurance, and travel spends through dedicated partner portals to unlock up to ${cardInfo.rewardRate}.`,
    impactTag: "Accelerated Cashback",
    impactColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    actionText: "View Reward Matrix"
  });

  // 5. Fee Waiver Milestone
  recs.push({
    id: "annual-fee-waiver",
    category: "Smart Features",
    title: "Annual Maintenance Fee Reversal Milestone",
    description: `Annual fee for this card is estimated at ${cardInfo.annualFeeEstimate}. Consolidate grocery and subscription payments to hit the waiver threshold effortlessly.`,
    impactTag: "Save ₹1,000–₹5,000/yr",
    impactColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    actionText: "Track Spend Progress"
  });

  return recs;
}
