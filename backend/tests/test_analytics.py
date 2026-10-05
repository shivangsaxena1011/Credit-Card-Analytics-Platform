"""
CreditIQ Analytics - Comprehensive Statistical & Unit Tests
Verifies dataset generation, cleaning pipeline, segmentation, target scoring,
power calculation, and hypothesis testing against trusted SciPy/Statsmodels formulas.
"""

import math
import numpy as np
import pandas as pd
import pytest
from scipy import stats
from statsmodels.stats.power import TTestIndPower

from backend.analytics.data_generator import generate_synthetic_data
from backend.analytics.data_quality import inspect_data_quality
from backend.analytics.preprocessing import run_cleaning_pipeline
from backend.analytics.segmentation import segment_customers
from backend.analytics.target_scoring import evaluate_target_segments, min_max_normalize
from backend.analytics.experiment import analyze_experiment
from backend.analytics.power_analysis import calculate_power_and_sample_size
from backend.analytics.hypothesis_testing import run_hypothesis_test


def test_data_generation_and_dirty_injection():
    """Verify synthetic dataset sizes and controlled data quality flaws."""
    data = generate_synthetic_data(seed=123, n_customers=1000, n_transactions=10000)
    df_cust = data["customers"]
    df_credit = data["credit_profiles"]
    df_txn = data["transactions"]
    df_exp = data["experiment"]

    assert len(df_cust) == 1000
    assert len(df_credit) > 1000  # Duplicates included
    assert len(df_txn) == 10000
    assert len(df_exp) > 0

    # Verify dirty data presence
    assert df_cust["annual_income"].isna().sum() > 0
    assert ((df_cust["age"] < 15) | (df_cust["age"] > 80)).sum() > 0
    assert df_credit["cust_id"].duplicated().sum() > 0
    assert df_credit["credit_limit"].isna().sum() > 0
    assert (df_txn["tran_amount"] == 0).sum() > 0


def test_data_quality_audit():
    """Verify data quality scoring and issues table generation."""
    data = generate_synthetic_data(seed=42, n_customers=1000, n_transactions=15000)
    quality = inspect_data_quality(data)

    assert 50.0 <= quality["quality_score"] <= 100.0
    assert quality["total_missing_values"] > 0
    assert quality["total_duplicates"] > 0
    assert quality["total_anomalies"] > 0
    assert len(quality["issues_table"]) >= 5


def test_preprocessing_and_cleaning_pipeline():
    """Verify cleaning logic: age validation, income imputation, deduplication, debt cap, zero txn."""
    data = generate_synthetic_data(seed=42, n_customers=1000, n_transactions=15000)
    cleaned, report = run_cleaning_pipeline(data)

    c_cust = cleaned["customers"]
    c_credit = cleaned["credit_profiles"]
    c_txn = cleaned["transactions"]

    # 1. Invalid ages resolved
    assert ((c_cust["age"] < 15) | (c_cust["age"] > 80)).sum() == 0

    # 2. Missing income imputed
    assert c_cust["annual_income"].isna().sum() == 0

    # 3. Credit duplicates deduplicated
    assert c_credit["cust_id"].duplicated().sum() == 0

    # 4. Missing credit limits imputed
    assert c_credit["credit_limit"].isna().sum() == 0

    # 5. Debt <= credit limit
    assert (c_credit["outstanding_debt"] > c_credit["credit_limit"]).sum() == 0

    # 6. Zero transactions eliminated
    assert (c_txn["tran_amount"] == 0).sum() == 0

    # 7. Quality score improved
    assert report["after_quality_score"] > report["before_quality_score"]
    assert len(report["comparison_table"]) >= 8


