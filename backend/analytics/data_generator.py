"""
CreditIQ Analytics - Synthetic Data Generator
Generates realistic customer, credit profile, transaction, and experiment datasets
with controlled data-quality issues as specified in requirements.
Logically connects customer IDs across customers, credit profiles, transactions, and experiment cohorts.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List

FIRST_NAMES_MALE = [
    "Aarav", "Vihaan", "Aditya", "Rohan", "Kabir", "Arjun", "Rahul", "Dev", "Vikram",
    "Kunal", "Siddharth", "Amit", "Naveen", "Varun", "Manish", "Gaurav", "Karan",
    "Sanjay", "Anand", "Rishi", "Sameer", "Rajesh", "Prakash", "Nikhil", "Tarun"
]
FIRST_NAMES_FEMALE = [
    "Ananya", "Diya", "Isha", "Rhea", "Pooja", "Sneha", "Kavya", "Tanvi", "Neha",
    "Priyanka", "Shruti", "Meera", "Deepika", "Shreya", "Aditi", "Simran", "Nandini",
    "Ritu", "Swati", "Preeti", "Komal", "Divya", "Sunita", "Megha", "Jyoti"
]
LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Rao", "Reddy", "Singh",
    "Kapoor", "Chatterjee", "Banerjee", "Deshmukh", "Joshi", "Bhat", "Saxena",
    "Gupta", "Agarwal", "Bose", "Choudhury", "Menon", "Pillai", "Kulkarni", "Das"
]

LOCATIONS = ["City", "Suburb", "Rural"]
LOCATION_WEIGHTS = [0.55, 0.30, 0.15]

OCCUPATIONS = [
    "Freelancer", "Consultant", "Business Owner", "Data Scientist",
    "Fullstack Developer", "Accountant", "Artist"
]
OCCUPATION_WEIGHTS = [0.15, 0.18, 0.14, 0.16, 0.17, 0.12, 0.08]

OCCUPATION_INCOME_PARAMS = {
    "Freelancer": (52000, 16000, 28000, 95000),
    "Consultant": (98000, 24000, 55000, 175000),
    "Business Owner": (125000, 38000, 60000, 240000),
    "Data Scientist": (115000, 22000, 68000, 190000),
    "Fullstack Developer": (105000, 20000, 62000, 175000),
    "Accountant": (72000, 14000, 42000, 115000),
    "Artist": (45000, 15000, 24000, 85000)
}

PLATFORMS = ["Amazon", "Flipkart", "Shopify", "Alibaba", "Myntra", "Other"]
PLATFORM_WEIGHTS = [0.38, 0.28, 0.12, 0.06, 0.11, 0.05]

PRODUCT_CATEGORIES = [
    "Electronics", "Fashion & Apparel", "Beauty & Personal Care", "Sports",
    "Home & Kitchen", "Groceries", "Travel", "Entertainment"
]

PAYMENT_TYPES = ["Credit Card", "Debit Card", "UPI", "PhonePe", "Cash", "Net Banking"]


def generate_synthetic_data(seed: int = 42, n_customers: int = 1000, n_transactions: int = 65000) -> Dict[str, pd.DataFrame]:
    """
    Generates all primary datasets with realistic correlations, controlled dirty data,
    and logically connected customer identifiers.
    """
    rng = np.random.default_rng(seed)

    # ==========================================
    # 1. CUSTOMERS DATASET (~1,000 records)
    # ==========================================
    cust_ids = [f"CUST{i+1:04d}" for i in range(n_customers)]
    genders = rng.choice(["Male", "Female"], size=n_customers, p=[0.52, 0.48])

    names = []
    for g in genders:
        first = rng.choice(FIRST_NAMES_MALE) if g == "Male" else rng.choice(FIRST_NAMES_FEMALE)
        last = rng.choice(LAST_NAMES)
        names.append(f"{first} {last}")

    # Realistic age distribution (bimodal around 24 and 42)
    ages = []
    for _ in range(n_customers):
        r = rng.random()
        if r < 0.35:
            # Young adult (18-25 cohort focus)
            age = int(rng.normal(23, 2.5))
            age = max(18, min(age, 25))
        elif r < 0.75:
            # Mid career (26-48 cohort)
            age = int(rng.normal(37, 6.0))
            age = max(26, min(age, 48))
        else:
            # Older demographic (49-65+)
            age = int(rng.normal(56, 5.0))
            age = max(49, min(age, 75))
        ages.append(age)
    ages = np.array(ages)

    locations = rng.choice(LOCATIONS, size=n_customers, p=LOCATION_WEIGHTS)
    occupations = rng.choice(OCCUPATIONS, size=n_customers, p=OCCUPATION_WEIGHTS)

    # Realistic income based on occupation + age experience premium
    annual_incomes = []
    for occ, age in zip(occupations, ages):
        mean, std, min_val, max_val = OCCUPATION_INCOME_PARAMS[occ]
        age_factor = 1.0 + (age - 25) * 0.015 if age > 25 else 0.85
        inc = rng.normal(mean * age_factor, std)
        inc = max(min_val, min(inc, max_val * 1.3))
        annual_incomes.append(round(inc, 2))
    annual_incomes = np.array(annual_incomes, dtype=object)

    # Marital status correlated with age
    marital_statuses = []
    for age in ages:
        if age < 26:
            p_single = 0.82
        elif age < 35:
            p_single = 0.45
        else:
            p_single = 0.22
        marital_statuses.append("Single" if rng.random() < p_single else "Married")
    marital_statuses = np.array(marital_statuses, dtype=object)

    # ------------------------------------------
    # Introduce controlled dirty data in CUSTOMERS
    # ------------------------------------------
    # 1. Missing annual income (~4.8%, ~48 records)
    missing_inc_idx = rng.choice(n_customers, size=int(n_customers * 0.048), replace=False)
    for idx in missing_inc_idx:
        annual_incomes[idx] = None

    # 2. Out-of-range ages (1, 2, 110, 120, etc. ~1.0%, ~10 records)
    invalid_age_idx = rng.choice(n_customers, size=10, replace=False)
    invalid_age_values = [1, 2, 3, 110, 115, 120, 122, 125, 4, 118]
    for idx, inv_val in zip(invalid_age_idx, invalid_age_values):
        ages[idx] = inv_val

    # 3. Missing marital status (~0.8%, ~8 records)
    missing_mar_idx = rng.choice(n_customers, size=8, replace=False)
    for idx in missing_mar_idx:
        marital_statuses[idx] = None

    df_customers = pd.DataFrame({
        "cust_id": cust_ids,
        "name": names,
        "gender": genders,
        "age": ages,
        "location": locations,
        "occupation": occupations,
        "annual_income": annual_incomes,
        "marital_status": marital_statuses
    })

    # ==========================================
    # 2. CREDIT PROFILES DATASET (~1,000 records + duplicates)
    # ==========================================
    credit_scores = []
    credit_limits = []
    credit_utilisations = []
    outstanding_debts = []
    credit_inquiries = []

    for i in range(n_customers):
        age = df_customers.loc[i, "age"]
        raw_inc = df_customers.loc[i, "annual_income"]
        inc = float(raw_inc) if raw_inc is not None else 65000.0

        # Credit score: correlated with income & age (FICO range 300 - 850)
        base_score = 560 + (inc / 2400.0) + (age * 1.5) + rng.normal(0, 35)
        score = int(np.clip(base_score, 350, 850))
        credit_scores.append(score)

        # Credit limit: heavily correlated with score & income
        limit_ratio = (score - 400) / 450.0  # 0 to 1
        base_limit = (inc * 0.22) * (0.4 + 1.2 * limit_ratio) + rng.normal(0, 1500)
        limit = max(1500.0, min(base_limit, 60000.0))
        limit = round(limit, -2)  # round to nearest 100
        credit_limits.append(limit)

        # Credit utilisation: higher for lower incomes / younger ages
        util_base = 0.45 - (score - 600) * 0.0008 + rng.normal(0, 0.12)
        util = float(np.clip(util_base, 0.02, 0.95))
        credit_utilisations.append(round(util, 4))

        # Outstanding debt = limit * utilisation
        debt = round(limit * util, 2)
        outstanding_debts.append(debt)

        # Inquiries: 0 to 6
        inq = int(rng.choice([0, 1, 2, 3, 4, 5], p=[0.45, 0.28, 0.15, 0.07, 0.03, 0.02]))
        credit_inquiries.append(inq)

    credit_scores = np.array(credit_scores, dtype=object)
    credit_limits = np.array(credit_limits, dtype=object)
    credit_utilisations = np.array(credit_utilisations, dtype=object)
    outstanding_debts = np.array(outstanding_debts, dtype=object)
    credit_inquiries = np.array(credit_inquiries, dtype=object)

    # ------------------------------------------
    # Introduce controlled dirty data in CREDIT PROFILES
    # ------------------------------------------
    # 1. Missing credit limits (~2.8%, ~28 rows)
    missing_limit_idx = rng.choice(n_customers, size=int(n_customers * 0.028), replace=False)
    for idx in missing_limit_idx:
        credit_limits[idx] = None

    # 2. Outstanding debt greater than credit limit (~2.2%, ~22 rows)
    debt_viol_idx = rng.choice(n_customers, size=int(n_customers * 0.022), replace=False)
    for idx in debt_viol_idx:
        if credit_limits[idx] is not None:
            outstanding_debts[idx] = round(credit_limits[idx] * rng.uniform(1.08, 1.45), 2)

    # 3. Missing utilization (~0.7%, ~7 rows)
    missing_util_idx = rng.choice(n_customers, size=7, replace=False)
    for idx in missing_util_idx:
        credit_utilisations[idx] = None

    # 4. Missing inquiries (~0.5%, ~5 rows)
    missing_inq_idx = rng.choice(n_customers, size=5, replace=False)
    for idx in missing_inq_idx:
        credit_inquiries[idx] = None

    df_credit = pd.DataFrame({
        "cust_id": cust_ids,
        "credit_score": credit_scores,
        "credit_utilisation": credit_utilisations,
        "outstanding_debt": outstanding_debts,
        "credit_inquiries_last_6_months": credit_inquiries,
        "credit_limit": credit_limits
    })

    # 5. Duplicate customer IDs in credit profile (6 intentional duplicates)
    dup_cust_idx = rng.choice(n_customers, size=6, replace=False)
    dup_rows = df_credit.iloc[dup_cust_idx].copy()
    # Modify limit slightly in duplicate so deduplication rule has an explicit tie-break
    dup_rows["credit_limit"] = dup_rows["credit_limit"].apply(lambda v: v * 0.9 if v is not None else 5000.0)
    df_credit = pd.concat([df_credit, dup_rows], ignore_index=True)

    # ==========================================
    # 3. TRANSACTIONS DATASET (~65,000 records)
    # ==========================================
    tran_ids = [f"TXN{i+1:07d}" for i in range(n_transactions)]
    tran_cust_ids = rng.choice(cust_ids, size=n_transactions)

    # Date range: past 12 months (e.g. 2025-01-01 to 2025-12-31)
    start_date = datetime(2025, 1, 1)
    date_offsets = rng.integers(0, 365, size=n_transactions)
    tran_dates = [(start_date + timedelta(days=int(d))).strftime("%Y-%m-%d") for d in date_offsets]

    platforms = rng.choice(PLATFORMS, size=n_transactions, p=PLATFORM_WEIGHTS).astype(object)

    # Customer map for segment-specific transaction simulation
    cust_age_map = dict(zip(df_customers["cust_id"], df_customers["age"]))
    cust_inc_map = dict(zip(df_customers["cust_id"], df_customers["annual_income"]))

    categories = []
    payment_types = []
    tran_amounts = []

    for c_id in tran_cust_ids:
        c_age = cust_age_map.get(c_id, 32)
        c_inc_raw = cust_inc_map.get(c_id, 65000)
        c_inc = float(c_inc_raw) if c_inc_raw is not None else 65000.0

        # Segment-specific Category distribution
        if c_age <= 25:
            cat_weights = [0.28, 0.24, 0.16, 0.08, 0.05, 0.05, 0.06, 0.08]
            pay_weights = [0.28, 0.22, 0.26, 0.16, 0.03, 0.05]
            mean_spend = 125.0 + (c_inc / 1800.0)
            std_spend = 65.0
        elif c_age <= 48:
            cat_weights = [0.22, 0.18, 0.12, 0.10, 0.14, 0.10, 0.08, 0.06]
            pay_weights = [0.46, 0.18, 0.16, 0.08, 0.02, 0.10]
            mean_spend = 160.0 + (c_inc / 1400.0)
            std_spend = 85.0
        else:
            cat_weights = [0.14, 0.12, 0.08, 0.07, 0.20, 0.22, 0.09, 0.08]
            pay_weights = [0.52, 0.22, 0.08, 0.04, 0.04, 0.10]
            mean_spend = 145.0 + (c_inc / 1500.0)
            std_spend = 75.0

        cat = rng.choice(PRODUCT_CATEGORIES, p=cat_weights)
        amt = rng.normal(mean_spend, std_spend)
        pay = rng.choice(PAYMENT_TYPES, p=pay_weights)

        # Category-based ticket scaling
        if cat == "Electronics":
            amt *= 1.45
        elif cat == "Travel":
            amt *= 1.85
        elif cat == "Groceries":
            amt *= 0.55
        elif cat == "Beauty & Personal Care":
            amt *= 0.75

        amt = max(8.5, min(amt, 3200.0))
        categories.append(cat)
        payment_types.append(pay)
        tran_amounts.append(round(amt, 2))

    categories = np.array(categories, dtype=object)
    payment_types = np.array(payment_types, dtype=object)
    tran_amounts = np.array(tran_amounts, dtype=object)

    # ------------------------------------------
    # Introduce controlled dirty data in TRANSACTIONS
    # ------------------------------------------
    # 1. Missing platform values (~1.5%, ~975 rows)
    missing_plat_idx = rng.choice(n_transactions, size=int(n_transactions * 0.015), replace=False)
    for idx in missing_plat_idx:
        platforms[idx] = None

    # 2. Zero transaction amounts (~0.5%, ~325 rows)
    zero_amt_idx = rng.choice(n_transactions, size=int(n_transactions * 0.005), replace=False)
    for idx in zero_amt_idx:
        tran_amounts[idx] = 0.0

    # 3. Extreme transaction values (7 intentional anomalies between $39,500 and $84,000)
    extreme_idx = rng.choice(n_transactions, size=7, replace=False)
    extreme_values = [42500.0, 58000.0, 72000.0, 39500.0, 84000.0, 65000.0, 49000.0]
    for idx, ext_val in zip(extreme_idx, extreme_values):
        tran_amounts[idx] = ext_val

    # 4. Missing product_category (~0.8%) & payment_type (~0.8%)
    missing_cat_idx = rng.choice(n_transactions, size=int(n_transactions * 0.008), replace=False)
    for idx in missing_cat_idx:
        categories[idx] = None

    missing_pay_idx = rng.choice(n_transactions, size=int(n_transactions * 0.008), replace=False)
    for idx in missing_pay_idx:
        payment_types[idx] = None

    df_transactions = pd.DataFrame({
        "tran_id": tran_ids,
        "cust_id": tran_cust_ids,
        "tran_date": tran_dates,
        "tran_amount": tran_amounts,
        "platform": platforms,
        "product_category": categories,
        "payment_type": payment_types
    })

    # ==========================================
    # 4. REDESIGNED EXPERIMENT DATASET (A/B Test)
    # ==========================================
    # Connects directly to customer IDs and segments!
    # Target segment: 18-25 cohort targeted for rewards campaign
    # Control: Standard card offering
    # Test: Enhanced rewards (Electronics/Fashion 5% cashback)
    n_exp_per_group = 1400
    exp_dates = []
    exp_start = datetime(2025, 9, 1)

    for i in range(n_exp_per_group * 2):
        d = exp_start + timedelta(days=int(i % 30), hours=int(rng.integers(8, 22)))
        exp_dates.append(d.strftime("%Y-%m-%d"))

    # Randomly assign customers to experiment
    # Over-index on target cohort (18-25) while including cross-segment customers for filtering
    young_custs = df_customers[df_customers["age"] <= 25]["cust_id"].tolist()
    other_custs = df_customers[df_customers["age"] > 25]["cust_id"].tolist()

    if not young_custs:
        young_custs = cust_ids[:300]
    if not other_custs:
        other_custs = cust_ids[300:]

    # Sample customer IDs with replacement for the 2,800 experiment transactions
    exp_assigned_custs = []
    for _ in range(n_exp_per_group * 2):
        if rng.random() < 0.70:
            exp_assigned_custs.append(rng.choice(young_custs))
        else:
            exp_assigned_custs.append(rng.choice(other_custs))

    # Control group values: Mean ~$146.20, std ~$38.50
    control_vals = rng.normal(loc=146.20, scale=38.50, size=n_exp_per_group)
    control_vals = np.clip(control_vals, 15.0, 450.0)

    # Test group values: Mean ~$158.80 (Lift ~+8.6%), std ~$39.20
    test_vals = rng.normal(loc=158.80, scale=39.20, size=n_exp_per_group)
    test_vals = np.clip(test_vals, 18.0, 480.0)

    exp_groups = ["Control"] * n_exp_per_group + ["Test"] * n_exp_per_group
    exp_metric_vals = np.concatenate([control_vals, test_vals])

    # Build customer attributes into experiment records for relational integrity
    exp_ids = [f"EXP2025_{i+1:05d}" for i in range(len(exp_groups))]
    exp_segments = []
    for c_id in exp_assigned_custs:
        age_val = cust_age_map.get(c_id, 24)
        if age_val <= 25:
            exp_segments.append("18–25")
        elif age_val <= 48:
            exp_segments.append("26–48")
        else:
            exp_segments.append("49–65+")

    df_experiment = pd.DataFrame({
        "experiment_id": exp_ids,
        "customer_id": exp_assigned_custs,
        "group": exp_groups,
        "metric": ["average_transaction_value"] * len(exp_groups),
        "metric_value": np.round(exp_metric_vals, 2),
        "experiment_date": exp_dates,
        "segment_name": exp_segments
    })

    return {
        "customers": df_customers,
        "credit_profiles": df_credit,
        "transactions": df_transactions,
        "experiment": df_experiment
    }
