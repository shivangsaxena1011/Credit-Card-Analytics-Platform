import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
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
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/insights", "POST", body, async () => {
    const store = getDataStore();
    const data = store.filterData(body);

    const custAnalytics = analyzeCustomers(data.customers);
    const creditAnalytics = analyzeCredit(data.credit_profiles, data.customers);
    const txnAnalytics = analyzeTransactions(data.transactions, data.customers);
    const segmentationData = segmentCustomers(data.customers, data.credit_profiles, data.transactions);
    const targetData = evaluateTargetSegments(segmentationData.segments);
    const expData = analyzeExperiment(data.experiment);

    const ctrlVals = data.experiment
      .filter((r) => r.group === "Control")
      .map((r) => Number(r.metric_value))
      .filter((v) => !isNaN(v));

    const testVals = data.experiment
      .filter((r) => r.group === "Test")
      .map((r) => Number(r.metric_value))
      .filter((v) => !isNaN(v));

    const testResult = runHypothesisTest(ctrlVals, testVals, "z_test", "larger", 0.05);

    return generateInsights(
      custAnalytics,
      creditAnalytics,
      txnAnalytics,
      segmentationData,
      targetData,
      expData,
      testResult
    );
  });
}
