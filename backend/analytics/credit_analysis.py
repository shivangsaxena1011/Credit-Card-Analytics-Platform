"""
CreditIQ Analytics - Credit Analytics Engine
Computes credit distributions, scatter relationships, dynamic Pearson correlation matrix,
and statistical association interpretations.
"""

import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List


def analyze_credit(df_credit: pd.DataFrame, df_cust: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes credit score, limit, utilization, debt distributions,
    scatter plots, and dynamic Pearson correlation matrix.
    """
    if df_credit.empty:
        return {
            "summary": {
                "avg_credit_score": 0, "avg_credit_limit": 0,
                "avg_credit_utilisation": 0, "avg_outstanding_debt": 0,
                "high_utilisation_rate": 0
            },
            "credit_score_distribution": [],
            "credit_limit_distribution": [],
            "utilisation_distribution": [],
            "debt_distribution": [],
            "inquiries_distribution": [],
            "scatter_plots": {
                "score_vs_limit": [],
                "income_vs_limit": [],
                "income_vs_score": [],
                "limit_vs_debt": []
            },
            "correlation_matrix": {},
            "correlation_highlights": {
                "strongest_positive": None,
                "strongest_negative": None,
                "disclaimer": "Correlation indicates association, not causation."
            }
        }

    # Summary metrics
    avg_score = float(df_credit["credit_score"].dropna().mean())
    avg_limit = float(df_credit["credit_limit"].dropna().mean())
    avg_util = float(df_credit["credit_utilisation"].dropna().mean())
    avg_debt = float(df_credit["outstanding_debt"].dropna().mean())
    high_util_count = int((df_credit["credit_utilisation"] > 0.70).sum())
    high_util_pct = round((high_util_count / len(df_credit)) * 100, 1)

    # 1. Credit score distribution (FICO style)
    score_bins = [299, 579, 669, 739, 799, 850]
    score_labels = ["Poor (<580)", "Fair (580-669)", "Good (670-739)", "Very Good (740-799)", "Exceptional (800+)"]
    df_c = df_credit.copy()
    df_c["score_tier"] = pd.cut(df_c["credit_score"].fillna(0), bins=score_bins, labels=score_labels)
    score_dist = []
    for label in score_labels:
        cnt = int((df_c["score_tier"] == label).sum())
        score_dist.append({"tier": label, "count": cnt, "percentage": round((cnt / len(df_credit)) * 100, 1)})

    # 2. Credit limit distribution
    limit_bins = [0, 5000, 10000, 15000, 20000, 30000, 50000, 100000]
    limit_labels = ["<$5k", "$5k-$10k", "$10k-$15k", "$15k-$20k", "$20k-$30k", "$30k-$50k", "$50k+"]
    df_c["limit_tier"] = pd.cut(df_c["credit_limit"].fillna(0), bins=limit_bins, labels=limit_labels)
    limit_dist = []
    for label in limit_labels:
        cnt = int((df_c["limit_tier"] == label).sum())
        limit_dist.append({"bracket": label, "count": cnt, "percentage": round((cnt / len(df_credit)) * 100, 1)})

    # 3. Credit utilization distribution
    util_bins = [-0.01, 0.20, 0.40, 0.60, 0.80, 1.05]
    util_labels = ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"]
    df_c["util_bracket"] = pd.cut(df_c["credit_utilisation"].fillna(0), bins=util_bins, labels=util_labels)
    util_dist = []
    for label in util_labels:
        cnt = int((df_c["util_bracket"] == label).sum())
        util_dist.append({"bracket": label, "count": cnt, "percentage": round((cnt / len(df_credit)) * 100, 1)})

    # 4. Debt distribution
    debt_bins = [-1, 2000, 5000, 10000, 15000, 25000, 100000]
    debt_labels = ["<$2k", "$2k-$5k", "$5k-$10k", "$10k-$15k", "$15k-$25k", "$25k+"]
    df_c["debt_bracket"] = pd.cut(df_c["outstanding_debt"].fillna(0), bins=debt_bins, labels=debt_labels)
    debt_dist = []
    for label in debt_labels:
        cnt = int((df_c["debt_bracket"] == label).sum())
        debt_dist.append({"bracket": label, "count": cnt, "percentage": round((cnt / len(df_credit)) * 100, 1)})

    # 5. Inquiries distribution
    inq_counts = df_credit["credit_inquiries_last_6_months"].dropna().value_counts().sort_index()
    inquiries_dist = [
        {"inquiries": f"{int(k)} Inquiries" if k > 0 else "0 Inquiries", "count": int(v), "percentage": round((v / len(df_credit)) * 100, 1)}
        for k, v in inq_counts.items()
    ]

    # Merge customer data for joint scatter and correlation analysis
    merged = pd.merge(df_credit, df_cust[["cust_id", "annual_income", "age", "occupation", "name"]], on="cust_id", how="inner")

    # Sample for scatter plots (up to 250 points)
    sample_df = merged.sample(n=min(250, len(merged)), random_state=42) if len(merged) > 250 else merged

    score_vs_limit = [
        {"x": int(r["credit_score"]), "y": round(float(r["credit_limit"]), 2), "name": r.get("name", ""), "cust_id": r["cust_id"]}
        for _, r in sample_df.dropna(subset=["credit_score", "credit_limit"]).iterrows()
    ]
    income_vs_limit = [
        {"x": round(float(r["annual_income"]), 2), "y": round(float(r["credit_limit"]), 2), "name": r.get("name", ""), "cust_id": r["cust_id"]}
        for _, r in sample_df.dropna(subset=["annual_income", "credit_limit"]).iterrows()
    ]
    income_vs_score = [
        {"x": round(float(r["annual_income"]), 2), "y": int(r["credit_score"]), "name": r.get("name", ""), "cust_id": r["cust_id"]}
        for _, r in sample_df.dropna(subset=["annual_income", "credit_score"]).iterrows()
    ]
    limit_vs_debt = [
        {"x": round(float(r["credit_limit"]), 2), "y": round(float(r["outstanding_debt"]), 2), "name": r.get("name", ""), "cust_id": r["cust_id"]}
        for _, r in sample_df.dropna(subset=["credit_limit", "outstanding_debt"]).iterrows()
    ]

    # ----------------------------------------------------
    # Pearson Correlation Matrix
    # ----------------------------------------------------
    corr_cols = [
        "annual_income", "credit_score", "credit_limit",
        "credit_utilisation", "outstanding_debt", "credit_inquiries_last_6_months"
    ]
    valid_corr_data = merged[corr_cols].dropna().apply(pd.to_numeric, errors="coerce").dropna()
    
    corr_res = {}
    strongest_pos = {"var1": "", "var2": "", "r": -1.0}
    strongest_neg = {"var1": "", "var2": "", "r": 1.0}

    col_names_friendly = {
        "annual_income": "Annual Income",
        "credit_score": "Credit Score",
        "credit_limit": "Credit Limit",
        "credit_utilisation": "Credit Utilisation",
        "outstanding_debt": "Outstanding Debt",
        "credit_inquiries_last_6_months": "Credit Inquiries (6M)"
    }

    matrix_rows = []
    for col1 in corr_cols:
        row_vals = {"variable": col_names_friendly[col1]}
        for col2 in corr_cols:
            if col1 == col2:
                r_val = 1.0
            else:
                r_val, _ = stats.pearsonr(valid_corr_data[col1], valid_corr_data[col2])
                r_val = float(r_val)
                # Check for strongest pos/neg among distinct pairs
                if corr_cols.index(col1) < corr_cols.index(col2):
                    if r_val > strongest_pos["r"]:
                        strongest_pos = {"var1": col_names_friendly[col1], "var2": col_names_friendly[col2], "r": round(r_val, 3)}
                    if r_val < strongest_neg["r"]:
                        strongest_neg = {"var1": col_names_friendly[col1], "var2": col_names_friendly[col2], "r": round(r_val, 3)}
            row_vals[col_names_friendly[col2]] = round(r_val, 3)
        matrix_rows.append(row_vals)

    return {
        "summary": {
            "avg_credit_score": round(avg_score, 1),
            "avg_credit_limit": round(avg_limit, 2),
            "avg_credit_utilisation": round(avg_util * 100, 1),
            "avg_outstanding_debt": round(avg_debt, 2),
            "high_utilisation_rate": high_util_pct
        },
        "credit_score_distribution": score_dist,
        "credit_limit_distribution": limit_dist,
        "utilisation_distribution": util_dist,
        "debt_distribution": debt_dist,
        "inquiries_distribution": inquiries_dist,
        "scatter_plots": {
            "score_vs_limit": score_vs_limit,
            "income_vs_limit": income_vs_limit,
            "income_vs_score": income_vs_score,
            "limit_vs_debt": limit_vs_debt
        },
        "correlation_matrix": matrix_rows,
        "columns": [col_names_friendly[c] for c in corr_cols],
        "correlation_highlights": {
            "strongest_positive": strongest_pos,
            "strongest_negative": strongest_neg,
            "disclaimer": "Correlation indicates association, not causation."
        }
    }
