"""
CreditIQ Analytics - Customer Segmentation Engine
Segments customers into configurable age groups and calculates comprehensive
demographic, credit profile, and transactional behavior metrics for each segment.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional


def segment_customers(
    df_cust: pd.DataFrame,
    df_credit: pd.DataFrame,
    df_txn: pd.DataFrame,
    age_groups: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Computes comparative metrics across user-configured age segments.
    Default segments:
      - 18–25 (Young Adult / Early Career)
      - 26–48 (Prime Earning / Family Building)
      - 49–65 (Mature / Wealth Accumulation)
    """
    if age_groups is None:
        age_groups = [
            {"id": "seg_18_25", "name": "18–25", "min_age": 18, "max_age": 25, "label": "Young Adults / New-to-Credit"},
            {"id": "seg_26_48", "name": "26–48", "min_age": 26, "max_age": 48, "label": "Prime Earning & Growth"},
            {"id": "seg_49_65", "name": "49–65+", "min_age": 49, "max_age": 80, "label": "Mature & Established (49–65+)"}
        ]

    if df_cust.empty:
        return {"segments": [], "comparison_table": [], "charts": {}}

    # Merge customer and credit data
    cust_credit = pd.merge(df_cust, df_credit, on="cust_id", how="left")
    total_customers = len(df_cust)

    # Pre-aggregate transactions per customer
    txn_agg = df_txn.groupby("cust_id").agg(
        total_txn_val=("tran_amount", "sum"),
        total_txn_cnt=("tran_amount", "count"),
        cc_txn_cnt=("payment_type", lambda s: (s == "Credit Card").sum())
    ).reset_index()

    cust_full = pd.merge(cust_credit, txn_agg, on="cust_id", how="left")
    cust_full["total_txn_val"] = cust_full["total_txn_val"].fillna(0)
    cust_full["total_txn_cnt"] = cust_full["total_txn_cnt"].fillna(0)
    cust_full["cc_txn_cnt"] = cust_full["cc_txn_cnt"].fillna(0)

    # Customer ID to segment map
    segment_results: List[Dict[str, Any]] = []

    for seg in age_groups:
        s_min = seg["min_age"]
        s_max = seg["max_age"]
        seg_mask = (cust_full["age"] >= s_min) & (cust_full["age"] <= s_max)
        seg_df = cust_full[seg_mask]
        n_seg = len(seg_df)
        pct_seg = round((n_seg / total_customers) * 100, 1) if total_customers > 0 else 0.0

        if n_seg == 0:
            continue

        # Financial metrics
        avg_inc = float(seg_df["annual_income"].dropna().mean()) if not seg_df["annual_income"].dropna().empty else 0.0
        med_inc = float(seg_df["annual_income"].dropna().median()) if not seg_df["annual_income"].dropna().empty else 0.0
        avg_score = float(seg_df["credit_score"].dropna().mean()) if not seg_df["credit_score"].dropna().empty else 0.0
        avg_limit = float(seg_df["credit_limit"].dropna().mean()) if not seg_df["credit_limit"].dropna().empty else 0.0
        avg_util = float(seg_df["credit_utilisation"].dropna().mean()) if not seg_df["credit_utilisation"].dropna().empty else 0.0
        avg_debt = float(seg_df["outstanding_debt"].dropna().mean()) if not seg_df["outstanding_debt"].dropna().empty else 0.0

        # Transaction metrics for customers in this segment
        seg_cust_ids = set(seg_df["cust_id"])
        seg_txns = df_txn[df_txn["cust_id"].isin(seg_cust_ids)]
        seg_txn_cnt = len(seg_txns)
        
        if seg_txn_cnt > 0:
            avg_txn_amt = float(seg_txns["tran_amount"].mean())
            cc_share = round((int((seg_txns["payment_type"] == "Credit Card").sum()) / seg_txn_cnt) * 100, 1)
            # Top categories
            top_cats_series = seg_txns["product_category"].value_counts().head(3)
            top_cats = [f"{cat} ({round(cnt/seg_txn_cnt*100, 1)}%)" for cat, cnt in top_cats_series.items()]
            top_cat_names = list(top_cats_series.index)
        else:
            avg_txn_amt = 0.0
            cc_share = 0.0
            top_cats = []
            top_cat_names = []

        segment_results.append({
            "id": seg.get("id", f"seg_{s_min}_{s_max}"),
            "name": seg["name"],
            "label": seg.get("label", seg["name"]),
            "min_age": s_min,
            "max_age": s_max,
            "customer_count": n_seg,
            "customer_percentage": pct_seg,
            "avg_income": round(avg_inc, 2),
            "median_income": round(med_inc, 2),
            "avg_credit_score": round(avg_score, 1),
            "avg_credit_limit": round(avg_limit, 2),
            "avg_credit_utilisation": round(avg_util * 100, 1),
            "avg_outstanding_debt": round(avg_debt, 2),
            "avg_transaction_amount": round(avg_txn_amt, 2),
            "total_transactions": seg_txn_cnt,
            "credit_card_payment_share": cc_share,
            "top_product_categories": top_cats,
            "top_category_names": top_cat_names
        })

    # Prepare chart series data
    chart_income_vs_limit = [
        {"segment": s["name"], "avg_income": s["avg_income"], "avg_credit_limit": s["avg_credit_limit"]}
        for s in segment_results
    ]
    chart_credit_metrics = [
        {"segment": s["name"], "avg_credit_score": s["avg_credit_score"], "credit_utilisation": s["avg_credit_utilisation"]}
        for s in segment_results
    ]
    chart_txn_behavior = [
        {"segment": s["name"], "avg_txn_amount": s["avg_transaction_amount"], "cc_payment_share": s["credit_card_payment_share"]}
        for s in segment_results
    ]

    return {
        "segments": segment_results,
        "total_customers_segmented": total_customers,
        "charts": {
            "income_vs_limit": chart_income_vs_limit,
            "credit_metrics": chart_credit_metrics,
            "transaction_behavior": chart_txn_behavior
        }
    }
