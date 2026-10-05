/**
 * CreditIQ Analytics - Credit Risk & Exposure Analytics (TypeScript)
 */

import { CreditProfile, Customer } from "./dataGenerator";
import { CreditAnalyticsData } from "../../types/analytics";

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

export function analyzeCredit(creditProfiles: CreditProfile[], customers: Customer[]): CreditAnalyticsData {
  if (creditProfiles.length === 0) {
    return {
      summary: {
        avg_credit_score: 0, avg_credit_limit: 0,
        avg_credit_utilisation: 0, avg_outstanding_debt: 0,
        high_utilisation_rate: 0
      },
      credit_score_distribution: [],
      credit_limit_distribution: [],
      utilisation_distribution: [],
      debt_distribution: [],
      inquiries_distribution: [],
      scatter_plots: {
        score_vs_limit: [],
        income_vs_limit: [],
        income_vs_score: [],
        limit_vs_debt: []
      },
      correlation_matrix: [],
      columns: [],
      correlation_highlights: {
        strongest_positive: { var1: "", var2: "", r: 0 },
        strongest_negative: { var1: "", var2: "", r: 0 },
        disclaimer: "Correlation indicates association, not causation."
      }
    };
  }

  const scores = creditProfiles.map(c => c.credit_score);
  const limits = creditProfiles.filter(c => c.credit_limit !== null).map(c => c.credit_limit!);
  const utils = creditProfiles.filter(c => c.credit_utilisation !== null).map(c => c.credit_utilisation!);
  const debts = creditProfiles.map(c => c.outstanding_debt);

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgLimit = limits.length > 0 ? limits.reduce((a, b) => a + b, 0) / limits.length : 0;
  const avgUtil = utils.length > 0 ? utils.reduce((a, b) => a + b, 0) / utils.length : 0;
  const avgDebt = debts.reduce((a, b) => a + b, 0) / debts.length;

  const highUtilCount = utils.filter(u => u > 0.70).length;
  const highUtilPct = Math.round((highUtilCount / creditProfiles.length) * 1000) / 10;

  // Credit Score Tiers
  const scoreTiers = [
    { tier: "Poor (<580)", min: 300, max: 579 },
    { tier: "Fair (580-669)", min: 580, max: 669 },
    { tier: "Good (670-739)", min: 670, max: 739 },
    { tier: "Very Good (740-799)", min: 740, max: 799 },
    { tier: "Exceptional (800+)", min: 800, max: 850 }
  ];
  const scoreDist = scoreTiers.map(t => {
    const cnt = creditProfiles.filter(c => c.credit_score >= t.min && c.credit_score <= t.max).length;
    return {
      tier: t.tier,
      count: cnt,
      percentage: Math.round((cnt / creditProfiles.length) * 1000) / 10
    };
  });

  // Credit Limit Brackets
  const limitBrackets = [
    { bracket: "<$5k", min: 0, max: 5000 },
    { bracket: "$5k-$10k", min: 5001, max: 10000 },
    { bracket: "$10k-$15k", min: 10001, max: 15000 },
    { bracket: "$15k-$20k", min: 15001, max: 20000 },
    { bracket: "$20k-$30k", min: 20001, max: 30000 },
    { bracket: "$30k-$50k", min: 30001, max: 50000 },
    { bracket: "$50k+", min: 50001, max: 1000000 }
  ];
  const limitDist = limitBrackets.map(b => {
    const cnt = creditProfiles.filter(c => (c.credit_limit ?? 0) >= b.min && (c.credit_limit ?? 0) <= b.max).length;
    return {
      bracket: b.bracket,
      count: cnt,
      percentage: Math.round((cnt / creditProfiles.length) * 1000) / 10
    };
  });

  // Utilization Brackets
  const utilBrackets = [
    { bracket: "0-20%", min: 0, max: 0.20 },
    { bracket: "21-40%", min: 0.201, max: 0.40 },
    { bracket: "41-60%", min: 0.401, max: 0.60 },
    { bracket: "61-80%", min: 0.601, max: 0.80 },
    { bracket: "81-100%", min: 0.801, max: 1.5 }
  ];
  const utilDist = utilBrackets.map(b => {
    const cnt = creditProfiles.filter(c => (c.credit_utilisation ?? 0) >= b.min && (c.credit_utilisation ?? 0) <= b.max).length;
    return {
      bracket: b.bracket,
      count: cnt,
      percentage: Math.round((cnt / creditProfiles.length) * 1000) / 10
    };
  });

  // Debt Brackets
  const debtBrackets = [
    { bracket: "<$2k", min: 0, max: 2000 },
    { bracket: "$2k-$5k", min: 2001, max: 5000 },
    { bracket: "$5k-$10k", min: 5001, max: 10000 },
    { bracket: "$10k-$15k", min: 10001, max: 15000 },
    { bracket: "$15k-$25k", min: 15001, max: 25000 },
    { bracket: "$25k+", min: 25001, max: 1000000 }
  ];
  const debtDist = debtBrackets.map(b => {
    const cnt = creditProfiles.filter(c => c.outstanding_debt >= b.min && c.outstanding_debt <= b.max).length;
    return {
      bracket: b.bracket,
      count: cnt,
      percentage: Math.round((cnt / creditProfiles.length) * 1000) / 10
    };
  });

  // Inquiries
  const inqDist = [0, 1, 2, 3, 4, 5, 6].map(k => {
    const cnt = creditProfiles.filter(c => c.credit_inquiries_last_6_months === k).length;
    return {
      inquiries: `${k} Inquiries`,
      count: cnt,
      percentage: Math.round((cnt / creditProfiles.length) * 1000) / 10
    };
  });

  // Merge customer fields for scatter & correlation
  const custMap = new Map<string, Customer>();
  for (const c of customers) custMap.set(c.cust_id, c);

  const merged = creditProfiles
    .map(cp => {
      const cust = custMap.get(cp.cust_id);
      return {
        ...cp,
        annual_income: cust?.annual_income ?? 0,
        name: cust?.name ?? ""
      };
    })
    .filter(m => m.credit_limit !== null && m.annual_income > 0);

  const sample = merged.slice(0, 250);
  const scoreVsLimit = sample.map(m => ({ x: m.credit_score, y: m.credit_limit!, name: m.name, cust_id: m.cust_id }));
  const incomeVsLimit = sample.map(m => ({ x: m.annual_income, y: m.credit_limit!, name: m.name, cust_id: m.cust_id }));
  const incomeVsScore = sample.map(m => ({ x: m.annual_income, y: m.credit_score, name: m.name, cust_id: m.cust_id }));
  const limitVsDebt = sample.map(m => ({ x: m.credit_limit!, y: m.outstanding_debt, name: m.name, cust_id: m.cust_id }));

  // Pearson Correlation Matrix
  const corrCols = [
    { key: "annual_income", label: "Annual Income" },
    { key: "credit_score", label: "Credit Score" },
    { key: "credit_limit", label: "Credit Limit" },
    { key: "credit_utilisation", label: "Credit Utilisation" },
    { key: "outstanding_debt", label: "Outstanding Debt" },
    { key: "credit_inquiries_last_6_months", label: "Credit Inquiries (6M)" }
  ];

  const colNames = corrCols.map(c => c.label);
  const matrix: Array<Record<string, any>> = [];

  let maxPos = { var1: "", var2: "", r: -1.0 };
  let maxNeg = { var1: "", var2: "", r: 1.0 };

  for (let i = 0; i < corrCols.length; i++) {
    const col1 = corrCols[i];
    const row: Record<string, any> = { variable: col1.label };

    for (let j = 0; j < corrCols.length; j++) {
      const col2 = corrCols[j];
      if (i === j) {
        row[col2.label] = 1.0;
      } else {
        const v1 = merged.map(m => Number((m as any)[col1.key] || 0));
        const v2 = merged.map(m => Number((m as any)[col2.key] || 0));
        const rVal = Math.round(pearson(v1, v2) * 100) / 100;
        row[col2.label] = rVal;

        if (i < j) {
          if (rVal > maxPos.r) maxPos = { var1: col1.label, var2: col2.label, r: rVal };
          if (rVal < maxNeg.r) maxNeg = { var1: col1.label, var2: col2.label, r: rVal };
        }
      }
    }
    matrix.push(row);
  }

  return {
    summary: {
      avg_credit_score: Math.round(avgScore * 10) / 10,
      avg_credit_limit: Math.round(avgLimit),
      avg_credit_utilisation: Math.round(avgUtil * 1000) / 10,
      avg_outstanding_debt: Math.round(avgDebt),
      high_utilisation_rate: highUtilPct
    },
    credit_score_distribution: scoreDist,
    credit_limit_distribution: limitDist,
    utilisation_distribution: utilDist,
    debt_distribution: debtDist,
    inquiries_distribution: inqDist,
    scatter_plots: {
      score_vs_limit: scoreVsLimit,
      income_vs_limit: incomeVsLimit,
      income_vs_score: incomeVsScore,
      limit_vs_debt: limitVsDebt
    },
    correlation_matrix: matrix,
    columns: colNames,
    correlation_highlights: {
      strongest_positive: maxPos,
      strongest_negative: maxNeg,
      disclaimer: "Correlation indicates association, not causation."
    }
  };
}
