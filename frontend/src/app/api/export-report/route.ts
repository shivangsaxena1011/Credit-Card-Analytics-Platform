import { NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { inspectDataQuality } from "@/lib/analytics/dataQuality";
import { analyzeCustomers } from "@/lib/analytics/customerAnalysis";
import { analyzeCredit } from "@/lib/analytics/creditAnalysis";
import { analyzeTransactions } from "@/lib/analytics/transactionAnalysis";
import { segmentCustomers } from "@/lib/analytics/segmentation";
import { evaluateTargetSegments } from "@/lib/analytics/targetScoring";
import { analyzeExperiment } from "@/lib/analytics/experiment";
import { calculatePowerAndSampleSize } from "@/lib/analytics/powerAnalysis";
import { runHypothesisTest } from "@/lib/analytics/hypothesisTesting";
import { generateInsights } from "@/lib/analytics/insights";
import { generateExecutiveReport, generatePrintableHtml } from "@/lib/analytics/reportGenerator";

export async function POST() {
  try {
    const store = getDataStore();
    const rawQuality = inspectDataQuality(
      store.rawData.customers,
      store.rawData.credit_profiles,
      store.rawData.transactions
    );
    const cleaningRep = store.cleaningReport || store.applyCleaning();

    const cleanData = store.getActiveData(false);
    const cust = cleanData.customers;
    const credit = cleanData.credit_profiles;
    const txn = cleanData.transactions;
    const exp = cleanData.experiment;

    const validTxnAmounts = txn.map(t => Number(t.tran_amount)).filter(v => !isNaN(v));
    const totalTxnVal = validTxnAmounts.reduce((a, b) => a + b, 0);
    const avgTxnVal = txn.length > 0 ? totalTxnVal / txn.length : 0;

    const validIncomes = cust.map(c => Number(c.annual_income)).filter(v => !isNaN(v) && v !== null);
    const avgInc = validIncomes.length > 0 ? validIncomes.reduce((a, b) => a + b, 0) / validIncomes.length : 0;

    const validScores = credit.map(cp => Number(cp.credit_score)).filter(v => !isNaN(v) && v !== null);
    const avgScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

    const validLimits = credit.map(cp => Number(cp.credit_limit)).filter(v => !isNaN(v) && v !== null);
    const avgLimit = validLimits.length > 0 ? validLimits.reduce((a, b) => a + b, 0) / validLimits.length : 0;

    const overviewKpis = {
      total_customers: cust.length,
      total_credit_profiles: credit.length,
      total_transactions: txn.length,
      total_transaction_value: Math.round(totalTxnVal * 100) / 100,
      avg_transaction_value: Math.round(avgTxnVal * 100) / 100,
      avg_annual_income: Math.round(avgInc * 100) / 100,
      avg_credit_score: Math.round(avgScore * 10) / 10,
      avg_credit_limit: Math.round(avgLimit * 100) / 100
    };

    const custAnalytics = analyzeCustomers(cust);
    const creditAnalytics = analyzeCredit(credit, cust);
    const txnAnalytics = analyzeTransactions(txn, cust);
    const segmentationData = segmentCustomers(cust, credit, txn);
    const targetData = evaluateTargetSegments(segmentationData.segments);
    const expData = analyzeExperiment(exp);
    const powerData = calculatePowerAndSampleSize(0.05, 0.80, 0.20, "larger");

    const ctrlVals = exp.filter(r => r.group === "Control").map(r => Number(r.metric_value)).filter(v => !isNaN(v));
    const testVals = exp.filter(r => r.group === "Test").map(r => Number(r.metric_value)).filter(v => !isNaN(v));
    const hypoData = runHypothesisTest(ctrlVals, testVals, "z_test", "larger", 0.05);

    const insightsData = generateInsights(
      custAnalytics,
      creditAnalytics,
      txnAnalytics,
      segmentationData,
      targetData,
      expData,
      hypoData
    );

    const reportData = generateExecutiveReport(
      overviewKpis,
      rawQuality,
      cleaningRep,
      custAnalytics,
      creditAnalytics,
      txnAnalytics,
      segmentationData,
      targetData,
      expData,
      powerData,
      hypoData,
      insightsData
    );

    const printableHtml = generatePrintableHtml(reportData);

    return NextResponse.json({
      report: reportData,
      printable_html: printableHtml
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
