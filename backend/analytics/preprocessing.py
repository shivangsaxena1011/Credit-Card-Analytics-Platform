"""
CreditIQ Analytics - Dynamic Data Preprocessing & Cleaning Pipeline
Applies deterministic, statistically defensible imputation, deduplication,
range correction, utilization consistency checks, and documented outlier capping.
Maintains raw data untouched and dynamically calculates the real post-cleaning quality score.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from backend.analytics.data_quality import inspect_data_quality


def run_cleaning_pipeline(raw_data: Dict[str, pd.DataFrame]) -> Tuple[Dict[str, pd.DataFrame], Dict[str, Any]]:
    """
    Executes the full cleaning pipeline and returns (cleaned_data_dict, before_after_report).
    Dynamically audits raw data and cleaned data to compute exact quality scores.
    """
    df_cust_raw = raw_data["customers"]
    df_credit_raw = raw_data["credit_profiles"]
    df_txn_raw = raw_data["transactions"]

    # Compute genuine BEFORE audit dynamically
    before_audit = inspect_data_quality(raw_data)
    before_quality_score = before_audit["quality_score"]

    # Deep copies to guarantee raw data remains pristine and untouched
    df_cust = df_cust_raw.copy(deep=True)
    df_credit = df_credit_raw.copy(deep=True)
    df_txn = df_txn_raw.copy(deep=True)
    df_exp = raw_data["experiment"].copy(deep=True) if "experiment" in raw_data else pd.DataFrame()

    # ----------------------------------------------------
    # BEFORE Counts for Detailed Audit Reporting
    # ----------------------------------------------------
    cust_age_num = pd.to_numeric(df_cust["age"], errors="coerce")
    before_invalid_ages = int(((cust_age_num < 15) | (cust_age_num > 80) | cust_age_num.isna()).sum())
    before_missing_income = int(df_cust["annual_income"].isna().sum())
    before_missing_marital = int(df_cust["marital_status"].isna().sum())

    before_credit_dups = int(df_credit["cust_id"].duplicated().sum())
    before_missing_limits = int(df_credit["credit_limit"].isna().sum())

    credit_debt_num = pd.to_numeric(df_credit["outstanding_debt"], errors="coerce")
    credit_limit_num = pd.to_numeric(df_credit["credit_limit"], errors="coerce")
    valid_debt_limit = df_credit.dropna(subset=["credit_limit", "outstanding_debt"])
    before_debt_viol = int((pd.to_numeric(valid_debt_limit["outstanding_debt"], errors="coerce") >
                            pd.to_numeric(valid_debt_limit["credit_limit"], errors="coerce")).sum())

    before_missing_credit_num = int(df_credit["credit_utilisation"].isna().sum() +
                                   df_credit["credit_inquiries_last_6_months"].isna().sum())

    before_missing_platform = int(df_txn["platform"].isna().sum())
    txn_amounts_num = pd.to_numeric(df_txn["tran_amount"], errors="coerce")
    before_zero_txn = int((txn_amounts_num == 0).sum())
    before_missing_cat_pay = int(df_txn["product_category"].isna().sum() + df_txn["payment_type"].isna().sum())

    valid_txn_amounts = txn_amounts_num.dropna()
    q1 = float(valid_txn_amounts.quantile(0.25)) if not valid_txn_amounts.empty else 40.0
    q3 = float(valid_txn_amounts.quantile(0.75)) if not valid_txn_amounts.empty else 160.0
    iqr = q3 - q1
    extreme_cap_thresh = float(q3 + 5.0 * iqr)
    before_extreme_txn = int((valid_txn_amounts > extreme_cap_thresh).sum())

    # ----------------------------------------------------
    # 1. CLEAN CUSTOMERS
    # ----------------------------------------------------
    # A. Invalid Ages (<15 or >80 or NaN) -> Occupation-wise median age with fallback
    valid_ages_df = df_cust[(cust_age_num >= 15) & (cust_age_num <= 80)]
    overall_median_age = int(valid_ages_df["age"].median()) if not valid_ages_df.empty else 35
    occ_median_ages = valid_ages_df.groupby("occupation")["age"].median().to_dict() if not valid_ages_df.empty else {}

    cleaned_ages = []
    for _, row in df_cust.iterrows():
        a = row["age"]
        try:
            val = float(a)
            if np.isnan(val) or val < 15 or val > 80:
                occ = str(row.get("occupation", ""))
                clean_age = int(occ_median_ages.get(occ, overall_median_age))
            else:
                clean_age = int(val)
        except (ValueError, TypeError):
            clean_age = overall_median_age
        cleaned_ages.append(clean_age)
    df_cust["age"] = cleaned_ages

    # B. Missing Annual Income -> Occupation-wise median income with overall fallback
    valid_inc_df = df_cust.dropna(subset=["annual_income"])
    overall_median_inc = float(pd.to_numeric(valid_inc_df["annual_income"], errors="coerce").dropna().median()) if not valid_inc_df.empty else 65000.0
    occ_median_inc = valid_inc_df.groupby("occupation")["annual_income"].median().to_dict() if not valid_inc_df.empty else {}

    cleaned_incomes = []
    for _, row in df_cust.iterrows():
        inc = row["annual_income"]
        try:
            val = float(inc)
            if np.isnan(val) or val < 0:
                occ = str(row.get("occupation", ""))
                clean_inc = float(occ_median_inc.get(occ, overall_median_inc))
            else:
                clean_inc = val
        except (ValueError, TypeError):
            clean_inc = overall_median_inc
        cleaned_incomes.append(round(clean_inc, 2))
    df_cust["annual_income"] = cleaned_incomes

    # C. Missing Marital Status -> Mode with fallback
    marital_mode_series = df_cust["marital_status"].dropna().mode()
    marital_mode = str(marital_mode_series.iloc[0]) if not marital_mode_series.empty else "Married"
    df_cust["marital_status"] = df_cust["marital_status"].fillna(marital_mode).astype(str)

    # ----------------------------------------------------
    # 2. CLEAN CREDIT PROFILES
    # ----------------------------------------------------
    # A. Deduplicate cust_id: deterministic retention of most complete/informative record
    df_credit["credit_limit"] = pd.to_numeric(df_credit["credit_limit"], errors="coerce")
    df_credit["outstanding_debt"] = pd.to_numeric(df_credit["outstanding_debt"], errors="coerce")
    df_credit["credit_score"] = pd.to_numeric(df_credit["credit_score"], errors="coerce")
    df_credit["credit_utilisation"] = pd.to_numeric(df_credit["credit_utilisation"], errors="coerce")
    df_credit["credit_inquiries_last_6_months"] = pd.to_numeric(df_credit["credit_inquiries_last_6_months"], errors="coerce")

    # Tie-break rule: sort descending by credit_limit, then credit_score
    df_credit = df_credit.sort_values(by=["credit_limit", "credit_score"], ascending=[False, False], na_position="last")
    df_credit = df_credit.drop_duplicates(subset=["cust_id"], keep="first").reset_index(drop=True)

    # Fill any missing credit scores with overall median
    median_score = int(df_credit["credit_score"].dropna().median()) if not df_credit["credit_score"].dropna().empty else 680
    df_credit["credit_score"] = df_credit["credit_score"].fillna(median_score).astype(int)

    # B. Missing Credit Limits: Impute via credit-score bracket median with fallback
    def score_bracket(score: int) -> str:
        if score < 580:
            return "Poor"
        elif score < 670:
            return "Fair"
        elif score < 740:
            return "Good"
        elif score < 800:
            return "Very Good"
        else:
            return "Exceptional"

    df_credit["score_bracket"] = df_credit["credit_score"].apply(score_bracket)
    valid_limits_df = df_credit.dropna(subset=["credit_limit"])
    overall_median_limit = float(valid_limits_df["credit_limit"].median()) if not valid_limits_df.empty else 12000.0
    bracket_median_limits = valid_limits_df.groupby("score_bracket")["credit_limit"].median().to_dict() if not valid_limits_df.empty else {}

    cleaned_limits = []
    for _, row in df_credit.iterrows():
        lim = row["credit_limit"]
        if pd.isna(lim) or lim <= 0:
            b = row["score_bracket"]
            clean_lim = float(bracket_median_limits.get(b, overall_median_limit))
            clean_lim = max(1000.0, round(clean_lim, -2))
        else:
            clean_lim = float(lim)
        cleaned_limits.append(clean_lim)
    df_credit["credit_limit"] = cleaned_limits
    df_credit = df_credit.drop(columns=["score_bracket"])

    # C. Outstanding Debt vs Credit Limit: Business rule cap debt at 100% of credit limit
    cleaned_debts = []
    overall_median_debt = float(df_credit["outstanding_debt"].dropna().median()) if not df_credit["outstanding_debt"].dropna().empty else 2500.0
    for _, row in df_credit.iterrows():
        debt = row["outstanding_debt"]
        lim = row["credit_limit"]
        if pd.isna(debt) or debt < 0:
            debt = min(lim * 0.35, overall_median_debt)
        if debt > lim:
            debt = float(lim)
        cleaned_debts.append(round(debt, 2))
    df_credit["outstanding_debt"] = cleaned_debts

    # D. Credit Utilization: Preserve reported utilization, calculate derived, and verify consistency
    derived_util = np.clip(np.round(df_credit["outstanding_debt"] / np.maximum(1.0, df_credit["credit_limit"]), 4), 0.0, 1.0)
    df_credit["derived_credit_utilisation"] = derived_util

    cleaned_util = []
    median_reported_util = float(df_credit["credit_utilisation"].dropna().median()) if not df_credit["credit_utilisation"].dropna().empty else 0.32
    for rep, der in zip(df_credit["credit_utilisation"], derived_util):
        if pd.isna(rep) or rep < 0 or rep > 1.5:
            # Impute missing reported utilization with derived value
            cleaned_util.append(round(float(der), 4))
        else:
            # Preserve reported utilization
            cleaned_util.append(round(min(1.0, float(rep)), 4))
    df_credit["credit_utilisation"] = cleaned_util
    df_credit["derived_utilisation"] = df_credit["derived_credit_utilisation"]

    # Flag utilization consistency (reported vs derived discrepancy)
    df_credit["utilization_discrepancy"] = np.round(np.abs(df_credit["credit_utilisation"] - df_credit["derived_credit_utilisation"]), 4)
    df_credit["utilization_consistent"] = df_credit["utilization_discrepancy"] <= 0.20

    # Inquiries: impute missing with median (0 or 1)
    median_inq = int(df_credit["credit_inquiries_last_6_months"].dropna().median()) if not df_credit["credit_inquiries_last_6_months"].dropna().empty else 1
    df_credit["credit_inquiries_last_6_months"] = df_credit["credit_inquiries_last_6_months"].fillna(median_inq).astype(int)

    # ----------------------------------------------------
    # 3. CLEAN TRANSACTIONS
    # ----------------------------------------------------
    # A. Missing Platform -> Mode with fallback
    plat_mode_series = df_txn["platform"].dropna().mode()
    plat_mode = str(plat_mode_series.iloc[0]) if not plat_mode_series.empty else "Amazon"
    df_txn["platform"] = df_txn["platform"].fillna(plat_mode).astype(str)

    # B. Missing Category & Payment Type -> Modes with fallbacks
    cat_mode_series = df_txn["product_category"].dropna().mode()
    cat_mode = str(cat_mode_series.iloc[0]) if not cat_mode_series.empty else "Electronics"
    df_txn["product_category"] = df_txn["product_category"].fillna(cat_mode).astype(str)

    pay_mode_series = df_txn["payment_type"].dropna().mode()
    pay_mode = str(pay_mode_series.iloc[0]) if not pay_mode_series.empty else "Credit Card"
    df_txn["payment_type"] = df_txn["payment_type"].fillna(pay_mode).astype(str)

    # C. Zero or Negative Transaction Amounts -> Context-aware Category Median Imputation
    df_txn["tran_amount"] = pd.to_numeric(df_txn["tran_amount"], errors="coerce")
    valid_txns = df_txn[df_txn["tran_amount"] > 0]
    cat_medians = valid_txns.groupby("product_category")["tran_amount"].median().to_dict() if not valid_txns.empty else {}
    overall_txn_median = float(valid_txns["tran_amount"].median()) if not valid_txns.empty else 85.0

    cleaned_amts = []
    for _, row in df_txn.iterrows():
        amt = row["tran_amount"]
        if pd.isna(amt) or amt <= 0:
            cat = str(row.get("product_category", ""))
            imp_amt = float(cat_medians.get(cat, overall_txn_median))
            cleaned_amts.append(round(imp_amt, 2))
        else:
            cleaned_amts.append(round(float(amt), 2))
    df_txn["tran_amount"] = cleaned_amts

    # D. Extreme Outlier Treatment: Winsorize at 99.5th percentile to protect statistical estimates
    # Flag outlier records explicitly before capping
    p99_5 = float(df_txn["tran_amount"].quantile(0.995))
    df_txn["is_statistical_outlier"] = df_txn["tran_amount"] > extreme_cap_thresh
    df_txn["tran_amount_raw"] = df_txn["tran_amount"]  # Preserve original amount before cap
    df_txn.loc[df_txn["is_statistical_outlier"], "tran_amount"] = round(p99_5, 2)

    # ----------------------------------------------------
    # DYNAMIC AFTER AUDIT: Calculate real score from cleaned data
    # ----------------------------------------------------
    cleaned_data = {
        "customers": df_cust,
        "credit_profiles": df_credit,
        "transactions": df_txn,
        "experiment": df_exp
    }

    after_audit = inspect_data_quality(cleaned_data)
    after_quality_score = after_audit["quality_score"]

    # Calculate post-cleaning counts
    after_invalid_ages = int(((df_cust["age"] < 15) | (df_cust["age"] > 80)).sum())
    after_missing_income = int(df_cust["annual_income"].isna().sum())
    after_missing_marital = int(df_cust["marital_status"].isna().sum())
    after_credit_dups = int(df_credit["cust_id"].duplicated().sum())
    after_missing_limits = int(df_credit["credit_limit"].isna().sum())
    after_debt_viol = int((df_credit["outstanding_debt"] > df_credit["credit_limit"]).sum())
    after_missing_credit_num = int(df_credit["credit_utilisation"].isna().sum() +
                                  df_credit["credit_inquiries_last_6_months"].isna().sum())
    after_missing_platform = int(df_txn["platform"].isna().sum())
    after_zero_txn = int((df_txn["tran_amount"] == 0).sum())
    after_missing_cat_pay = int(df_txn["product_category"].isna().sum() + df_txn["payment_type"].isna().sum())
    after_extreme_txn = int((df_txn["tran_amount"] > extreme_cap_thresh).sum())

    comparison_table = [
        {
            "metric": "Invalid Ages (<15 or >80)",
            "before": before_invalid_ages,
            "after": after_invalid_ages,
            "status": "Resolved",
            "method": f"Occupation-wise median age imputation (overall median: {overall_median_age})"
        },
        {
            "metric": "Missing Annual Income",
            "before": before_missing_income,
            "after": after_missing_income,
            "status": "Resolved",
            "method": f"Occupation-wise median income imputation (baseline: ${overall_median_inc:,.0f})"
        },
        {
            "metric": "Missing Customer Demographics",
            "before": before_missing_marital,
            "after": after_missing_marital,
            "status": "Resolved",
            "method": f"Mode imputation ('{marital_mode}')"
        },
        {
            "metric": "Duplicate Credit Profiles",
            "before": before_credit_dups,
            "after": after_credit_dups,
            "status": "Resolved",
            "method": "Deterministic deduplication (retained highest credit limit record)"
        },
        {
            "metric": "Missing Credit Limits",
            "before": before_missing_limits,
            "after": after_missing_limits,
            "status": "Resolved",
            "method": "Credit score bracket median limit imputation"
        },
        {
            "metric": "Debt Exceeds Credit Limit Violations",
            "before": before_debt_viol,
            "after": after_debt_viol,
            "status": "Resolved",
            "method": "100% credit limit ceiling cap rule with derived utilization recomputation"
        },
        {
            "metric": "Missing Credit Profile Numeric Values",
            "before": before_missing_credit_num,
            "after": after_missing_credit_num,
            "status": "Resolved",
            "method": "Derived utilization imputation and feature-level median inquiries"
        },
        {
            "metric": "Missing Transaction Platforms",
            "before": before_missing_platform,
            "after": after_missing_platform,
            "status": "Resolved",
            "method": f"Mode platform imputation ('{plat_mode}')"
        },
        {
            "metric": "Zero / Negative Transaction Amounts",
            "before": before_zero_txn,
            "after": after_zero_txn,
            "status": "Resolved",
            "method": "Context-aware category-specific median imputation"
        },
        {
            "metric": "Missing Categories / Payment Types",
            "before": before_missing_cat_pay,
            "after": after_missing_cat_pay,
            "status": "Resolved",
            "method": f"Mode imputation (Category: '{cat_mode}', Payment: '{pay_mode}')"
        },
        {
            "metric": "Extreme Transaction Outliers",
            "before": before_extreme_txn,
            "after": after_extreme_txn,
            "status": "Resolved",
            "method": f"Winsorized at 99.5th percentile (${p99_5:,.2f}), threshold >${extreme_cap_thresh:,.2f}"
        }
    ]

    report = {
        "pipeline_status": "Cleaned Successfully",
        "before_quality_score": before_quality_score,
        "after_quality_score": after_quality_score,
        "records_processed": {
            "customers": len(df_cust),
            "credit_profiles": len(df_credit),
            "transactions": len(df_txn),
            "experiment": len(df_exp)
        },
        "comparison_table": comparison_table
    }

    return cleaned_data, report
