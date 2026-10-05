"""
CreditIQ Analytics - Data Quality Engine
Analyzes raw datasets for missing values, duplicates, invalid ranges,
outliers, and consistency violations. Computes a dynamic Data Quality Score (0-100%).
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List


def inspect_data_quality(raw_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Evaluates quality across raw customer, credit, and transaction datasets.
    Returns detailed metrics, an issue table, and an overall Data Quality Score.
    """
    df_cust = raw_data["customers"]
    df_credit = raw_data["credit_profiles"]
    df_txn = raw_data["transactions"]

    n_cust = len(df_cust)
    n_credit = len(df_credit)
    n_txn = len(df_txn)

    issues: List[Dict[str, Any]] = []

    # ----------------------------------------------------
    # 1. MISSING VALUES
    # ----------------------------------------------------
    # Customer income
    missing_inc = int(df_cust["annual_income"].isna().sum())
    missing_inc_pct = round((missing_inc / n_cust) * 100, 2)
    if missing_inc > 0:
        issues.append({
            "table": "customers",
            "column": "annual_income",
            "issue_type": "Missing Values",
            "affected_records": missing_inc,
            "percentage": missing_inc_pct,
            "severity": "Medium",
            "recommended_treatment": "Impute using occupation-wise median income"
        })

    # Customer marital status
    missing_marital = int(df_cust["marital_status"].isna().sum())
    missing_marital_pct = round((missing_marital / n_cust) * 100, 2)
    if missing_marital > 0:
        issues.append({
            "table": "customers",
            "column": "marital_status",
            "issue_type": "Missing Values",
            "affected_records": missing_marital,
            "percentage": missing_marital_pct,
            "severity": "Low",
            "recommended_treatment": "Impute with mode ('Married' or 'Single')"
        })

    # Credit limits missing
    missing_limit = int(df_credit["credit_limit"].isna().sum())
    missing_limit_pct = round((missing_limit / n_credit) * 100, 2)
    if missing_limit > 0:
        issues.append({
            "table": "credit_profiles",
            "column": "credit_limit",
            "issue_type": "Missing Values",
            "affected_records": missing_limit,
            "percentage": missing_limit_pct,
            "severity": "High",
            "recommended_treatment": "Impute using credit-score bracket median limit"
        })

    # Credit utilization or inquiries missing
    missing_util = int(df_credit["credit_utilisation"].isna().sum())
    missing_inq = int(df_credit["credit_inquiries_last_6_months"].isna().sum())
    if missing_util > 0:
        issues.append({
            "table": "credit_profiles",
            "column": "credit_utilisation",
            "issue_type": "Missing Values",
            "affected_records": missing_util,
            "percentage": round((missing_util / n_credit) * 100, 2),
            "severity": "Low",
            "recommended_treatment": "Impute with overall median utilization"
        })
    if missing_inq > 0:
        issues.append({
            "table": "credit_profiles",
            "column": "credit_inquiries_last_6_months",
            "issue_type": "Missing Values",
            "affected_records": missing_inq,
            "percentage": round((missing_inq / n_credit) * 100, 2),
            "severity": "Low",
            "recommended_treatment": "Impute with median inquiries (0 or 1)"
        })

    # Transaction platform missing
    missing_plat = int(df_txn["platform"].isna().sum())
    if missing_plat > 0:
        issues.append({
            "table": "transactions",
            "column": "platform",
            "issue_type": "Missing Values",
            "affected_records": missing_plat,
            "percentage": round((missing_plat / n_txn) * 100, 2),
            "severity": "Medium",
            "recommended_treatment": "Impute with most frequent platform (mode)"
        })

    # Transaction category & payment type missing
    missing_cat = int(df_txn["product_category"].isna().sum())
    if missing_cat > 0:
        issues.append({
            "table": "transactions",
            "column": "product_category",
            "issue_type": "Missing Values",
            "affected_records": missing_cat,
            "percentage": round((missing_cat / n_txn) * 100, 2),
            "severity": "Low",
            "recommended_treatment": "Impute with most frequent product category"
        })

    missing_pay = int(df_txn["payment_type"].isna().sum())
    if missing_pay > 0:
        issues.append({
            "table": "transactions",
            "column": "payment_type",
            "issue_type": "Missing Values",
            "affected_records": missing_pay,
            "percentage": round((missing_pay / n_txn) * 100, 2),
            "severity": "Low",
            "recommended_treatment": "Impute with most frequent payment type"
        })

    # ----------------------------------------------------
    # 2. DUPLICATE RECORDS
    # ----------------------------------------------------
    dup_cust_credit = int(df_credit["cust_id"].duplicated().sum())
    dup_cust_credit_pct = round((dup_cust_credit / n_credit) * 100, 2)
    if dup_cust_credit > 0:
        issues.append({
            "table": "credit_profiles",
            "column": "cust_id",
            "issue_type": "Duplicate Records",
            "affected_records": dup_cust_credit,
            "percentage": dup_cust_credit_pct,
            "severity": "High",
            "recommended_treatment": "Deterministic deduplication (retain highest valid limit)"
        })

    # ----------------------------------------------------
    # 3. INVALID VALUES
    # ----------------------------------------------------
    # Age < 15 or > 80
    valid_age_mask = (df_cust["age"] >= 15) & (df_cust["age"] <= 80)
    invalid_age_count = int((~valid_age_mask).sum())
    invalid_age_pct = round((invalid_age_count / n_cust) * 100, 2)
    if invalid_age_count > 0:
        issues.append({
            "table": "customers",
            "column": "age",
            "issue_type": "Invalid Range",
            "affected_records": invalid_age_count,
            "percentage": invalid_age_pct,
            "severity": "High",
            "recommended_treatment": "Replace invalid values (<15 or >80) with occupation-wise median age"
        })

    # Zero transaction amounts
    zero_txn_count = int((pd.to_numeric(df_txn["tran_amount"], errors="coerce") == 0).sum())
    zero_txn_pct = round((zero_txn_count / n_txn) * 100, 2)
    if zero_txn_count > 0:
        issues.append({
            "table": "transactions",
            "column": "tran_amount",
            "issue_type": "Invalid Value (Zero Amount)",
            "affected_records": zero_txn_count,
            "percentage": zero_txn_pct,
            "severity": "Medium",
            "recommended_treatment": "Impute with category-specific median transaction value"
        })

    # ----------------------------------------------------
    # 4. BUSINESS RULE / CONSISTENCY VIOLATIONS
    # ----------------------------------------------------
    # Outstanding debt > credit limit
    valid_limit_debt = df_credit.dropna(subset=["credit_limit", "outstanding_debt"])
    debt_viol_mask = pd.to_numeric(valid_limit_debt["outstanding_debt"], errors="coerce") > pd.to_numeric(valid_limit_debt["credit_limit"], errors="coerce")
    debt_viol_count = int(debt_viol_mask.sum())
    debt_viol_pct = round((debt_viol_count / n_credit) * 100, 2)
    if debt_viol_count > 0:
        issues.append({
            "table": "credit_profiles",
            "column": "outstanding_debt",
            "issue_type": "Business Rule Violation",
            "affected_records": debt_viol_count,
            "percentage": debt_viol_pct,
            "severity": "High",
            "recommended_treatment": "Cap outstanding debt at credit limit (100% threshold rule)"
        })

    # ----------------------------------------------------
    # 5. OUTLIERS (IQR Analysis)
    # ----------------------------------------------------
    numeric_amounts = pd.to_numeric(df_txn["tran_amount"], errors="coerce").dropna()
    q1 = numeric_amounts.quantile(0.25)
    q3 = numeric_amounts.quantile(0.75)
    iqr = q3 - q1
    extreme_thresh = q3 + 5.0 * iqr  # True extreme outliers
    extreme_count = int((numeric_amounts > extreme_thresh).sum())
    extreme_pct = round((extreme_count / n_txn) * 100, 3)
    if extreme_count > 0:
        issues.append({
            "table": "transactions",
            "column": "tran_amount",
            "issue_type": "Statistical Outlier (Extreme)",
            "affected_records": extreme_count,
            "percentage": extreme_pct,
            "severity": "Medium",
            "recommended_treatment": "Cap extreme anomalies at 99.5th percentile to protect statistical validity"
        })

    # ----------------------------------------------------
    # DATA QUALITY SCORE CALCULATION
    # ----------------------------------------------------
    # Weights for penalty:
    # Missing values: up to 5 points
    # Duplicates: up to 3 points
    # Invalid ranges: up to 3 points
    # Debt violations: up to 3 points
    # Zero / extreme transactions: up to 3 points
    penalties = 0.0
    penalties += min(5.0, (missing_inc / n_cust) * 40 + (missing_limit / n_credit) * 30)
    penalties += min(3.0, (dup_cust_credit / n_credit) * 80)
    penalties += min(3.0, (invalid_age_count / n_cust) * 60)
    penalties += min(3.0, (debt_viol_count / n_credit) * 50)
    penalties += min(3.0, (zero_txn_count / n_txn) * 100 + (extreme_count / n_txn) * 150)

    quality_score = max(50.0, round(100.0 - penalties, 1))

    total_missing = missing_inc + missing_marital + missing_limit + missing_util + missing_inq + missing_plat + missing_cat + missing_pay
    total_duplicates = dup_cust_credit
    total_anomalies = invalid_age_count + zero_txn_count + debt_viol_count + extreme_count

    return {
        "quality_score": quality_score,
        "total_records_analyzed": n_cust + n_credit + n_txn,
        "total_missing_values": total_missing,
        "total_duplicates": total_duplicates,
        "total_anomalies": total_anomalies,
        "breakdown": {
            "missing_values": {
                "customer_income": missing_inc,
                "credit_limit": missing_limit,
                "transaction_platform": missing_plat,
                "other_missing": total_missing - (missing_inc + missing_limit + missing_plat)
            },
            "duplicates": {
                "credit_profile_duplicates": dup_cust_credit
            },
            "invalid_values": {
                "invalid_age_records": invalid_age_count,
                "zero_amount_transactions": zero_txn_count
            },
            "consistency": {
                "debt_exceeds_limit": debt_viol_count
            },
            "outliers": {
                "extreme_transactions": extreme_count,
                "iqr_lower_bound": round(float(max(0, q1 - 1.5 * iqr)), 2),
                "iqr_upper_bound": round(float(q3 + 1.5 * iqr), 2),
                "extreme_threshold": round(float(extreme_thresh), 2)
            }
        },
        "issues_table": issues
    }
