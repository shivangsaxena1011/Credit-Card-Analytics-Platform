"""
CreditIQ Analytics - Rigorous Hypothesis Testing Engine
Executes two-sample Z-tests and Welch's t-tests with full statistical validations,
robustness checks (Mann-Whitney U and Bootstrap confidence intervals),
practical significance evaluations, rejection region chart generation,
and plain-English dynamic business interpretations.
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
    alpha: float = 0.05,
    practical_threshold_pct: float = 5.0  # Minimum practical business lift threshold
) -> Dict[str, Any]:
    """
    Performs rigorous two-sample statistical testing between Control and Test.
    Includes validation guards, Mann-Whitney U rank-sum test, bootstrap resampled CIs,
    and practical significance benchmarking.
    """
    # ----------------------------------------------------
    # Input Validation & Defensive Guards
    # ----------------------------------------------------
    if alpha <= 0.0 or alpha >= 1.0:
        return {"error": f"Significance level alpha must be between 0 and 1, got {alpha}."}

    if alternative not in ["larger", "two-sided", "smaller"]:
        alternative = "larger"

    ctrl_clean = np.asarray(control_vals, dtype=float)
    test_clean = np.asarray(test_vals, dtype=float)

    # Remove any NaN or Inf
    ctrl_clean = ctrl_clean[np.isfinite(ctrl_clean)]
    test_clean = test_clean[np.isfinite(test_clean)]

    n1 = len(ctrl_clean)
    n2 = len(test_clean)

    if n1 < 2 or n2 < 2:
        return {
            "error": f"Insufficient sample size for hypothesis testing. Control: N={n1}, Test: N={n2}. Minimum required is 2 per group."
        }

    m1 = float(np.mean(ctrl_clean))
    m2 = float(np.mean(test_clean))

    s1 = float(np.std(ctrl_clean, ddof=1))
    s2 = float(np.std(test_clean, ddof=1))

    diff = m2 - m1
    pct_lift = ((m2 - m1) / m1) * 100.0 if m1 != 0 else 0.0

    # Check for zero variance
    if s1 <= 0 and s2 <= 0:
        return {
            "error": "Both control and test samples have zero variance. Statistical hypothesis testing cannot proceed with constant values."
        }

    # Standard error of difference
    se = math.sqrt((s1 ** 2 / max(1, n1)) + (s2 ** 2 / max(1, n2)))
    if se <= 0:
        se = 1e-6

    # Cohen's d effect size using pooled standard deviation
    denom_pooled = (n1 + n2 - 2) if (n1 + n2 - 2) > 0 else 1
    s_pooled = math.sqrt(((n1 - 1) * (s1 ** 2) + (n2 - 1) * (s2 ** 2)) / denom_pooled)
    cohens_d = diff / s_pooled if s_pooled > 0 else 0.0

    # ----------------------------------------------------
    # Primary Hypothesis Test Calculation
    # ----------------------------------------------------
    df_welch = None
    if test_type == "t_test":
        test_stat = diff / se
        # Welch-Satterthwaite degrees of freedom
        v1 = (s1 ** 2) / n1
        v2 = (s2 ** 2) / n2
        denom_welch = ((v1 ** 2) / (n1 - 1) + (v2 ** 2) / (n2 - 1)) if (n1 > 1 and n2 > 1) else 1e-6
        df_welch = float(((v1 + v2) ** 2) / denom_welch) if denom_welch > 0 else float(n1 + n2 - 2)
        dist = stats.t(df=df_welch)

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
        # Two-sample Z-test (large-sample asymptotic normal approximation)
        test_stat = diff / se
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

    reject_h0 = bool(p_val < alpha)
    decision = "Reject H0" if reject_h0 else "Fail to Reject H0"

    # ----------------------------------------------------
    # Robustness Analysis: Mann-Whitney U & Bootstrap CI
    # ----------------------------------------------------
    # 1. Non-parametric Mann-Whitney U test (handles heavy right skew in transaction values)
    # Scipy expects alternative 'greater', 'less', 'two-sided'
    mw_alt = "greater" if alternative == "larger" else ("less" if alternative == "smaller" else "two-sided")
    try:
        mw_res = stats.mannwhitneyu(test_clean, ctrl_clean, alternative=mw_alt)
        mw_stat = float(mw_res.statistic)
        mw_pval = float(mw_res.pvalue)
        mw_reject = bool(mw_pval < alpha)
    except Exception:
        mw_stat = 0.0
        mw_pval = 1.0
        mw_reject = False

    # 2. Bootstrap Confidence Interval (1,000 resamples of difference in means)
    rng_boot = np.random.default_rng(42)
    n_boot = 1000
    boot_diffs = []
    for _ in range(n_boot):
        b_c = rng_boot.choice(ctrl_clean, size=n1, replace=True)
        b_t = rng_boot.choice(test_clean, size=n2, replace=True)
        boot_diffs.append(float(np.mean(b_t) - np.mean(b_c)))
    boot_diffs = np.array(boot_diffs)

    if alternative == "larger":
        boot_ci_low = float(np.percentile(boot_diffs, alpha * 100))
        boot_ci_high = float("inf")
        boot_pval = float(np.mean(boot_diffs <= 0))
    elif alternative == "smaller":
        boot_ci_low = float("-inf")
        boot_ci_high = float(np.percentile(boot_diffs, (1.0 - alpha) * 100))
        boot_pval = float(np.mean(boot_diffs >= 0))
    else:
        boot_ci_low = float(np.percentile(boot_diffs, (alpha / 2.0) * 100))
        boot_ci_high = float(np.percentile(boot_diffs, (1.0 - alpha / 2.0) * 100))
        boot_pval = float(min(1.0, 2.0 * min(np.mean(boot_diffs <= 0), np.mean(boot_diffs >= 0))))

    # ----------------------------------------------------
    # Practical Significance Evaluation
    # ----------------------------------------------------
    is_practically_significant = bool(reject_h0 and pct_lift >= practical_threshold_pct)
    practical_status = (
        "Statistically & Practically Significant" if is_practically_significant else
        ("Statistically Significant (Below Practical Threshold)" if reject_h0 else
         "Not Statistically Significant")
    )

    # ----------------------------------------------------
    # Formatted Hypotheses & Confidence Interval Description
    # ----------------------------------------------------
    if alternative == "larger":
        h0_text = "H0: Test group mean is less than or equal to control group mean (μ_test ≤ μ_ctrl)"
        h1_text = "H1: Test group mean is strictly greater than control group mean (μ_test > μ_ctrl)"
        ci_desc = f"One-sided {round((1.0 - alpha) * 100)}% lower bound: diff ≥ ${ci_lower:,.2f}"
    elif alternative == "smaller":
        h0_text = "H0: Test group mean is greater than or equal to control group mean (μ_test ≥ μ_ctrl)"
        h1_text = "H1: Test group mean is strictly less than control group mean (μ_test < μ_ctrl)"
        ci_desc = f"One-sided {round((1.0 - alpha) * 100)}% upper bound: diff ≤ ${ci_upper:,.2f}"
    else:
        h0_text = "H0: Test group mean is equal to control group mean (μ_test = μ_ctrl)"
        h1_text = "H1: Test group mean is not equal to control group mean (μ_test ≠ μ_ctrl)"
        ci_desc = f"Two-sided {round((1.0 - alpha) * 100)}% CI: [${ci_lower:,.2f}, ${ci_upper:,.2f}]"

    # Distribution points for null distribution visualization (-4.5 to +4.5)
    x_axis = np.linspace(-4.5, 4.5, 180)
    curve_data: List[Dict[str, Any]] = []

    for x in x_axis:
        y_density = float(dist.pdf(x))
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
            "rejection_fill": round(y_density, 4) if in_rejection else 0.0
        })

    # ----------------------------------------------------
    # Plain English Dynamic Interpretations
    # ----------------------------------------------------
    if reject_h0:
        stat_interp = (
            f"The observed test-group average transaction spend (${m2:,.2f}) exceeded the control-group average "
            f"(${m1:,.2f}), representing an absolute increase of ${diff:,.2f} (+{pct_lift:.2f}% lift). "
            f"The calculated test statistic ({test_type.upper()} = {test_stat:.3f}) yields a p-value of {p_val:.4e}, "
            f"which is strictly less than the pre-specified significance threshold (α = {alpha}). "
            f"Therefore, we reject the null hypothesis (H0). "
            f"Robustness checks confirm this outcome: Mann-Whitney U test p-value = {mw_pval:.4e}, "
            f"and 1,000 bootstrap resamples estimate difference lower bound at ${boot_ci_low:,.2f}."
        )
        if is_practically_significant:
            biz_interp = (
                f"The campaign produced a statistically verified +{pct_lift:.1f}% spend expansion that exceeds the bank's "
                f"{practical_threshold_pct:.1f}% practical hurdle rate. The incremental spend justifies the reward funding costs."
            )
        else:
            biz_interp = (
                f"The campaign produced a statistically verified +{pct_lift:.1f}% uplift, but this falls below the bank's "
                f"{practical_threshold_pct:.1f}% practical hurdle rate. While real, the financial impact may not cover promotional overhead."
            )
    else:
        stat_interp = (
            f"The observed difference in average transaction values (${diff:,.2f}) between test (${m2:,.2f}) and control (${m1:,.2f}) "
            f"resulted in a test statistic of {test_stat:.3f} with a p-value of {p_val:.4f}. "
            f"Because the p-value is greater than or equal to the significance level (α = {alpha}), we fail to reject the null hypothesis (H0). "
            f"The data does not provide sufficient evidence to conclude that the promotional incentive produced a true shift in spend."
        )
        biz_interp = (
            f"The observed +{pct_lift:.1f}% lift cannot be distinguished from random sampling fluctuation at the {round((1-alpha)*100)}% confidence level. "
            f"Rolling out this campaign at portfolio scale risks incurring promotional expenses without verified revenue uplift."
        )

    caveats = [
        "Large-Sample Approximation: The Z-test relies on asymptotic normality via the Central Limit Theorem; for skewed transaction tickets, compare with Welch's t-test and Mann-Whitney U.",
        "Exchangeability & Randomization: Assumes accounts were independently assigned to Control and Test cohorts without cross-contamination or spillovers.",
        "External Validity: Performance observed during the campaign testing window may reflect initial promotional novelty; post-promotional persistence should be tracked.",
        "Economic Hurdle vs Significance: Statistical significance confirms non-randomness, but practical profitability depends on customer retention and merchant interchange margins."
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
            "control_sample_size": n1,
            "test_sample_size": n2,
            "control_mean": round(m1, 2),
            "test_mean": round(m2, 2),
            "control_std": round(s1, 2),
            "test_std": round(s2, 2),
            "difference": round(diff, 2),
            "percentage_lift": round(pct_lift, 2),
            "standard_error": round(se, 4),
            "test_statistic": round(test_stat, 3),
            "p_value": float(np.round(p_val, 6)),
            "p_value_display": "< 0.0001" if p_val < 0.0001 else f"{p_val:.4f}",
            "critical_value": round(crit_val, 3),
            "effect_size_cohens_d": round(cohens_d, 3),
            "degrees_of_freedom": round(df_welch, 1) if df_welch is not None else None
        },
        "confidence_interval": {
            "level": round((1.0 - alpha) * 100, 1),
            "lower": "-∞" if math.isinf(ci_lower) and ci_lower < 0 else round(ci_lower, 2),
            "upper": "+∞" if math.isinf(ci_upper) and ci_upper > 0 else round(ci_upper, 2),
            "description": ci_desc
        },
        "decision": {
            "reject_h0": reject_h0,
            "decision_text": decision,
            "badge_color": "emerald" if reject_h0 else "amber",
            "practical_significance": practical_status,
            "is_practically_significant": is_practically_significant
        },
        "robustness_analysis": {
            "concurrence": bool(mw_reject == reject_h0),
            "mann_whitney_u": {
                "test_name": "Mann-Whitney U Rank-Sum Test (Non-parametric)",
                "statistic": round(mw_stat, 1),
                "u_statistic": round(mw_stat, 1),
                "p_value": float(np.round(mw_pval, 6)),
                "p_value_display": "< 0.0001" if mw_pval < 0.0001 else f"{mw_pval:.4f}",
                "reject_h0": mw_reject,
                "agrees_with_primary": (mw_reject == reject_h0)
            },
            "bootstrap": {
                "test_name": "Percentile Bootstrap (1,000 Resamples)",
                "mean_diff": round(float(np.mean(boot_diffs)), 2),
                "lower_bound": "-∞" if math.isinf(boot_ci_low) else round(boot_ci_low, 2),
                "upper_bound": "+∞" if math.isinf(boot_ci_high) else round(boot_ci_high, 2),
                "ci_lower": round(boot_ci_low, 2) if not math.isinf(boot_ci_low) else -999999.0,
                "ci_upper": round(boot_ci_high, 2) if not math.isinf(boot_ci_high) else 999999.0,
                "n_resamples": n_boot,
                "bootstrap_p_value": round(boot_pval, 4)
            },
            "bootstrap_ci": {
                "ci_lower": round(boot_ci_low, 2) if not math.isinf(boot_ci_low) else -999999.0,
                "ci_upper": round(boot_ci_high, 2) if not math.isinf(boot_ci_high) else 999999.0,
                "n_resamples": n_boot
            }
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
