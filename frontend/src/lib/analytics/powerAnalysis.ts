// Standard Normal Inverse CDF (Acklam approximation, accurate to 1.15e-9)
export function normPpf(p: number): number {
  if (p <= 0 || p >= 1) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }

  const a = [-3.969683028665376e+01,  2.209460984245205e+02, -2.759285104469687e+02,  1.383577518672690e+02, -3.066479806614716e+01,  2.506628277459239e+00];
  const b = [-5.447609879822406e+01,  1.615858368580409e+02, -1.556989798598866e+02,  6.680133369969700e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00,  4.374664141464968e+00,  2.938163982698783e+00];
  const d = [ 7.784695709041462e-03,  3.224671290700398e-01,  2.445134137142996e+00,  3.754408661907416e+00];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

// Standard Normal CDF
export function normCdf(x: number): number {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1.0 - prob : prob;
}

// Standard Normal PDF
export function normPdf(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export function calculatePowerAndSampleSize(
  alpha: number = 0.05,
  power: number = 0.80,
  effectSize: number = 0.20,
  alternative: string = "larger",
  ratio: number = 1.0
): any {
  const statAlt = alternative === "larger" || alternative === "one-sided-greater"
    ? "larger"
    : alternative === "two-sided" ? "two-sided" : "smaller";

  const zAlpha = statAlt === "two-sided" ? normPpf(1 - alpha / 2) : normPpf(1 - alpha);
  const zBeta = normPpf(power);
  const dAbs = Math.max(0.01, Math.abs(effectSize));

  // Two-sample t-test sample size with standard continuity adjustment
  const rawN = (1 + 1 / ratio) * Math.pow((zAlpha + zBeta) / dAbs, 2);
  // degrees of freedom adjustment for t-distribution approximation
  const reqSamplePerGroup = Math.ceil(rawN + 0.5 * Math.pow(zAlpha, 2));

  const sensitivityEffects = [0.10, 0.20, 0.30, 0.40, 0.50, 0.70, 1.00];
  const sensitivityTable = sensitivityEffects.map(d => {
    const rawVal = (1 + 1 / ratio) * Math.pow((zAlpha + zBeta) / d, 2);
    const nGroup = Math.ceil(rawVal + 0.5 * Math.pow(zAlpha, 2));
    const feasibility = nGroup < 500 ? "Very High" : (nGroup < 1500 ? "High" : (nGroup < 5000 ? "Moderate" : "Resource-Intensive"));
    const effectLabel = d <= 0.1 ? "Very Small" : (d <= 0.2 ? "Small (Cohen's d=0.2)" : (d <= 0.5 ? "Medium (Cohen's d=0.5)" : "Large (Cohen's d>=0.8)"));

    return {
      effect_size: d,
      effect_label: effectLabel,
      required_sample_per_group: nGroup,
      total_sample_required: nGroup * 2,
      feasibility
    };
  });

  // Power curve points (d vs sample size)
  const powerCurve = [];
  const minD = 0.08;
  const maxD = 1.0;
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const dVal = minD + (i / steps) * (maxD - minD);
    const nVal = (1 + 1 / ratio) * Math.pow((zAlpha + zBeta) / dVal, 2) + 0.5 * Math.pow(zAlpha, 2);
    powerCurve.push({
      effect_size: Math.round(dVal * 100) / 100,
      required_sample: Math.min(10000, Math.ceil(nVal))
    });
  }

  // Varying power vs sample size for fixed effect size
  const varyingPowers = [0.60, 0.70, 0.80, 0.85, 0.90, 0.95];
  const powerVsSample = varyingPowers.map(pVal => {
    const zB = normPpf(pVal);
    const nVal = (1 + 1 / ratio) * Math.pow((zAlpha + zB) / dAbs, 2) + 0.5 * Math.pow(zAlpha, 2);
    return {
      power: Math.round(pVal * 100),
      required_sample: Math.ceil(nVal)
    };
  });

  return {
    inputs: {
      alpha,
      power,
      effect_size: effectSize,
      alternative,
      groups: 2
    },
    required_sample_per_group: reqSamplePerGroup,
    total_required_sample: reqSamplePerGroup * 2,
    interpretation: "Smaller expected effects generally require larger samples to detect reliably.",
    sensitivity_table: sensitivityTable,
    power_curve: powerCurve,
    power_vs_sample: powerVsSample
  };
}
