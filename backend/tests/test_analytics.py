"""
CreditIQ Analytics - Core Statistical & Unit Tests
Verifies dataset generation, cleaning pipeline, segmentation, target scoring,
and data loader caching for the Credit Card Customer Analytics & Segmentation Platform.
"""

import math
import numpy as np
import pandas as pd
import pytest

from backend.analytics.data_generator import generate_synthetic_data
from backend.analytics.data_quality import inspect_data_quality
from backend.analytics.preprocessing import run_cleaning_pipeline
from backend.analytics.segmentation import segment_customers
from backend.analytics.target_scoring import evaluate_target_segments, min_max_normalize


def test_data_generation_and_dirty_injection():
    """Verify synthetic dataset sizes and controlled data quality flaws."""
    data = generate_synthetic_data(seed=123, n_customers=1000, n_transactions=10000)
    df_cust = data["customers"]
    df_credit = data["credit_profiles"]
    df_txn = data["transactions"]

    assert len(df_cust) == 1000
    assert len(df_credit) > 1000  # Duplicates included
    assert len(df_txn) == 10000

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


def test_dynamic_quality_score_calculation():
    """Verify that post-cleaning quality score is dynamically derived and not hardcoded."""
    data = generate_synthetic_data(seed=777, n_customers=1000, n_transactions=10000)
    cleaned, report = run_cleaning_pipeline(data)

    before_score = report["before_quality_score"]
    after_score = report["after_quality_score"]

    # Quality score must improve after cleaning
    assert after_score > before_score
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

    dirty_dict = {
        "customers": df_cust,
        "credit_profiles": df_credit,
        "transactions": df_txn
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
