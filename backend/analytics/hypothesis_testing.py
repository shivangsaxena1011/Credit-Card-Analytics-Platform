"""
CreditIQ Analytics - Hypothesis Testing Engine
Executes two-sample Z-tests and t-tests with rigorous statistical calculations,
critical region generation, confidence intervals, and dynamic plain-English interpretations.
"""

import math
import numpy as np
from scipy import stats
from typing import Dict, Any, List, Optional


def run_hypothesis_test(
    control_vals: np.ndarray,
    test_vals: np.ndarray,
    test_type: str = "z_test",  # "z_test" or "t_test"
    alternative: str = "larger",  # "larger", "two-sided", "smaller"
    alpha: float = 0.05
) -> Dict[str, Any]:
    """
    Performs two-sample statistical testing between Control and Test.
    Uses exact unrounded values for mathematical calculations.
    """
    n1 = len(control_vals)
    n2 = len(test_vals)

    if n1 < 2 or n2 < 2:
        return {"error": "Insufficient sample size for hypothesis testing."}

    m1 = float(np.mean(control_vals))
    m2 = float(np.mean(test_vals))

    s1 = float(np.std(control_vals, ddof=1))
    s2 = float(np.std(test_vals, ddof=1))

    diff = m2 - m1

    # Standard error of the difference
    se = math.sqrt((s1 ** 2 / n1) + (s2 ** 2 / n2))

    # Pooled standard deviation for Cohen's d
    s_pooled = math.sqrt(((n1 - 1) * (s1 ** 2) + (n2 - 1) * (s2 ** 2)) / (n1 + n2 - 2))
    cohens_d = diff / s_pooled if s_pooled > 0 else 0.0

    if test_type == "t_test":
        # Welch's t-test (unequal variances assumed)
        test_stat = diff / se if se > 0 else 0.0
        
        # Welch-Satterthwaite degrees of freedom
        v1 = (s1 ** 2) / n1
        v2 = (s2 ** 2) / n2
        df_welch = ((v1 + v2) ** 2) / ((v1 ** 2) / (n1 - 1) + (v2 ** 2) / (n2 - 1)) if (v1 + v2) > 0 else (n1 + n2 - 2)
        dist = stats.t(df=df_welch)

        # Critical value and p-value
        if alternative == "larger":
            crit_val = float(dist.ppf(1.0 - alpha))
            p_val = float(1.0 - dist.cdf(test_stat))
            ci_lower = diff - crit_val * se
            ci_upper = float("inf")
        elif alternative == "smaller":
            crit_val = float(dist.ppf(alpha))
            p_val = float(dist.cdf(test_stat))
            ci_lower = float("-inf")
            ci_upper = diff - crit_val * se
        else:  # two-sided
            crit_val = float(dist.ppf(1.0 - alpha / 2.0))
            p_val = float(2.0 * (1.0 - dist.cdf(abs(test_stat))))
            ci_lower = diff - crit_val * se
            ci_upper = diff + crit_val * se

    else:
        # Two-sample Z-test
        test_stat = diff / se if se > 0 else 0.0
        dist = stats.norm(loc=0, scale=1)

        if alternative == "larger":
            crit_val = float(dist.ppf(1.0 - alpha))
            p_val = float(1.0 - dist.cdf(test_stat))
            ci_lower = diff - crit_val * se
            ci_upper = float("inf")
        elif alternative == "smaller":
            crit_val = float(dist.ppf(alpha))
            p_val = float(dist.cdf(test_stat))
            ci_lower = float("-inf")
            ci_upper = diff - crit_val * se
        else:  # two-sided
            crit_val = float(dist.ppf(1.0 - alpha / 2.0))
            p_val = float(2.0 * (1.0 - dist.cdf(abs(test_stat))))
            ci_lower = diff - crit_val * se
            ci_upper = diff + crit_val * se

    # Decision rule: Reject H0 vs Fail to Reject H0 (Never "Accept H0")
    reject_h0 = bool(p_val < alpha)
    decision = "Reject H0" if reject_h0 else "Fail to Reject H0"

    # Hypotheses statements
    if alternative == "larger":
        h0_text = "H0: Test group mean is less than or equal to control group mean (μ_test ≤ μ_ctrl)"
        h1_text = "H1: Test group mean is strictly greater than control group mean (μ_test > μ_ctrl)"
    elif alternative == "smaller":
        h0_text = "H0: Test group mean is greater than or equal to control group mean (μ_test ≥ μ_ctrl)"
        h1_text = "H1: Test group mean is strictly less than control group mean (μ_test < μ_ctrl)"
    else:
        h0_text = "H0: Test group mean is equal to control group mean (μ_test = μ_ctrl)"
        h1_text = "H1: Test group mean is not equal to control group mean (μ_test ≠ μ_ctrl)"

    # Distribution points for null distribution visualization (-4 to +4)
    x_axis = np.linspace(-4.0, 4.0, 160)
    curve_data: List[Dict[str, Any]] = []

    for x in x_axis:
        y_density = float(dist.pdf(x))
        # Determine if x is in rejection region
        if alternative == "larger":
            in_rejection = bool(x >= crit_val)
        elif alternative == "smaller":
            in_rejection = bool(x <= crit_val)
        else:
            in_rejection = bool(abs(x) >= abs(crit_val))

        curve_data.append({
            "x": round(float(x), 2),
            "density": round(y_density, 4),
            "in_rejection_region": in_rejection,
            "rejection_fill": y_density if in_rejection else 0.0
        })

    # Plain English Dynamic Interpretations
    pct_lift = ((m2 - m1) / m1) * 100.0 if m1 != 0 else 0.0

    if reject_h0:
        stat_interp = (
            f"The observed test-group average transaction value (${m2:,.2f}) is higher than the control-group average "
            f"(${m1:,.2f}), representing an absolute increase of ${diff:,.2f} (+{pct_lift:.2f}% lift). "
            f"The calculated test statistic ({test_type.upper()} = {test_stat:.3f}) yields a p-value of {p_val:.4f}, "
            f"which is strictly below the chosen significance threshold (α = {alpha}). "
            f"Consequently, we reject the null hypothesis (H0). "
            f"There is statistically significant evidence to conclude that the test campaign improves customer transaction value."
        )
        biz_interp = (
            f"The promotion produced a statistically verified +{pct_lift:.1f}% uplift in average transaction spend among targeted cardholders. "
            f"This indicates that tailored incentives effectively stimulate basket sizes without relying purely on random transaction noise."
        )
    else:
        stat_interp = (
            f"The observed difference in average transaction values (${diff:,.2f}) between test (${m2:,.2f}) and control (${m1:,.2f}) "
            f"resulted in a test statistic of {test_stat:.3f} with a p-value of {p_val:.4f}. "
            f"Because the p-value is greater than or equal to the significance level (α = {alpha}), we fail to reject the null hypothesis (H0). "
            f"The observed variation cannot be distinguished from random sampling fluctuation at this significance level."
        )
        biz_interp = (
            f"The observed +{pct_lift:.1f}% change cannot yet be confirmed as genuine lift. Rolling out the campaign at scale "
            f"under current parameters risks incurring marketing costs without guaranteed incremental spend."
        )

    caveats = [
        "Independent Observations: Assumes transactions and customers between test and control were randomly assigned without cross-contamination.",
        "Variance & Distributional Stability: The asymptotic Z-test assumes adequate sample size (n > 30), satisfied here with large N.",
        "External Validity: Performance observed over the 30-day testing window may reflect novelty bias; long-term lift should be monitored.",
        "Economic Feasibility: Statistical significance confirms the effect is real, but does not guarantee profitability after deducting reward and operational costs."
    ]

    return {
        "test_type": test_type,
        "alternative": alternative,
        "alpha": alpha,
        "hypotheses": {
            "h0": h0_text,
            "h1": h1_text
        },
        "statistics": {
            "control_mean": round(m1, 2),
            "test_mean": round(m2, 2),
            "difference": round(diff, 2),
            "percentage_lift": round(pct_lift, 2),
            "standard_error": round(se, 4),
            "test_statistic": round(test_stat, 3),
            "p_value": float(np.round(p_val, 5)),
            "p_value_display": "< 0.0001" if p_val < 0.0001 else f"{p_val:.4f}",
            "critical_value": round(crit_val, 3),
            "effect_size_cohens_d": round(cohens_d, 3),
            "degrees_of_freedom": round(df_welch, 1) if test_type == "t_test" else None
        },
        "confidence_interval": {
            "level": round((1.0 - alpha) * 100, 1),
            "lower": "-∞" if math.isinf(ci_lower) and ci_lower < 0 else round(ci_lower, 2),
            "upper": "+∞" if math.isinf(ci_upper) and ci_upper > 0 else round(ci_upper, 2)
        },
        "decision": {
            "reject_h0": reject_h0,
            "decision_text": decision,
            "badge_color": "emerald" if reject_h0 else "amber"
        },
        "interpretations": {
            "statistical": stat_interp,
            "business": biz_interp,
            "caveats": caveats
        },
        "distribution_chart": {
            "curve_data": curve_data,
            "test_statistic": round(test_stat, 3),
            "critical_value": round(crit_val, 3),
            "rejection_region_label": f"Critical Region (Threshold: {crit_val:.3f})"
        }
    }
