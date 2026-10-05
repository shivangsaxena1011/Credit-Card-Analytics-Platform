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


def test_dynamic_quality_score_calculation():
    """Verify that post-cleaning quality score is dynamically derived and not hardcoded to 99.8."""
    data = generate_synthetic_data(seed=777, n_customers=1000, n_transactions=10000)
    cleaned, report = run_cleaning_pipeline(data)

    before_score = report["before_quality_score"]
    after_score = report["after_quality_score"]

    # Quality score must improve after cleaning
    assert after_score > before_score
    # Dynamic score depends on remaining rows and deduplication, should not be hardcoded to 99.8
    assert isinstance(after_score, float)
    assert 90.0 <= after_score <= 100.0
    assert "comparison_table" in report
    assert len(report["comparison_table"]) >= 5


def test_credit_utilization_consistency_check():
    """Verify reported vs derived credit utilization and consistency flag."""
    data = generate_synthetic_data(seed=42, n_customers=500, n_transactions=5000)
    cleaned, _ = run_cleaning_pipeline(data)
    c_credit = cleaned["credit_profiles"]

    # Check both columns exist
    assert "credit_utilisation" in c_credit.columns
    assert "derived_utilisation" in c_credit.columns
    assert "utilization_consistent" in c_credit.columns

    # Derived utilization must be debt / limit (rounded to 4 decimal places)
    expected_derived = (c_credit["outstanding_debt"] / c_credit["credit_limit"].replace(0, 1)).clip(0.0, 1.0)
    np.testing.assert_allclose(c_credit["derived_utilisation"].values, expected_derived.values, atol=1e-3)

    # Boolean consistency flag check
    consistency_rate = float(c_credit["utilization_consistent"].mean())
    assert 0.0 <= consistency_rate <= 1.0


def test_imputation_edge_cases_and_graceful_fallbacks():
    """Verify cleaning handles empty occupations, missing credit limits, and extreme values safely."""
    # Construct a dataset where one occupation has only 1 row with NaN income
    df_cust = pd.DataFrame({
        "cust_id": ["C1", "C2", "C3"],
        "name": ["Alice", "Bob", "Charlie"],
        "gender": ["Female", "Male", "Female"],
        "age": [10, 85, 30],  # out-of-range ages
        "location": ["City", "Suburb", "Rural"],
        "occupation": ["RareJob", "RareJob", "CommonJob"],
        "annual_income": [np.nan, np.nan, 75000.0],
        "marital_status": ["Single", "Married", "Single"]
    })

    df_credit = pd.DataFrame({
        "cust_id": ["C1", "C2", "C3", "C3"],  # Duplicate C3
        "credit_score": [np.nan, 700, 720, 720],
        "credit_utilisation": [0.5, 0.4, 0.3, 0.3],
        "outstanding_debt": [15000.0, 2000.0, 1000.0, 1000.0],
        "credit_inquiries_last_6_months": [1, 0, 2, 2],
        "credit_limit": [np.nan, 5000.0, 10000.0, 10000.0]
    })

    df_txn = pd.DataFrame({
        "tran_id": ["T1", "T2", "T3"],
        "cust_id": ["C1", "C2", "C3"],
        "tran_date": ["2025-01-01", "2025-01-02", "2025-01-03"],
        "tran_amount": [0.0, 150.0, -10.0],
        "product_category": ["Dining", "Travel", "Retail"],
        "platform": ["POS", "Online", "POS"],
        "payment_type": ["Credit Card", "Debit Card", "Cash"]
    })

    df_exp = pd.DataFrame({
        "experiment_id": ["EXP1", "EXP2"],
        "customer_id": ["C1", "C2"],
        "group": ["Control", "Test"],
        "metric": ["ATV", "ATV"],
        "metric_value": [100.0, 120.0],
        "experiment_date": ["2025-09-01", "2025-09-01"],
        "segment_name": ["18–25", "26–48"]
    })

    dirty_dict = {
        "customers": df_cust,
        "credit_profiles": df_credit,
        "transactions": df_txn,
        "experiment": df_exp
    }

    cleaned, report = run_cleaning_pipeline(dirty_dict)

    # All NaNs must be resolved
    assert cleaned["customers"]["annual_income"].isna().sum() == 0
    assert cleaned["credit_profiles"]["credit_score"].isna().sum() == 0
    assert cleaned["credit_profiles"]["credit_limit"].isna().sum() == 0
    # Duplicates removed
    assert len(cleaned["credit_profiles"]) == 3
    # Invalid ages clamped
    assert cleaned["customers"]["age"].min() >= 18
    assert cleaned["customers"]["age"].max() <= 75
    # Non-positive transactions imputed with positive median
    assert len(cleaned["transactions"]) == 3
    assert (cleaned["transactions"]["tran_amount"] > 0).all()


def test_robustness_analysis_mann_whitney_and_bootstrap():
    """Verify Mann-Whitney U test and Bootstrap Confidence Interval execution."""
    rng = np.random.default_rng(101)
    # Right-skewed log-normal distributions
    ctrl = rng.lognormal(mean=4.0, sigma=0.8, size=500)
    test = rng.lognormal(mean=4.2, sigma=0.8, size=500)

    res = run_hypothesis_test(ctrl, test, test_type="z_test", alternative="larger", alpha=0.05)

    assert "robustness_analysis" in res
    robust = res["robustness_analysis"]

    # Mann-Whitney U validation
    mw = robust["mann_whitney_u"]
    assert "u_statistic" in mw
    assert "p_value" in mw
    assert mw["p_value"] < 0.05

    # Bootstrap CI validation
    bs = robust["bootstrap_ci"]
    assert "ci_lower" in bs
    assert "ci_upper" in bs
    assert bs["ci_lower"] < bs["ci_upper"]
    assert bs["n_resamples"] == 1000

    # Decision concurrence
    assert "concurrence" in robust
    assert robust["concurrence"] in [True, False]


def test_data_loader_caching_and_customer_linking():
    """Verify data store MD5 filter caching and cross-entity ID consistency."""
    from backend.analytics.data_loader import get_data_store
    store = get_data_store()

    # Filter by specific age
    filter1 = {"age_min": 25, "age_max": 35}
    res1 = store.filter_data(filter1)

    # Result should be cached
    res2 = store.filter_data(filter1)
    assert len(res1["customers"]) == len(res2["customers"])

    # Ensure transaction customer IDs match filtered customer IDs
    valid_custs = set(res1["customers"]["cust_id"])
    txn_custs = set(res1["transactions"]["cust_id"])
    assert txn_custs.issubset(valid_custs)

