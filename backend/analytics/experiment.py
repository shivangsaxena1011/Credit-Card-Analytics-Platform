"""
CreditIQ Analytics - Campaign Experiment Engine
Processes A/B test campaign data, computes group summary statistics,
daily progression trends, distribution binnings, segment breakdowns, and percentage lift.
"""

import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List, Optional


def analyze_experiment(
    df_exp: pd.DataFrame,
    control_label: str = "Control",
    test_label: str = "Test",
    metric_name: str = "Average Transaction Value",
    segment_filter: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes rigorous descriptive statistics, distributions, daily trends,
    and lift metrics for the A/B testing experiment.
    """
    if df_exp is None or df_exp.empty:
        return {"error": "Experiment dataset is empty"}

    df_active = df_exp.copy()

    # Optional segment-level drill-down
    if segment_filter and segment_filter != "All" and "segment_name" in df_active.columns:
        df_active = df_active[df_active["segment_name"] == segment_filter]
        if df_active.empty:
            df_active = df_exp.copy()

    # Separate control and test
    control_df = df_active[df_active["group"] == control_label]
    test_df = df_active[df_active["group"] == test_label]

    if control_df.empty or test_df.empty:
        groups = df_active["group"].unique()
        if len(groups) >= 2:
            control_label = str(groups[0])
            test_label = str(groups[1])
            control_df = df_active[df_active["group"] == control_label]
            test_df = df_active[df_active["group"] == test_label]

    ctrl_vals = pd.to_numeric(control_df["metric_value"], errors="coerce").dropna().values
    test_vals = pd.to_numeric(test_df["metric_value"], errors="coerce").dropna().values

    n_ctrl = len(ctrl_vals)
    n_test = len(test_vals)

    if n_ctrl == 0 or n_test == 0:
        return {"error": "Insufficient valid data points in one or both experiment groups."}

    ctrl_mean = float(np.mean(ctrl_vals))
    test_mean = float(np.mean(test_vals))

    ctrl_med = float(np.median(ctrl_vals))
    test_med = float(np.median(test_vals))

    ctrl_std = float(np.std(ctrl_vals, ddof=1)) if n_ctrl > 1 else 0.0
    test_std = float(np.std(test_vals, ddof=1)) if n_test > 1 else 0.0

    ctrl_var = float(np.var(ctrl_vals, ddof=1)) if n_ctrl > 1 else 0.0
    test_var = float(np.var(test_vals, ddof=1)) if n_test > 1 else 0.0

    ctrl_min = float(np.min(ctrl_vals))
    test_min = float(np.min(test_vals))

    ctrl_max = float(np.max(ctrl_vals))
    test_max = float(np.max(test_vals))

    # Skewness
    ctrl_skew = float(stats.skew(ctrl_vals)) if (n_ctrl > 2 and ctrl_std > 1e-9) else 0.0
    test_skew = float(stats.skew(test_vals)) if (n_test > 2 and test_std > 1e-9) else 0.0

    # Lift calculations
    abs_diff = test_mean - ctrl_mean
    pct_lift = ((test_mean - ctrl_mean) / ctrl_mean) * 100.0 if ctrl_mean != 0 else 0.0

    # Quartiles for Box Plot representation
    ctrl_q1, ctrl_q3 = float(np.percentile(ctrl_vals, 25)), float(np.percentile(ctrl_vals, 75))
    test_q1, test_q3 = float(np.percentile(test_vals, 25)), float(np.percentile(test_vals, 75))

    # Daily trend calculation
    df_exp_copy = df_active.copy()
    df_exp_copy["metric_num"] = pd.to_numeric(df_exp_copy["metric_value"], errors="coerce")
    daily_grp = df_exp_copy.groupby(["experiment_date", "group"])["metric_num"].mean().unstack(fill_value=np.nan).reset_index()
    daily_grp = daily_grp.sort_values(by="experiment_date")

    daily_trend = []
    for _, row in daily_grp.iterrows():
        daily_trend.append({
            "date": str(row["experiment_date"]),
            "Control": round(float(row.get(control_label, np.nan)), 2) if pd.notna(row.get(control_label)) else None,
            "Test": round(float(row.get(test_label, np.nan)), 2) if pd.notna(row.get(test_label)) else None
        })

    # Segment breakdown if available
    segment_breakdown = []
    if "segment_name" in df_active.columns:
        seg_grp = df_exp_copy.groupby(["segment_name", "group"])["metric_num"].agg(["mean", "count"]).unstack()
        for seg_name in df_exp_copy["segment_name"].dropna().unique():
            try:
                c_m = float(seg_grp.loc[seg_name, ("mean", control_label)])
                t_m = float(seg_grp.loc[seg_name, ("mean", test_label)])
                lift_s = ((t_m - c_m) / c_m) * 100.0 if c_m > 0 else 0.0
                segment_breakdown.append({
                    "segment": str(seg_name),
                    "control_mean": round(c_m, 2),
                    "test_mean": round(t_m, 2),
                    "percentage_lift": round(lift_s, 2),
                    "control_count": int(seg_grp.loc[seg_name, ("count", control_label)]),
                    "test_count": int(seg_grp.loc[seg_name, ("count", test_label)])
                })
            except Exception:
                pass

    # Distribution histogram bins (combined min/max for aligned comparison)
    all_min = min(ctrl_min, test_min)
    all_max = max(ctrl_max, test_max)
    bins = np.linspace(all_min, all_max, 15)

    ctrl_counts, _ = np.histogram(ctrl_vals, bins=bins)
    test_counts, _ = np.histogram(test_vals, bins=bins)

    distribution_data = []
    for i in range(len(bins) - 1):
        bin_label = f"${bins[i]:.0f}-${bins[i+1]:.0f}"
        distribution_data.append({
            "bin": bin_label,
            "bin_center": round((bins[i] + bins[i+1]) / 2, 1),
            "Control": int(ctrl_counts[i]),
            "Test": int(test_counts[i])
        })

    return {
        "metric_name": metric_name,
        "segment_filter": segment_filter or "All",
        "control_group": {
            "label": control_label,
            "sample_size": n_ctrl,
            "mean": round(ctrl_mean, 2),
            "median": round(ctrl_med, 2),
            "std_dev": round(ctrl_std, 2),
            "variance": round(ctrl_var, 2),
            "skewness": round(ctrl_skew, 2),
            "min": round(ctrl_min, 2),
            "max": round(ctrl_max, 2),
            "q1": round(ctrl_q1, 2),
            "q3": round(ctrl_q3, 2),
            "raw_mean": ctrl_mean,
            "raw_std": ctrl_std
        },
        "test_group": {
            "label": test_label,
            "sample_size": n_test,
            "mean": round(test_mean, 2),
            "median": round(test_med, 2),
            "std_dev": round(test_std, 2),
            "variance": round(test_var, 2),
            "skewness": round(test_skew, 2),
            "min": round(test_min, 2),
            "max": round(test_max, 2),
            "q1": round(test_q1, 2),
            "q3": round(test_q3, 2),
            "raw_mean": test_mean,
            "raw_std": test_std
        },
        "comparison": {
            "absolute_difference": round(abs_diff, 2),
            "percentage_lift": round(pct_lift, 2),
            "raw_absolute_diff": abs_diff,
            "raw_percentage_lift": pct_lift
        },
        "daily_trend": daily_trend,
        "distribution": distribution_data,
        "segment_breakdown": segment_breakdown
    }
