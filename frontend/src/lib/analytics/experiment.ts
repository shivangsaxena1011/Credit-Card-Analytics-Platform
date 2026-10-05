import { ExperimentRecord } from "./dataGenerator";

export function analyzeExperiment(
  expData: ExperimentRecord[],
  controlLabel: string = "Control",
  testLabel: string = "Test",
  metricName: string = "Average Transaction Value"
): any {
  if (!expData || !expData.length) {
    return { error: "Experiment dataset is empty" };
  }

  let controlRows = expData.filter(r => r.group === controlLabel);
  let testRows = expData.filter(r => r.group === testLabel);

  if (!controlRows.length || !testRows.length) {
    const groups = Array.from(new Set(expData.map(r => r.group)));
    if (groups.length >= 2) {
      controlLabel = String(groups[0]);
      testLabel = String(groups[1]);
      controlRows = expData.filter(r => r.group === controlLabel);
      testRows = expData.filter(r => r.group === testLabel);
    }
  }

  const ctrlVals = controlRows.map(r => Number(r.metric_value)).filter(v => !isNaN(v));
  const testVals = testRows.map(r => Number(r.metric_value)).filter(v => !isNaN(v));

  const nCtrl = ctrlVals.length;
  const nTest = testVals.length;

  if (nCtrl === 0 || nTest === 0) {
    return { error: "Insufficient valid records in experiment groups" };
  }

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  const variance = (arr: number[], m: number) => {
    if (arr.length <= 1) return 0;
    return arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
  };
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const ctrlMean = mean(ctrlVals);
  const testMean = mean(testVals);

  const ctrlMed = median(ctrlVals);
  const testMed = median(testVals);

  const ctrlVar = variance(ctrlVals, ctrlMean);
  const testVar = variance(testVals, testMean);
  const ctrlStd = Math.sqrt(ctrlVar);
  const testStd = Math.sqrt(testVar);

  const ctrlMin = Math.min(...ctrlVals);
  const testMin = Math.min(...testVals);
  const ctrlMax = Math.max(...ctrlVals);
  const testMax = Math.max(...testVals);

  const ctrlQ1 = percentile(ctrlVals, 25);
  const ctrlQ3 = percentile(ctrlVals, 75);
  const testQ1 = percentile(testVals, 25);
  const testQ3 = percentile(testVals, 75);

  const absDiff = testMean - ctrlMean;
  const pctLift = ctrlMean !== 0 ? (absDiff / ctrlMean) * 100.0 : 0.0;

  // Daily trend
  const dailyMap = new Map<string, { ctrlSum: number; ctrlCount: number; testSum: number; testCount: number }>();
  for (const r of expData) {
    const val = Number(r.metric_value);
    if (isNaN(val)) continue;
    const dateKey = r.experiment_date;
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { ctrlSum: 0, ctrlCount: 0, testSum: 0, testCount: 0 });
    }
    const entry = dailyMap.get(dateKey)!;
    if (r.group === controlLabel) {
      entry.ctrlSum += val;
      entry.ctrlCount++;
    } else if (r.group === testLabel) {
      entry.testSum += val;
      entry.testCount++;
    }
  }

  const sortedDates = Array.from(dailyMap.keys()).sort();
  const dailyTrend = sortedDates.map(date => {
    const entry = dailyMap.get(date)!;
    return {
      date,
      Control: entry.ctrlCount > 0 ? Math.round((entry.ctrlSum / entry.ctrlCount) * 100) / 100 : null,
      Test: entry.testCount > 0 ? Math.round((entry.testSum / entry.testCount) * 100) / 100 : null
    };
  });

  // Distribution histogram bins
  const allMin = Math.min(ctrlMin, testMin);
  const allMax = Math.max(ctrlMax, testMax);
  const binCount = 14;
  const step = (allMax - allMin) / binCount;
  const distributionData = [];

  for (let i = 0; i < binCount; i++) {
    const bStart = allMin + i * step;
    const bEnd = allMin + (i + 1) * step;
    const isLast = i === binCount - 1;

    const cCount = ctrlVals.filter(v => v >= bStart && (isLast ? v <= bEnd : v < bEnd)).length;
    const tCount = testVals.filter(v => v >= bStart && (isLast ? v <= bEnd : v < bEnd)).length;

    distributionData.push({
      bin: `$${Math.round(bStart)}-$${Math.round(bEnd)}`,
      bin_center: Math.round(((bStart + bEnd) / 2) * 10) / 10,
      Control: cCount,
      Test: tCount
    });
  }

  return {
    metric_name: metricName,
    control_group: {
      label: controlLabel,
      sample_size: nCtrl,
      mean: Math.round(ctrlMean * 100) / 100,
      median: Math.round(ctrlMed * 100) / 100,
      std_dev: Math.round(ctrlStd * 100) / 100,
      variance: Math.round(ctrlVar * 100) / 100,
      min: Math.round(ctrlMin * 100) / 100,
      max: Math.round(ctrlMax * 100) / 100,
      q1: Math.round(ctrlQ1 * 100) / 100,
      q3: Math.round(ctrlQ3 * 100) / 100,
      raw_mean: ctrlMean,
      raw_std: ctrlStd
    },
    test_group: {
      label: testLabel,
      sample_size: nTest,
      mean: Math.round(testMean * 100) / 100,
      median: Math.round(testMed * 100) / 100,
      std_dev: Math.round(testStd * 100) / 100,
      variance: Math.round(testVar * 100) / 100,
      min: Math.round(testMin * 100) / 100,
      max: Math.round(testMax * 100) / 100,
      q1: Math.round(testQ1 * 100) / 100,
      q3: Math.round(testQ3 * 100) / 100,
      raw_mean: testMean,
      raw_std: testStd
    },
    comparison: {
      absolute_difference: Math.round(absDiff * 100) / 100,
      percentage_lift: Math.round(pctLift * 100) / 100,
      raw_absolute_diff: absDiff,
      raw_percentage_lift: pctLift
    },
    daily_trend: dailyTrend,
    distribution: distributionData
  };
}
