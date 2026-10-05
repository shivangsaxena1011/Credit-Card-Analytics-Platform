/**
 * CreditIQ Analytics - Customer Segmentation Engine (TypeScript)
 */

import { Customer, CreditProfile, Transaction } from "./dataGenerator";
import { SegmentationData, SegmentItem, AgeGroupConfig } from "../../types/analytics";

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function segmentCustomers(
  customers: Customer[],
  creditProfiles: CreditProfile[],
  transactions: Transaction[],
  ageGroups?: AgeGroupConfig[]
): SegmentationData {
  const groups = ageGroups || [
    { id: "seg_18_25", name: "18–25", min_age: 18, max_age: 25, label: "Young Adults / New-to-Credit" },
    { id: "seg_26_48", name: "26–48", min_age: 26, max_age: 48, label: "Prime Earning & Growth" },
    { id: "seg_49_65", name: "49–65+", min_age: 49, max_age: 80, label: "Mature & Established (49–65+)" }
  ];

  if (customers.length === 0) {
    return {
      segments: [],
      total_customers_segmented: 0,
      charts: { income_vs_limit: [], credit_metrics: [], transaction_behavior: [] }
    };
  }

  const creditMap = new Map<string, CreditProfile>();
  for (const cp of creditProfiles) creditMap.set(cp.cust_id, cp);

  // Group transactions by cust_id
  const custTxnMap = new Map<string, Transaction[]>();
  for (const t of transactions) {
    if (!custTxnMap.has(t.cust_id)) custTxnMap.set(t.cust_id, []);
    custTxnMap.get(t.cust_id)!.push(t);
  }

  const segmentResults: SegmentItem[] = [];

  for (const grp of groups) {
    const cohortCust = customers.filter(c => c.age >= grp.min_age && c.age <= grp.max_age);
    const n = cohortCust.length;
    if (n === 0) continue;

    const pct = Math.round((n / customers.length) * 1000) / 10;

    // Income
    const incs = cohortCust.filter(c => c.annual_income !== null).map(c => c.annual_income!);
    const avgInc = incs.length > 0 ? incs.reduce((a, b) => a + b, 0) / incs.length : 0;
    const medInc = median(incs);

    // Credit
    const cohortCredit = cohortCust.map(c => creditMap.get(c.cust_id)).filter(Boolean) as CreditProfile[];
    const scores = cohortCredit.map(c => c.credit_score);
    const limits = cohortCredit.filter(c => c.credit_limit !== null).map(c => c.credit_limit!);
    const utils = cohortCredit.filter(c => c.credit_utilisation !== null).map(c => c.credit_utilisation!);
    const debts = cohortCredit.map(c => c.outstanding_debt);

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const avgLimit = limits.length > 0 ? limits.reduce((a, b) => a + b, 0) / limits.length : 0;
    const avgUtil = utils.length > 0 ? utils.reduce((a, b) => a + b, 0) / utils.length : 0;
    const avgDebt = debts.length > 0 ? debts.reduce((a, b) => a + b, 0) / debts.length : 0;

    // Transactions
    const cohortCustIds = new Set(cohortCust.map(c => c.cust_id));
    const cohortTxns = transactions.filter(t => cohortCustIds.has(t.cust_id));
    const totalTxn = cohortTxns.length;
    const avgTxnAmt = totalTxn > 0 ? cohortTxns.reduce((a, b) => a + b.tran_amount, 0) / totalTxn : 0;

    const ccTxnCnt = cohortTxns.filter(t => t.payment_type === "Credit Card").length;
    const ccShare = totalTxn > 0 ? Math.round((ccTxnCnt / totalTxn) * 1000) / 10 : 0;

    // Top categories
    const catCounts: Record<string, number> = {};
    for (const t of cohortTxns) {
      const cat = t.product_category || "Other";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const topCatSorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const topProductCats = topCatSorted.slice(0, 3).map(([cat, cnt]) => `${cat} (${Math.round((cnt / (totalTxn || 1)) * 1000) / 10}%)`);
    const topCatNames = topCatSorted.slice(0, 3).map(([cat]) => cat);

    segmentResults.push({
      id: grp.id || `seg_${grp.min_age}_${grp.max_age}`,
      name: grp.name,
      label: grp.label || grp.name,
      min_age: grp.min_age,
      max_age: grp.max_age,
      customer_count: n,
      customer_percentage: pct,
      avg_income: Math.round(avgInc * 100) / 100,
      median_income: Math.round(medInc * 100) / 100,
      avg_credit_score: Math.round(avgScore * 10) / 10,
      avg_credit_limit: Math.round(avgLimit),
      avg_credit_utilisation: Math.round(avgUtil * 1000) / 10,
      avg_outstanding_debt: Math.round(avgDebt),
      avg_transaction_amount: Math.round(avgTxnAmt * 100) / 100,
      total_transactions: totalTxn,
      credit_card_payment_share: ccShare,
      top_product_categories: topProductCats,
      top_category_names: topCatNames
    });
  }

  const chartIncomeLimit = segmentResults.map(s => ({
    segment: s.name,
    avg_income: s.avg_income,
    avg_credit_limit: s.avg_credit_limit
  }));
  const chartCredit = segmentResults.map(s => ({
    segment: s.name,
    avg_credit_score: s.avg_credit_score,
    credit_utilisation: s.avg_credit_utilisation
  }));
  const chartTxn = segmentResults.map(s => ({
    segment: s.name,
    avg_txn_amount: s.avg_transaction_amount,
    cc_payment_share: s.credit_card_payment_share
  }));

  return {
    segments: segmentResults,
    total_customers_segmented: customers.length,
    charts: {
      income_vs_limit: chartIncomeLimit,
      credit_metrics: chartCredit,
      transaction_behavior: chartTxn
    }
  };
}
