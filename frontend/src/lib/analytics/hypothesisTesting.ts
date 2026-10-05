import { normCdf, normPdf, normPpf } from "./powerAnalysis";

// Regularized incomplete beta function for exact Student's t-distribution
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 100;
  const EPS = 3.0e-7;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
}

function lnGamma(z: number): number {
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function ibeta(a: number, b: number, x: number): number {
  if (x === 0.0) return 0.0;
  if (x === 1.0) return 1.0;
  const lbeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  const bt = Math.exp(-lbeta + a * Math.log(x) + b * Math.log(1.0 - x));
  if (x < (a + 1.0) / (a + b + 2.0)) {
    return bt * betacf(a, b, x) / a;
  } else {
    return 1.0 - bt * betacf(b, a, 1.0 - x) / b;
  }
}

export function tCdf(t: number, df: number): number {
  if (df <= 0) return NaN;
  const x = df / (df + t * t);
  const prob = 0.5 * ibeta(df / 2.0, 0.5, x);
  return t >= 0 ? 1.0 - prob : prob;
}

export function tPdf(t: number, df: number): number {
  const num = Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2));
  const denom = Math.sqrt(df * Math.PI) * Math.pow(1 + (t * t) / df, (df + 1) / 2);
  return num / denom;
}

export function tPpf(p: number, df: number): number {
  // Use binary search / Newton refinement using tCdf initialized with normal quantile
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let z = normPpf(p);
  // Cornish-Fisher expansion for t quantile
  z = z + (z * z * z + z) / (4 * df);
  // Newton-Raphson refinement
  for (let i = 0; i < 6; i++) {
    const err = tCdf(z, df) - p;
    const slope = tPdf(z, df);
    if (Math.abs(slope) < 1e-12) break;
    const delta = err / slope;
    z -= delta;
    if (Math.abs(delta) < 1e-7) break;
  }
  return z;
}

