import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { getDataStore } from "@/lib/analytics/dataStore";
import { inspectDataQuality } from "@/lib/analytics/dataQuality";
import { analyzeCustomers } from "@/lib/analytics/customerAnalysis";
import { analyzeCredit } from "@/lib/analytics/creditAnalysis";
import { analyzeTransactions } from "@/lib/analytics/transactionAnalysis";

export async function POST(req: NextRequest) {
  const filters = await req.json().catch(() => ({}));
  return proxyToBackend("/api/overview", "POST", filters, async () => {
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);

    const cust = data.customers;
    const credit = data.credit_profiles;
    const txn = data.transactions;

    const totalCust = cust.length;
    const totalCredit = credit.length;
    const totalTxn = txn.length;

    const validTxnAmounts = txn.map((t) => Number(t.tran_amount)).filter((v) => !isNaN(v));
    const totalTxnVal = validTxnAmounts.reduce((a, b) => a + b, 0);
    const avgTxnVal = totalTxn > 0 ? totalTxnVal / totalTxn : 0;

    const validIncomes = cust.map((c) => Number(c.annual_income)).filter((v) => !isNaN(v) && v !== null);
    const avgInc = validIncomes.length > 0 ? validIncomes.reduce((a, b) => a + b, 0) / validIncomes.length : 0;

    const validScores = credit.map((cp) => Number(cp.credit_score)).filter((v) => !isNaN(v) && v !== null);
    const avgScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

    const validLimits = credit.map((cp) => Number(cp.credit_limit)).filter((v) => !isNaN(v) && v !== null);
    const avgLimit = validLimits.length > 0 ? validLimits.reduce((a, b) => a + b, 0) / validLimits.length : 0;

    const rawQuality = inspectDataQuality(
      store.rawData.customers,
      store.rawData.credit_profiles,
      store.rawData.transactions
    );

    const custRes = analyzeCustomers(cust);
    const creditRes = analyzeCredit(credit, cust);
    const txnRes = analyzeTransactions(txn, cust);

    return {
      kpis: {
        total_customers: totalCust,
        total_credit_profiles: totalCredit,
        total_transactions: totalTxn,
        total_transaction_value: Math.round(totalTxnVal * 100) / 100,
        avg_transaction_value: Math.round(avgTxnVal * 100) / 100,
        avg_annual_income: Math.round(avgInc * 100) / 100,
        avg_credit_score: Math.round(avgScore * 10) / 10,
        avg_credit_limit: Math.round(avgLimit * 100) / 100,
        missing_values_detected: rawQuality.total_missing_values,
        duplicate_records_detected: rawQuality.total_duplicates,
        anomalies_detected: rawQuality.total_anomalies,
        quality_score: store.isCleaned ? (store.cleaningReport?.after_quality_score ?? 100.0) : rawQuality.quality_score,
        is_cleaned: store.isCleaned
      },
      customer_distributions: {
        age: custRes.age_distribution,
        gender: custRes.gender_distribution,
        location: custRes.location_distribution,
        occupation: custRes.income_by_occupation.map((item: any) => ({
          occupation: item.occupation,
          count: item.count
        }))
      },
      credit_distributions: {
        score: creditRes.credit_score_distribution,
        utilisation: creditRes.utilisation_distribution,
        limit: creditRes.credit_limit_distribution
      },
      transaction_distributions: {
        category: txnRes.category_value,
        platform: txnRes.platform_amount,
        payment_type: txnRes.payment_type_distribution,
        monthly_trend: txnRes.monthly_trend
      }
    };
  });
}
