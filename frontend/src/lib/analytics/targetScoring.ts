export interface TargetSegmentWeights {
  segment_size?: number;
  income_opportunity?: number;
  credit_opportunity?: number;
  transaction_activity?: number;
  card_usage_gap?: number;
  category_engagement?: number;
  [key: string]: number | undefined;
}

export const DEFAULT_WEIGHTS: Record<string, number> = {
  segment_size: 0.20,
  income_opportunity: 0.15,
  credit_opportunity: 0.20,
  transaction_activity: 0.20,
  card_usage_gap: 0.15,
  category_engagement: 0.10
};

export function minMaxNormalize(values: number[], invert: boolean = false): number[] {
  if (!values.length) return [];
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  if (maxV === minV) {
    return values.map(() => 0.75);
  }

  const norm = values.map(v => (v - minV) / (maxV - minV));
  const finalNorm = invert ? norm.map(n => 1.0 - n) : norm;
  return finalNorm.map(n => 0.2 + 0.8 * n);
}

export function evaluateTargetSegments(
  segments: any[],
  weights?: TargetSegmentWeights
): any {
  if (!segments || !segments.length) {
    return { ranked_segments: [], recommended_segment: null, weights: DEFAULT_WEIGHTS };
  }

  const activeWeights: Record<string, number> = { ...DEFAULT_WEIGHTS };
  if (weights) {
    for (const [k, v] of Object.entries(weights)) {
      if (typeof v === "number" && !isNaN(v)) {
        activeWeights[k] = v;
      }
    }
  }
  const wSum = Object.values(activeWeights).reduce((a, b) => a + (b || 0), 0);
  const normWeights: Record<string, number> = {};
  for (const [k, v] of Object.entries(activeWeights)) {
    normWeights[k] = wSum > 0 ? (v || 0) / wSum : DEFAULT_WEIGHTS[k];
  }

  const sizes = segments.map(s => Number(s.customer_count || 0));
  const incomes = segments.map(s => Number(s.avg_income || 0));
  const creditOppRaw = segments.map(s => {
    const score = Number(s.avg_credit_score || 600);
    const limit = Math.max(1, Number(s.avg_credit_limit || 5000));
    return (score / limit) * 1000.0;
  });

  const txnActivityRaw = segments.map(s => {
    const totalTxn = Number(s.total_transactions || 0);
    const custCount = Math.max(1, Number(s.customer_count || 1));
    return totalTxn / custCount;
  });

  const ccShares = segments.map(s => Number(s.credit_card_payment_share || 0));

  const digitalCats = new Set(["Electronics", "Fashion & Apparel", "Beauty & Personal Care", "Travel"]);
  const catEngRaw = segments.map(s => {
    const topNames: string[] = s.top_category_names || [];
    const overlap = topNames.filter(n => digitalCats.has(n)).length;
    const avgAmt = Number(s.avg_transaction_amount || 0);
    return overlap * 10.0 + (avgAmt / 10.0);
  });

  const normSizes = minMaxNormalize(sizes);
  const normIncomes = minMaxNormalize(incomes);
  const normCreditOpp = minMaxNormalize(creditOppRaw);
  const normTxnAct = minMaxNormalize(txnActivityRaw);
  const normCardGap = minMaxNormalize(ccShares, true);
  const normCatEng = minMaxNormalize(catEngRaw);

  const evaluatedSegments = segments.map((s, i) => {
    const compSize = normSizes[i] * (normWeights.segment_size || 0.20);
    const compInc = normIncomes[i] * (normWeights.income_opportunity || 0.15);
    const compCred = normCreditOpp[i] * (normWeights.credit_opportunity || 0.20);
    const compTxn = normTxnAct[i] * (normWeights.transaction_activity || 0.20);
    const compGap = normCardGap[i] * (normWeights.card_usage_gap || 0.15);
    const compCat = normCatEng[i] * (normWeights.category_engagement || 0.10);

    const totalScore = (compSize + compInc + compCred + compTxn + compGap + compCat) * 100.0;

    return {
      ...s,
      opportunity_score: Math.round(totalScore * 10) / 10,
      scoring_breakdown: {
        segment_size: { raw: sizes[i], normalized: Math.round(normSizes[i] * 1000) / 1000, weighted: Math.round(compSize * 10000) / 100 },
        income_opportunity: { raw: incomes[i], normalized: Math.round(normIncomes[i] * 1000) / 1000, weighted: Math.round(compInc * 10000) / 100 },
        credit_opportunity: { raw: Math.round(creditOppRaw[i] * 100) / 100, normalized: Math.round(normCreditOpp[i] * 1000) / 1000, weighted: Math.round(compCred * 10000) / 100 },
        transaction_activity: { raw: Math.round(txnActivityRaw[i] * 10) / 10, normalized: Math.round(normTxnAct[i] * 1000) / 1000, weighted: Math.round(compTxn * 10000) / 100 },
        card_usage_gap: { raw: ccShares[i], normalized: Math.round(normCardGap[i] * 1000) / 1000, weighted: Math.round(compGap * 10000) / 100 },
        category_engagement: { raw: Math.round(catEngRaw[i] * 10) / 10, normalized: Math.round(normCatEng[i] * 1000) / 1000, weighted: Math.round(compCat * 10000) / 100 }
      }
    };
  });

  evaluatedSegments.sort((a, b) => b.opportunity_score - a.opportunity_score);

  const recommended = evaluatedSegments[0];
  const runnerUps = evaluatedSegments.slice(1);

  const topCatStr = (recommended?.top_category_names || ["Retail", "Online"]).join(", ");
  const narrative = recommended ? (
    `The ${recommended.name} segment represents ${recommended.customer_percentage}% of the customer base ` +
    `(${recommended.customer_count} accounts) with an average annual income of $${recommended.avg_income?.toLocaleString()}. ` +
    `Currently, this group exhibits a substantial card usage gap, with only ${recommended.credit_card_payment_share}% ` +
    `of transactions settled via credit card despite frequent purchase behavior (${recommended.total_transactions} total transactions, ` +
    `averaging $${recommended.avg_transaction_amount?.toFixed(2)} per ticket). ` +
    `With an average credit score of ${recommended.avg_credit_score?.toFixed(0)} and conservative credit limits ($${recommended.avg_credit_limit?.toLocaleString()}), ` +
    `this cohort presents a prime credit-building and rewards-incentive opportunity in categories like ${topCatStr}.`
  ) : "";

  const whySelected = recommended ? (
    `Selected as the top target segment with an Opportunity Score of ${recommended.opportunity_score}/100. ` +
    `Key drivers include the high credit card conversion gap (${recommended.credit_card_payment_share}% current card share), ` +
    `strong transactional engagement, and healthy credit profile capacity.`
  ) : "";

  return {
    ranked_segments: evaluatedSegments,
    recommended_segment: recommended ? {
      ...recommended,
      opportunity_narrative: narrative,
      why_selected: whySelected
    } : null,
    runner_ups: runnerUps,
    weights: normWeights,
    raw_weights: weights || DEFAULT_WEIGHTS
  };
}
