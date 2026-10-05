"""
CreditIQ Analytics - Customer Analytics Engine
Calculates demographic distributions, income distributions, cross-tabulations,
and customer profile summaries.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List


def analyze_customers(df_cust: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes comprehensive customer analytics from the customer dataset.
    """
    if df_cust.empty:
        return {
            "summary": {
                "total_customers": 0, "avg_income": 0, "median_income": 0,
                "youngest_age": 0, "oldest_age": 0, "largest_occupation": "N/A"
            },
            "age_distribution": [],
            "income_distribution": [],
            "income_by_occupation": [],
            "location_distribution": [],
            "gender_distribution": [],
            "marital_distribution": [],
            "income_vs_age": [],
            "occupation_location_matrix": []
        }

    valid_ages = df_cust[df_cust["age"].between(15, 85)]["age"]
    youngest_age = int(valid_ages.min()) if not valid_ages.empty else int(df_cust["age"].min())
    oldest_age = int(valid_ages.max()) if not valid_ages.empty else int(df_cust["age"].max())

    valid_income = df_cust["annual_income"].dropna()
    avg_income = float(valid_income.mean()) if not valid_income.empty else 0.0
    median_income = float(valid_income.median()) if not valid_income.empty else 0.0

    occ_counts = df_cust["occupation"].value_counts()
    largest_occ = occ_counts.index[0] if not occ_counts.empty else "N/A"

    # Age distribution buckets
    age_bins = [17, 25, 35, 45, 55, 65, 125]
    age_labels = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"]
    df_cust_copy = df_cust.copy()
    df_cust_copy["age_group"] = pd.cut(df_cust_copy["age"], bins=age_bins, labels=age_labels, right=True)
    age_dist = []
    for label in age_labels:
        cnt = int((df_cust_copy["age_group"] == label).sum())
        pct = round((cnt / len(df_cust)) * 100, 1)
        age_dist.append({"age_group": label, "count": cnt, "percentage": pct})

    # Income distribution buckets
    income_bins = [0, 40000, 60000, 80000, 100000, 130000, 160000, 1000000]
    income_labels = ["<$40k", "$40k-$60k", "$60k-$80k", "$80k-$100k", "$100k-$130k", "$130k-$160k", "$160k+"]
    df_cust_copy["income_bracket"] = pd.cut(df_cust_copy["annual_income"].fillna(0), bins=income_bins, labels=income_labels, right=True)
    income_dist = []
    for label in income_labels:
        cnt = int((df_cust_copy["income_bracket"] == label).sum())
        pct = round((cnt / len(df_cust)) * 100, 1)
        income_dist.append({"income_bracket": label, "count": cnt, "percentage": pct})

    # Income by occupation
    occ_group = df_cust.groupby("occupation")["annual_income"].agg(
        avg_income="mean",
        median_income="median",
        min_income="min",
        max_income="max",
        count="count"
    ).reset_index()
    occ_group = occ_group.sort_values(by="median_income", ascending=False)
    income_by_occ = []
    for _, row in occ_group.iterrows():
        income_by_occ.append({
            "occupation": row["occupation"],
            "avg_income": round(float(row["avg_income"]), 2) if pd.notna(row["avg_income"]) else 0,
            "median_income": round(float(row["median_income"]), 2) if pd.notna(row["median_income"]) else 0,
            "min_income": round(float(row["min_income"]), 2) if pd.notna(row["min_income"]) else 0,
            "max_income": round(float(row["max_income"]), 2) if pd.notna(row["max_income"]) else 0,
            "count": int(row["count"])
        })

    # Location distribution
    loc_counts = df_cust["location"].value_counts()
    location_dist = [
        {"location": loc, "count": int(cnt), "percentage": round((cnt / len(df_cust)) * 100, 1)}
        for loc, cnt in loc_counts.items()
    ]

    # Gender distribution
    gender_counts = df_cust["gender"].value_counts()
    gender_dist = [
        {"gender": g, "count": int(cnt), "percentage": round((cnt / len(df_cust)) * 100, 1)}
        for g, cnt in gender_counts.items()
    ]

    # Marital status distribution
    marital_counts = df_cust["marital_status"].value_counts()
    marital_dist = [
        {"marital_status": str(m), "count": int(cnt), "percentage": round((cnt / len(df_cust)) * 100, 1)}
        for m, cnt in marital_counts.items()
    ]

    # Sample scatter points for Income vs Age (capped sample for fast rendering)
    scatter_df = df_cust.dropna(subset=["age", "annual_income"]).copy()
    scatter_df = scatter_df[(scatter_df["age"] >= 18) & (scatter_df["age"] <= 80)]
    if len(scatter_df) > 300:
        scatter_sample = scatter_df.sample(n=300, random_state=42)
    else:
        scatter_sample = scatter_df
    
    income_vs_age = [
        {"age": int(r["age"]), "income": round(float(r["annual_income"]), 2), "occupation": r["occupation"], "name": r["name"]}
        for _, r in scatter_sample.iterrows()
    ]

    # Occupation by location cross-breakdown
    cross_df = df_cust.groupby(["occupation", "location"])["annual_income"].mean().unstack(fill_value=0)
    occ_loc_matrix = []
    for occ, row in cross_df.iterrows():
        occ_loc_matrix.append({
            "occupation": occ,
            "City": round(float(row.get("City", 0)), 2),
            "Suburb": round(float(row.get("Suburb", 0)), 2),
            "Rural": round(float(row.get("Rural", 0)), 2)
        })

    return {
        "summary": {
            "total_customers": len(df_cust),
            "avg_income": round(avg_income, 2),
            "median_income": round(median_income, 2),
            "youngest_age": youngest_age,
            "oldest_age": oldest_age,
            "largest_occupation": largest_occ
        },
        "age_distribution": age_dist,
        "income_distribution": income_dist,
        "income_by_occupation": income_by_occ,
        "location_distribution": location_dist,
        "gender_distribution": gender_dist,
        "marital_distribution": marital_dist,
        "income_vs_age": income_vs_age,
        "occupation_location_matrix": occ_loc_matrix
    }