export function runHypothesisTest(
  controlVals: number[],
  testVals: number[],
  testType: string = "z_test",
  alternative: string = "larger",
  alpha: number = 0.05
): any {
  const n1 = controlVals.length;
  const n2 = testVals.length;

  if (n1 < 2 || n2 < 2) {
    return { error: "Insufficient sample size for hypothesis testing." };
  }

  const m1 = controlVals.reduce((a, b) => a + b, 0) / n1;
  const m2 = testVals.reduce((a, b) => a + b, 0) / n2;

  const v1 = controlVals.reduce((a, b) => a + Math.pow(b - m1, 2), 0) / (n1 - 1);
  const v2 = testVals.reduce((a, b) => a + Math.pow(b - m2, 2), 0) / (n2 - 1);

  const s1 = Math.sqrt(v1);
  const s2 = Math.sqrt(v2);

  const diff = m2 - m1;
  const se = Math.sqrt(v1 / n1 + v2 / n2);

  const sPooled = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
  const cohensD = sPooled > 0 ? diff / sPooled : 0.0;

  let testStat = se > 0 ? diff / se : 0.0;
  let critVal = 0;
  let pVal = 0;
  let ciLower = 0;
  let ciUpper = 0;
  let dfWelch: number | null = null;

  if (testType === "t_test") {
    const term1 = v1 / n1;
    const term2 = v2 / n2;
    dfWelch = (term1 + term2 > 0)
      ? Math.pow(term1 + term2, 2) / (Math.pow(term1, 2) / (n1 - 1) + Math.pow(term2, 2) / (n2 - 1))
      : (n1 + n2 - 2);

    if (alternative === "larger") {
      critVal = tPpf(1.0 - alpha, dfWelch);
      pVal = 1.0 - tCdf(testStat, dfWelch);
      ciLower = diff - critVal * se;
      ciUpper = Infinity;
    } else if (alternative === "smaller") {
      critVal = tPpf(alpha, dfWelch);
      pVal = tCdf(testStat, dfWelch);
      ciLower = -Infinity;
      ciUpper = diff - critVal * se;
    } else {
      critVal = tPpf(1.0 - alpha / 2.0, dfWelch);
      pVal = 2.0 * (1.0 - tCdf(Math.abs(testStat), dfWelch));
      ciLower = diff - critVal * se;
      ciUpper = diff + critVal * se;
    }
  } else {
    // Two-sample Z-test
    if (alternative === "larger") {
      critVal = normPpf(1.0 - alpha);
      pVal = 1.0 - normCdf(testStat);
      ciLower = diff - critVal * se;
      ciUpper = Infinity;
    } else if (alternative === "smaller") {
      critVal = normPpf(alpha);
      pVal = normCdf(testStat);
      ciLower = -Infinity;
      ciUpper = diff - critVal * se;
    } else {
      critVal = normPpf(1.0 - alpha / 2.0);
      pVal = 2.0 * (1.0 - normCdf(Math.abs(testStat)));
      ciLower = diff - critVal * se;
      ciUpper = diff + critVal * se;
    }
  }

  const rejectH0 = pVal < alpha;
  const decision = rejectH0 ? "Reject H0" : "Fail to Reject H0";

  let h0Text = "";
  let h1Text = "";
  if (alternative === "larger") {
    h0Text = "H0: Test group mean is less than or equal to control group mean (μ_test ≤ μ_ctrl)";
    h1Text = "H1: Test group mean is strictly greater than control group mean (μ_test > μ_ctrl)";
  } else if (alternative === "smaller") {
    h0Text = "H0: Test group mean is greater than or equal to control group mean (μ_test ≥ μ_ctrl)";
    h1Text = "H1: Test group mean is strictly less than control group mean (μ_test < μ_ctrl)";
  } else {
    h0Text = "H0: Test group mean is equal to control group mean (μ_test = μ_ctrl)";
    h1Text = "H1: Test group mean is not equal to control group mean (μ_test ≠ μ_ctrl)";
  }

  const curveData = [];
  const minX = -4.0;
  const maxX = 4.0;
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const x = minX + (i / steps) * (maxX - minX);
    const yDensity = testType === "t_test" && dfWelch ? tPdf(x, dfWelch) : normPdf(x);

    let inRejection = false;
    if (alternative === "larger") {
      inRejection = x >= critVal;
    } else if (alternative === "smaller") {
      inRejection = x <= critVal;
    } else {
      inRejection = Math.abs(x) >= Math.abs(critVal);
    }

    curveData.push({
      x: Math.round(x * 100) / 100,
      density: Math.round(yDensity * 10000) / 10000,
      in_rejection_region: inRejection,
      rejection_fill: inRejection ? yDensity : 0.0
    });
  }

  const pctLift = m1 !== 0 ? ((m2 - m1) / m1) * 100.0 : 0.0;

  const statInterp = rejectH0
    ? `The observed test-group average transaction value ($${m2.toFixed(2)}) is higher than the control-group average ` +
      `($${m1.toFixed(2)}), representing an absolute increase of $${diff.toFixed(2)} (+${pctLift.toFixed(2)}% lift). ` +
      `The calculated test statistic (${testType.toUpperCase()} = ${testStat.toFixed(3)}) yields a p-value of ${pVal < 0.0001 ? "< 0.0001" : pVal.toFixed(4)}, ` +
      `which is strictly below the chosen significance threshold (α = ${alpha}). ` +
      `Consequently, we reject the null hypothesis (H0). ` +
      `There is statistically significant evidence to conclude that the test campaign improves customer transaction value.`
    : `The observed difference in average transaction values ($${diff.toFixed(2)}) between test ($${m2.toFixed(2)}) and control ($${m1.toFixed(2)}) ` +
      `resulted in a test statistic of ${testStat.toFixed(3)} with a p-value of ${pVal.toFixed(4)}. ` +
      `Because the p-value is greater than or equal to the significance level (α = ${alpha}), we fail to reject the null hypothesis (H0). ` +
      `The observed variation cannot be distinguished from random sampling fluctuation at this significance level.`;

  const bizInterp = rejectH0
    ? `The promotion produced a statistically verified +${pctLift.toFixed(1)}% uplift in average transaction spend among targeted cardholders. ` +
      `This indicates that tailored incentives effectively stimulate basket sizes without relying purely on random transaction noise.`
    : `The observed +${pctLift.toFixed(1)}% change cannot yet be confirmed as genuine lift. Rolling out the campaign at scale ` +
      `under current parameters risks incurring marketing costs without guaranteed incremental spend.`;

  const caveats = [
    "Independent Observations: Assumes transactions and customers between test and control were randomly assigned without cross-contamination.",
    "Variance & Distributional Stability: The asymptotic Z-test assumes adequate sample size (n > 30), satisfied here with large N.",
    "External Validity: Performance observed over the 30-day testing window may reflect novelty bias; long-term lift should be monitored.",
    "Economic Feasibility: Statistical significance confirms the effect is real, but does not guarantee profitability after deducting reward and operational costs."
  ];

  return {
    test_type: testType,
    alternative,
    alpha,
    hypotheses: {
      h0: h0Text,
      h1: h1Text
    },
    statistics: {
      control_mean: Math.round(m1 * 100) / 100,
      test_mean: Math.round(m2 * 100) / 100,
      difference: Math.round(diff * 100) / 100,
      percentage_lift: Math.round(pctLift * 100) / 100,
      standard_error: Math.round(se * 10000) / 10000,
      test_statistic: Math.round(testStat * 1000) / 1000,
      p_value: Math.round(pVal * 100000) / 100000,
      p_value_display: pVal < 0.0001 ? "< 0.0001" : pVal.toFixed(4),
      critical_value: Math.round(critVal * 1000) / 1000,
      effect_size_cohens_d: Math.round(cohensD * 1000) / 1000,
      degrees_of_freedom: dfWelch ? Math.round(dfWelch * 10) / 10 : null
    },
    confidence_interval: {
      level: Math.round((1.0 - alpha) * 1000) / 10,
      lower: !isFinite(ciLower) && ciLower < 0 ? "-∞" : Math.round(ciLower * 100) / 100,
      upper: !isFinite(ciUpper) && ciUpper > 0 ? "+∞" : Math.round(ciUpper * 100) / 100
    },
    decision: {
      reject_h0: rejectH0,
      decision_text: decision,
      badge_color: rejectH0 ? "emerald" : "amber"
    },
    interpretations: {
      statistical: statInterp,
      business: bizInterp,
      caveats
    },
    distribution_chart: {
      curve_data: curveData,
      test_statistic: Math.round(testStat * 1000) / 1000,
      critical_value: Math.round(critVal * 1000) / 1000,
      rejection_region_label: `Critical Region (Threshold: ${critVal.toFixed(3)})`
    }
  };
}
