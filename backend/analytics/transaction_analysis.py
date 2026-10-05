"""
CreditIQ Analytics - Transaction Analytics Engine
Computes volume, ticket sizes, monthly trends, category breakdowns,
platform shares, payment type distributions, and cross-tab heatmaps.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List


def analyze_transactions(df_txn: pd.DataFrame, df_cust: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes full transaction analytics including volume, ticket sizes,
    category breakdowns, platform distributions, and payment cross-tabs.
    """
    if df_txn.empty:
        return {
            "summary": {
                "total_value": 0.0, "avg_amount": 0.0, "median_amount": 0.0, "total_count": 0
            },
            "monthly_trend": [],
            "category_value": [],
            "category_count": [],
            "platform_amount": [],
            "payment_type_distribution": [],
            "age_group_value": [],
            "category_payment_matrix": [],
            "platform_category_matrix": [],
            "top_categories": []
        }

    valid_amounts = pd.to_numeric(df_txn["tran_amount"], errors="coerce").dropna()
    total_val = float(valid_amounts.sum())
    avg_amt = float(valid_amounts.mean())
    med_amt = float(valid_amounts.median())
    total_cnt = len(df_txn)

    # 1. Monthly trend
    df_t = df_txn.copy()
    df_t["tran_amount_num"] = valid_amounts
    df_t["tran_date_dt"] = pd.to_datetime(df_t["tran_date"], errors="coerce")
    df_t["month_str"] = df_t["tran_date_dt"].dt.strftime("%Y-%m")
    
    monthly_grp = df_t.groupby("month_str").agg(
        total_value=("tran_amount_num", "sum"),
        avg_amount=("tran_amount_num", "mean"),
        count=("tran_amount_num", "count")
    ).reset_index().sort_values(by="month_str")

    monthly_trend = [
        {
            "month": row["month_str"],
            "total_value": round(float(row["total_value"]), 2),
            "avg_amount": round(float(row["avg_amount"]), 2),
            "count": int(row["count"])
        }
        for _, row in monthly_grp.iterrows() if pd.notna(row["month_str"])
    ]

    # 2. Category value & count
    cat_grp = df_t.groupby("product_category").agg(
        total_value=("tran_amount_num", "sum"),
        avg_amount=("tran_amount_num", "mean"),
        count=("tran_amount_num", "count")
    ).reset_index().sort_values(by="total_value", ascending=False)

    category_value = []
    category_count = []
    top_categories = []
    for rank, (_, row) in enumerate(cat_grp.iterrows(), 1):
        cat = str(row["product_category"])
        val = round(float(row["total_value"]), 2)
        cnt = int(row["count"])
        avg_a = round(float(row["avg_amount"]), 2)
        pct_val = round((val / total_val) * 100, 1) if total_val > 0 else 0
        
        category_value.append({"category": cat, "total_value": val, "percentage": pct_val})
        category_count.append({"category": cat, "count": cnt})
        top_categories.append({
            "rank": rank,
            "category": cat,
            "total_value": val,
            "avg_amount": avg_a,
            "count": cnt,
            "share_percentage": pct_val
        })

    # 3. Platform distribution
    plat_grp = df_t.groupby("platform").agg(
        total_value=("tran_amount_num", "sum"),
        count=("tran_amount_num", "count")
    ).reset_index().sort_values(by="total_value", ascending=False)

    platform_amount = [
        {
            "platform": str(row["platform"]),
            "total_value": round(float(row["total_value"]), 2),
            "count": int(row["count"]),
            "percentage": round((float(row["total_value"]) / total_val) * 100, 1) if total_val > 0 else 0
        }
        for _, row in plat_grp.iterrows()
    ]

    # 4. Payment type distribution
    pay_grp = df_t.groupby("payment_type").agg(
        total_value=("tran_amount_num", "sum"),
        count=("tran_amount_num", "count")
    ).reset_index().sort_values(by="total_value", ascending=False)

    payment_type_dist = [
        {
            "payment_type": str(row["payment_type"]),
            "total_value": round(float(row["total_value"]), 2),
            "count": int(row["count"]),
            "share_percentage": round((float(row["total_value"]) / total_val) * 100, 1) if total_val > 0 else 0
        }
        for _, row in pay_grp.iterrows()
    ]

    # 5. Transaction value by age group
    # Merge customer age
    cust_age_dict = dict(zip(df_cust["cust_id"], df_cust["age"]))
    df_t["customer_age"] = df_t["cust_id"].map(cust_age_dict)
    
    def age_bucket(a):
        if pd.isna(a):
            return "Unknown"
        if a <= 25:
            return "18-25 (Young Adult)"
        elif a <= 48:
            return "26-48 (Prime Earning)"
        else:
            return "49-65+ (Mature)"

    df_t["age_segment"] = df_t["customer_age"].apply(age_bucket)
    age_grp = df_t.groupby("age_segment").agg(
        total_value=("tran_amount_num", "sum"),
        avg_amount=("tran_amount_num", "mean"),
        count=("tran_amount_num", "count")
    ).reset_index()

    age_group_val = [
        {
            "segment": row["age_segment"],
            "total_value": round(float(row["total_value"]), 2),
            "avg_amount": round(float(row["avg_amount"]), 2),
            "count": int(row["count"]),
            "percentage": round((float(row["total_value"]) / total_val) * 100, 1) if total_val > 0 else 0
        }
        for _, row in age_grp.iterrows() if row["age_segment"] != "Unknown"
    ]

    # 6. Category x Payment Type Cross-tab (for heatmap)
    cat_pay_cross = pd.crosstab(
        df_t["product_category"],
        df_t["payment_type"],
        values=df_t["tran_amount_num"],
        aggfunc="sum"
    ).fillna(0)

    category_payment_matrix = []
    pay_columns = list(cat_pay_cross.columns)
    for cat, row in cat_pay_cross.iterrows():
        row_dict = {"category": str(cat)}
        for p_col in pay_columns:
            row_dict[str(p_col)] = round(float(row[p_col]), 2)
        category_payment_matrix.append(row_dict)

    # 7. Platform x Category matrix
    plat_cat_cross = pd.crosstab(
        df_t["platform"],
        df_t["product_category"],
        values=df_t["tran_amount_num"],
        aggfunc="sum"
    ).fillna(0)

    platform_category_matrix = []
    cat_columns = list(plat_cat_cross.columns)
    for plat, row in plat_cat_cross.iterrows():
        row_dict = {"platform": str(plat)}
        for c_col in cat_columns:
            row_dict[str(c_col)] = round(float(row[c_col]), 2)
        platform_category_matrix.append(row_dict)

    return {
        "summary": {
            "total_value": round(total_val, 2),
            "avg_amount": round(avg_amt, 2),
            "median_amount": round(med_amt, 2),
            "total_count": total_cnt
        },
        "monthly_trend": monthly_trend,
        "category_value": category_value,
        "category_count": category_count,
        "platform_amount": platform_amount,
        "payment_type_distribution": payment_type_dist,
        "age_group_value": age_group_val,
        "category_payment_matrix": category_payment_matrix,
        "payment_columns": [str(c) for c in pay_columns],
        "platform_category_matrix": platform_category_matrix,
        "category_columns": [str(c) for c in cat_columns],
        "top_categories": top_categories
    }
