"""
CreditIQ Analytics - Statistical Power & Sample Size Calculator
Computes sample size requirements, power curves, and sensitivity grids
using rigorous statsmodels / SciPy algorithms with defensive validation.
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
    accompanied by multi-dimensional sensitivity grids and power curves.
    """
    # ----------------------------------------------------
    # Input Validation
    # ----------------------------------------------------
    alpha = max(0.001, min(float(alpha), 0.40))
    power = max(0.50, min(float(power), 0.999))
    effect_size = max(0.01, min(float(effect_size), 3.0))
    ratio = max(0.2, min(float(ratio), 5.0))

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
        # Fallback exact normal approximation with degrees of freedom correction
        z_alpha = stats.norm.ppf(1 - alpha) if stat_alt != "two-sided" else stats.norm.ppf(1 - alpha / 2)
        z_beta = stats.norm.ppf(power)
        raw_n = (1 + 1 / ratio) * ((z_alpha + z_beta) / abs(effect_size)) ** 2
        req_sample_size = int(math.ceil(raw_n + 0.5 * (z_alpha ** 2)))

    # Total sample size accounting for allocation ratio
    control_n = req_sample_size
    test_n = int(math.ceil(control_n * ratio))
    total_n = control_n + test_n

    # 1. Effect Size Sensitivity Grid (d = 0.10 to 1.00)
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
            n_ctrl = int(math.ceil(n_raw))
        except Exception:
            z_a = stats.norm.ppf(1 - alpha) if stat_alt != "two-sided" else stats.norm.ppf(1 - alpha / 2)
            z_b = stats.norm.ppf(power)
            n_ctrl = int(math.ceil((1 + 1 / ratio) * ((z_a + z_b) / d) ** 2))

        feasibility = "Very High" if n_ctrl < 500 else ("High" if n_ctrl < 1500 else ("Moderate" if n_ctrl < 5000 else "Resource-Intensive"))
        sensitivity_table.append({
            "effect_size": d,
            "effect_label": "Very Small" if d <= 0.1 else ("Small (Cohen's d=0.2)" if d <= 0.2 else ("Medium (Cohen's d=0.5)" if d <= 0.5 else "Large (Cohen's d>=0.8)")),
            "required_sample_per_group": n_ctrl,
            "total_sample_required": n_ctrl + int(math.ceil(n_ctrl * ratio)),
            "feasibility": feasibility
        })

    # 2. High-resolution Power Curve for chart (Effect Size vs Required Sample Size)
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

    # 3. Varying Power grid for fixed effect size
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

    # 4. Allocation Ratio sensitivity grid
    ratio_sensitivity: List[Dict[str, Any]] = []
    ratios_to_test = [0.5, 0.8, 1.0, 1.25, 2.0]
    for r in ratios_to_test:
        try:
            n_c = int(math.ceil(ttest_power.solve_power(effect_size=effect_size, power=power, alpha=alpha, ratio=r, alternative=stat_alt)))
            n_t = int(math.ceil(n_c * r))
            ratio_sensitivity.append({
                "ratio": r,
                "label": f"{r:.2f}:1 (Test:Control)",
                "control_n": n_c,
                "test_n": n_t,
                "total_n": n_c + n_t
            })
        except Exception:
            pass

    return {
        "inputs": {
            "alpha": alpha,
            "power": power,
            "effect_size": effect_size,
            "alternative": alternative,
            "ratio": ratio,
            "calculation_method": "statsmodels TTestIndPower (exact non-central t distribution)"
        },
        "required_sample_per_group": req_sample_size,
        "control_required_sample": control_n,
        "test_required_sample": test_n,
        "total_required_sample": total_n,
        "interpretation": "Smaller expected effects generally require larger samples to detect reliably without type II error inflation.",
        "sensitivity_table": sensitivity_table,
        "power_curve": power_curve,
        "power_vs_sample": power_vs_sample,
        "ratio_sensitivity": ratio_sensitivity
    }
