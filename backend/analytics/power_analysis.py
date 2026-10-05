"""
CreditIQ Analytics - Statistical Power & Sample Size Calculator
Computes sample size requirements, power curves, and sensitivity tables
using rigorous statsmodels / SciPy algorithms.
"""

import math
import numpy as np
from scipy import stats
from statsmodels.stats.power import TTestIndPower
from typing import Dict, Any, List


def calculate_power_and_sample_size(
    alpha: float = 0.05,
    power: float = 0.80,
    effect_size: float = 0.20,
    alternative: str = "larger",  # "larger", "two-sided", "smaller"
    ratio: float = 1.0
) -> Dict[str, Any]:
    """
    Computes required sample size per group for two-sample testing,
    accompanied by an effect-size sensitivity grid and power curves.
    """
    # Map alternative for statsmodels TTestIndPower
    # statsmodels expects 'two-sided', 'larger', 'smaller'
    stat_alt = "larger" if alternative in ["larger", "one-sided-greater"] else ("two-sided" if alternative == "two-sided" else "smaller")

    ttest_power = TTestIndPower()

    try:
        req_sample_size_raw = ttest_power.solve_power(
            effect_size=abs(effect_size),
            power=power,
            alpha=alpha,
            ratio=ratio,
            alternative=stat_alt
        )
        req_sample_size = int(math.ceil(req_sample_size_raw))
    except Exception:
        # Fallback normal approximation if solver has numerical convergence issue
        z_alpha = stats.norm.ppf(1 - alpha) if stat_alt != "two-sided" else stats.norm.ppf(1 - alpha / 2)
        z_beta = stats.norm.ppf(power)
        req_sample_size = int(math.ceil(2 * ((z_alpha + z_beta) / abs(effect_size)) ** 2))

    # Effect Size Sensitivity Grid: 0.10, 0.20, 0.30, 0.40, 0.50, 0.70, 1.00
    sensitivity_effects = [0.10, 0.20, 0.30, 0.40, 0.50, 0.70, 1.00]
    sensitivity_table: List[Dict[str, Any]] = []

    for d in sensitivity_effects:
        try:
            n_raw = ttest_power.solve_power(
                effect_size=d,
                power=power,
                alpha=alpha,
                ratio=ratio,
                alternative=stat_alt
            )
            n_group = int(math.ceil(n_raw))
        except Exception:
            z_a = stats.norm.ppf(1 - alpha) if stat_alt != "two-sided" else stats.norm.ppf(1 - alpha / 2)
            z_b = stats.norm.ppf(power)
            n_group = int(math.ceil(2 * ((z_a + z_b) / d) ** 2))

        feasibility = "Very High" if n_group < 500 else ("High" if n_group < 1500 else ("Moderate" if n_group < 5000 else "Resource-Intensive"))
        sensitivity_table.append({
            "effect_size": d,
            "effect_label": "Very Small" if d <= 0.1 else ("Small (Cohen's d=0.2)" if d <= 0.2 else ("Medium (Cohen's d=0.5)" if d <= 0.5 else "Large (Cohen's d>=0.8)")),
            "required_sample_per_group": n_group,
            "total_sample_required": n_group * 2,
            "feasibility": feasibility
        })

    # High-resolution Power Curve for chart (Effect Size vs Required Sample Size)
    curve_effects = np.linspace(0.08, 1.0, 30)
    power_curve: List[Dict[str, Any]] = []
    for d in curve_effects:
        try:
            n_val = ttest_power.solve_power(effect_size=float(d), power=power, alpha=alpha, ratio=ratio, alternative=stat_alt)
            power_curve.append({
                "effect_size": round(float(d), 2),
                "required_sample": min(10000, int(math.ceil(n_val)))
            })
        except Exception:
            pass

    # Varying Power curve for fixed effect size
    varying_powers = [0.60, 0.70, 0.80, 0.85, 0.90, 0.95]
    power_vs_sample: List[Dict[str, Any]] = []
    for p_val in varying_powers:
        try:
            n_p = ttest_power.solve_power(effect_size=effect_size, power=p_val, alpha=alpha, ratio=ratio, alternative=stat_alt)
            power_vs_sample.append({
                "power": int(p_val * 100),
                "required_sample": int(math.ceil(n_p))
            })
        except Exception:
            pass

    return {
        "inputs": {
            "alpha": alpha,
            "power": power,
            "effect_size": effect_size,
            "alternative": alternative,
            "groups": 2
        },
        "required_sample_per_group": req_sample_size,
        "total_required_sample": req_sample_size * 2,
        "interpretation": "Smaller expected effects generally require larger samples to detect reliably.",
        "sensitivity_table": sensitivity_table,
        "power_curve": power_curve,
        "power_vs_sample": power_vs_sample
    }
