import { NextRequest, NextResponse } from "next/server";
import { getDataStore } from "@/lib/analytics/dataStore";
import { analyzeCustomers } from "@/lib/analytics/customerAnalysis";
import { analyzeCredit } from "@/lib/analytics/creditAnalysis";
import { analyzeTransactions } from "@/lib/analytics/transactionAnalysis";
import { segmentCustomers } from "@/lib/analytics/segmentation";
import { evaluateTargetSegments } from "@/lib/analytics/targetScoring";
import { analyzeExperiment } from "@/lib/analytics/experiment";
import { runHypothesisTest } from "@/lib/analytics/hypothesisTesting";
import { generateInsights } from "@/lib/analytics/insights";

export async function POST(req: NextRequest) {
  try {
    const filters = await req.json().catch(() => ({}));
    const store = getDataStore();
    const data = store.filterData(filters, filters.use_raw);

    const custAnalytics = analyzeCustomers(data.customers);
    const creditAnalytics = analyzeCredit(data.credit_profiles, data.customers);
    const txnAnalytics = analyzeTransactions(data.transactions, data.customers);
    const segRes = segmentCustomers(data.customers, data.credit_profiles, data.transactions);
    const targetData = evaluateTargetSegments(segRes.segments);
    const expData = analyzeExperiment(data.experiment);

    const ctrlVals = data.experiment
      .filter(r => r.group === "Control")
      .map(r => Number(r.metric_value))
      .filter(v => !isNaN(v));

    const testVals = data.experiment
      .filter(r => r.group === "Test")
      .map(r => Number(r.metric_value))
      .filter(v => !isNaN(v));

    const testResult = runHypothesisTest(ctrlVals, testVals, "z_test", "larger", 0.05);

    const result = generateInsights(
      custAnalytics,
      creditAnalytics,
      txnAnalytics,
      segRes,
      targetData,
      expData,
      testResult
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate insights" }, { status: 500 });
  }
}
