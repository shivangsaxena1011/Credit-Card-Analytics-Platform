/**
 * CreditIQ Analytics - Transaction Analytics Engine (TypeScript)
 */

import { Transaction, Customer } from "./dataGenerator";
import { TransactionAnalyticsData } from "../../types/analytics";

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function analyzeTransactions(transactions: Transaction[], customers: Customer[]): TransactionAnalyticsData {
  if (transactions.length === 0) {
    return {
      summary: { total_value: 0, avg_amount: 0, median_amount: 0, total_count: 0 },
      monthly_trend: [],
      category_value: [],
      category_count: [],
      platform_amount: [],
      payment_type_distribution: [],
      age_group_value: [],
      category_payment_matrix: [],
      payment_columns: [],
      platform_category_matrix: [],
      category_columns: [],
      top_categories: []
    };
  }

  const amounts = transactions.map(t => t.tran_amount);
  const totalVal = amounts.reduce((a, b) => a + b, 0);
  const avgAmt = totalVal / amounts.length;
  const medAmt = median(amounts);

  // 1. Monthly trend
  const monthMap: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    const month = t.tran_date.substring(0, 7);
    if (!monthMap[month]) monthMap[month] = { total: 0, count: 0 };
    monthMap[month].total += t.tran_amount;
    monthMap[month].count++;
  }
  const monthlyTrend = Object.keys(monthMap).sort().map(m => ({
    month: m,
    total_value: Math.round(monthMap[m].total * 100) / 100,
    avg_amount: Math.round((monthMap[m].total / monthMap[m].count) * 100) / 100,
    count: monthMap[m].count
  }));

  // 2. Category value & count
  const catMap: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    const cat = t.product_category || "Other";
    if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
    catMap[cat].total += t.tran_amount;
    catMap[cat].count++;
  }
  const categoryValue = Object.entries(catMap).map(([cat, val]) => ({
    category: cat,
    total_value: Math.round(val.total * 100) / 100,
    percentage: Math.round((val.total / totalVal) * 1000) / 10
  })).sort((a, b) => b.total_value - a.total_value);

  const categoryCount = Object.entries(catMap).map(([cat, val]) => ({
    category: cat,
    count: val.count
  })).sort((a, b) => b.count - a.count);

  const topCategories = categoryValue.map((c, i) => ({
    rank: i + 1,
    category: c.category,
    total_value: c.total_value,
    avg_amount: Math.round((c.total_value / catMap[c.category].count) * 100) / 100,
    count: catMap[c.category].count,
    share_percentage: c.percentage
  }));

  // 3. Platform amount
  const platMap: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    const p = t.platform || "Other";
    if (!platMap[p]) platMap[p] = { total: 0, count: 0 };
    platMap[p].total += t.tran_amount;
    platMap[p].count++;
  }
  const platformAmount = Object.entries(platMap).map(([p, val]) => ({
    platform: p,
    total_value: Math.round(val.total * 100) / 100,
    count: val.count,
    percentage: Math.round((val.total / totalVal) * 1000) / 10
  })).sort((a, b) => b.total_value - a.total_value);

  // 4. Payment type distribution
  const payMap: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    const pt = t.payment_type || "Other";
    if (!payMap[pt]) payMap[pt] = { total: 0, count: 0 };
    payMap[pt].total += t.tran_amount;
    payMap[pt].count++;
  }
  const paymentTypeDist = Object.entries(payMap).map(([pt, val]) => ({
    payment_type: pt,
    total_value: Math.round(val.total * 100) / 100,
    count: val.count,
    share_percentage: Math.round((val.total / totalVal) * 1000) / 10
  })).sort((a, b) => b.total_value - a.total_value);

  // 5. Age group spend
  const custAgeMap = new Map<string, number>();
  for (const c of customers) custAgeMap.set(c.cust_id, c.age);

  const ageSegMap: Record<string, { total: number; count: number }> = {
    "18-25 (Young Adult)": { total: 0, count: 0 },
    "26-48 (Prime Earning)": { total: 0, count: 0 },
    "49-65+ (Mature)": { total: 0, count: 0 }
  };
  for (const t of transactions) {
    const age = custAgeMap.get(t.cust_id) ?? 35;
    const seg = age <= 25 ? "18-25 (Young Adult)" : age <= 48 ? "26-48 (Prime Earning)" : "49-65+ (Mature)";
    ageSegMap[seg].total += t.tran_amount;
    ageSegMap[seg].count++;
  }
  const ageGroupVal = Object.entries(ageSegMap).map(([seg, val]) => ({
    segment: seg,
    total_value: Math.round(val.total * 100) / 100,
    avg_amount: Math.round((val.total / (val.count || 1)) * 100) / 100,
    count: val.count,
    percentage: Math.round((val.total / totalVal) * 1000) / 10
  }));

  // 6. Category x Payment Type Matrix
  const payCols = Object.keys(payMap);
  const catPayMatrix = Object.keys(catMap).map(cat => {
    const row: Record<string, any> = { category: cat };
    for (const p of payCols) {
      const sum = transactions
        .filter(t => (t.product_category || "Other") === cat && (t.payment_type || "Other") === p)
        .reduce((a, b) => a + b.tran_amount, 0);
      row[p] = Math.round(sum * 100) / 100;
    }
    return row;
  });

  return {
    summary: {
      total_value: Math.round(totalVal * 100) / 100,
      avg_amount: Math.round(avgAmt * 100) / 100,
      median_amount: Math.round(medAmt * 100) / 100,
      total_count: transactions.length
    },
    monthly_trend: monthlyTrend,
    category_value: categoryValue,
    category_count: categoryCount,
    platform_amount: platformAmount,
    payment_type_distribution: paymentTypeDist,
    age_group_value: ageGroupVal,
    category_payment_matrix: catPayMatrix,
    payment_columns: payCols,
    platform_category_matrix: [],
    category_columns: Object.keys(catMap),
    top_categories: topCategories
  };
}