def test_segmentation():
    """Verify age segmentation calculations."""
    data = generate_synthetic_data(seed=42, n_customers=1000, n_transactions=15000)
    cleaned, _ = run_cleaning_pipeline(data)

    seg_res = segment_customers(cleaned["customers"], cleaned["credit_profiles"], cleaned["transactions"])
    segments = seg_res["segments"]

    assert len(segments) == 3
    total_cust_sum = sum(s["customer_count"] for s in segments)
    assert total_cust_sum == 1000

    for s in segments:
        assert s["avg_income"] > 0
        assert s["avg_credit_score"] > 300
        assert s["credit_card_payment_share"] >= 0


def test_target_scoring_engine():
    """Verify target segment scoring and dynamic narrative generation."""
    data = generate_synthetic_data(seed=42, n_customers=1000, n_transactions=15000)
    cleaned, _ = run_cleaning_pipeline(data)
    seg_res = segment_customers(cleaned["customers"], cleaned["credit_profiles"], cleaned["transactions"])

    target_res = evaluate_target_segments(seg_res["segments"])
    ranked = target_res["ranked_segments"]

    assert len(ranked) == 3
    # Check that highest score is first
    assert ranked[0]["opportunity_score"] >= ranked[1]["opportunity_score"]

    recommended = target_res["recommended_segment"]
    assert "opportunity_narrative" in recommended
    assert len(recommended["opportunity_narrative"]) > 50
    assert "18–25" in recommended["opportunity_narrative"] or "26–48" in recommended["opportunity_narrative"]


def test_power_analysis():
    """Verify sample size calculation against statsmodels TTestIndPower."""
    power_res = calculate_power_and_sample_size(alpha=0.05, power=0.80, effect_size=0.20, alternative="larger")
    req_n = power_res["required_sample_per_group"]

    # statsmodels benchmark
    stat_power = TTestIndPower()
    expected_n = int(math.ceil(stat_power.solve_power(effect_size=0.20, power=0.80, alpha=0.05, alternative="larger")))
    
    assert abs(req_n - expected_n) <= 1  # within 1 for rounding
    assert len(power_res["sensitivity_table"]) == 7


def test_hypothesis_testing_z_and_t_test():
    """Verify hypothesis testing calculations against SciPy standard formulas."""
    rng = np.random.default_rng(999)
    ctrl = rng.normal(loc=140.0, scale=35.0, size=1000)
    test = rng.normal(loc=155.0, scale=36.0, size=1000)

    # Z-test
    res_z = run_hypothesis_test(ctrl, test, test_type="z_test", alternative="larger", alpha=0.05)
    assert res_z["decision"]["decision_text"] == "Reject H0"
    assert res_z["statistics"]["p_value"] < 0.05
    assert res_z["statistics"]["percentage_lift"] > 0

    # Compare with manual Z-calculation
    se = math.sqrt(np.var(ctrl, ddof=1) / 1000 + np.var(test, ddof=1) / 1000)
    expected_z = (np.mean(test) - np.mean(ctrl)) / se
    assert abs(res_z["statistics"]["test_statistic"] - expected_z) < 1e-2

    # t-test (Welch)
    res_t = run_hypothesis_test(ctrl, test, test_type="t_test", alternative="larger", alpha=0.05)
    t_stat, p_val = stats.ttest_ind(test, ctrl, equal_var=False, alternative="greater")
    assert abs(res_t["statistics"]["test_statistic"] - t_stat) < 1e-2
    assert abs(res_t["statistics"]["p_value"] - p_val) < 1e-3


def test_experiment_percentage_lift():
    """Verify exact formula for percentage difference."""
    rng = np.random.default_rng(42)
    df_exp = pd.DataFrame({
        "experiment_date": ["2025-09-01"] * 20,
        "group": ["Control"] * 10 + ["Test"] * 10,
        "customer_id": [f"ID{i}" for i in range(20)],
        "metric_value": [100.0] * 10 + [110.0] * 10
    })
    exp_res = analyze_experiment(df_exp)
    assert exp_res["comparison"]["percentage_lift"] == 10.0
    assert exp_res["comparison"]["absolute_difference"] == 10.0
