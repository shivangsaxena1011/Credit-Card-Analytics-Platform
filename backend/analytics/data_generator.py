"""
CreditIQ Analytics - Synthetic Data Generator
Generates realistic customer, credit profile, transaction, and experiment datasets
with controlled data-quality issues as specified in requirements.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, Optional

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
    Generates all primary datasets with realistic correlations and controlled dirty data.
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

    # Realistic age distribution (bimodal around 28 and 45)
    ages = []
    for _ in range(n_customers):
        if rng.random() < 0.35:
            # Young adult
            age = int(rng.normal(24, 3.5))
            age = max(18, min(age, 32))
        elif rng.random() < 0.70:
            # Mid career
            age = int(rng.normal(38, 6.0))
            age = max(26, min(age, 52))
        else:
            # Older demographic
            age = int(rng.normal(56, 5.0))
            age = max(45, min(age, 75))
        ages.append(age)
    ages = np.array(ages)

    locations = rng.choice(LOCATIONS, size=n_customers, p=LOCATION_WEIGHTS)
    occupations = rng.choice(OCCUPATIONS, size=n_customers, p=OCCUPATION_WEIGHTS)

    # Realistic income based on occupation + age effect
    annual_incomes = []
    for occ, age in zip(occupations, ages):
        mean, std, min_val, max_val = OCCUPATION_INCOME_PARAMS[occ]
        # Age experience bonus: peak between 35-55
        experience_mult = 0.75 + 0.35 * (1 - abs(age - 45) / 35)
        experience_mult = max(0.65, min(1.35, experience_mult))
        raw_inc = rng.normal(mean * experience_mult, std)
        clipped_inc = max(min_val, min(max_val * 1.2, raw_inc))
        annual_incomes.append(round(clipped_inc, -2))
    annual_incomes = np.array(annual_incomes, dtype=object)

    marital_status = []
    for age in ages:
        p_married = 0.15 if age < 26 else (0.65 if age < 45 else 0.82)
        marital_status.append("Married" if rng.random() < p_married else "Single")
    marital_status = np.array(marital_status, dtype=object)

    # ------------------------------------------
    # Introduce controlled dirty data in CUSTOMERS
    # ------------------------------------------
    # 1. Unrealistic ages (1, 2, 110, 120, etc.)
    dirty_age_indices = rng.choice(n_customers, size=10, replace=False)
    dirty_ages = [1, 2, 2, 110, 115, 120, 122, -4, 0, 118]
    for idx, d_age in zip(dirty_age_indices, dirty_ages):
        ages[idx] = d_age

    # 2. Missing annual income (~48 records, ~4.8%)
    missing_inc_indices = rng.choice(n_customers, size=48, replace=False)
    for idx in missing_inc_indices:
        annual_incomes[idx] = np.nan

    # 3. Missing categorical fields (marital_status, location)
    missing_marital_indices = rng.choice(n_customers, size=8, replace=False)
    for idx in missing_marital_indices:
        marital_status[idx] = None

    df_customers = pd.DataFrame({
        "cust_id": cust_ids,
        "name": names,
        "gender": genders,
        "age": ages,
        "location": locations,
        "occupation": occupations,
        "annual_income": annual_incomes,
        "marital_status": marital_status
    })

    # ==========================================
    # 2. CREDIT PROFILES DATASET (~1,000 records + duplicates)
    # ==========================================
    credit_scores = []
    credit_limits = []
    credit_utilisations = []
    outstanding_debts = []
    inquiries_list = []

    for i in range(n_customers):
        age = ages[i]
        # Valid age approximation for credit modeling
        eff_age = 35 if (age < 15 or age > 85) else age
        inc = annual_incomes[i]
        eff_inc = 75000 if (pd.isna(inc) or inc is None) else float(inc)

        # Younger people have slightly lower credit scores and limits
        base_score = 640 if eff_age < 26 else (695 if eff_age < 49 else 725)
        score = int(rng.normal(base_score, 55))
        score = max(320, min(850, score))
        credit_scores.append(score)

        # Credit limit strongly correlated with income and score
        score_factor = (score - 300) / 550
        limit = int((eff_inc * 0.28) * score_factor + rng.normal(3000, 1200))
        limit = max(1500, min(45000, round(limit, -2)))
        credit_limits.append(limit)

        # Utilization inversely related to score, higher for younger
        base_util = 0.48 if eff_age < 26 else 0.32
        util = max(0.02, min(0.96, rng.normal(base_util, 0.18)))
        credit_utilisations.append(round(util, 4))

        # Outstanding debt = limit * util + noise
        debt = round(limit * util, 2)
        outstanding_debts.append(debt)

        # Inquiries
        inquiries = int(rng.poisson(1.4 if eff_age < 30 else 0.8))
        inquiries = min(6, inquiries)
        inquiries_list.append(inquiries)

    credit_scores = np.array(credit_scores, dtype=object)
    credit_limits = np.array(credit_limits, dtype=object)
    credit_utilisations = np.array(credit_utilisations, dtype=object)
    outstanding_debts = np.array(outstanding_debts, dtype=object)
    inquiries_list = np.array(inquiries_list, dtype=object)

    # ------------------------------------------
    # Introduce controlled dirty data in CREDIT PROFILES
    # ------------------------------------------
    # 1. Missing credit limits (~28 records)
    missing_limit_idx = rng.choice(n_customers, size=28, replace=False)
    for idx in missing_limit_idx:
        credit_limits[idx] = np.nan

    # 2. Outstanding debt exceeds credit limit (business rule violation, ~22 records)
    violation_idx = rng.choice(
        [i for i in range(n_customers) if i not in missing_limit_idx],
        size=22,
        replace=False
    )
    for idx in violation_idx:
        outstanding_debts[idx] = round(float(credit_limits[idx]) * rng.uniform(1.15, 1.65), 2)

    # 3. Missing numeric values (inquiries or utilisation, ~15 records)
    missing_num_idx = rng.choice(n_customers, size=15, replace=False)
    for idx in missing_num_idx[:8]:
        credit_utilisations[idx] = np.nan
    for idx in missing_num_idx[8:]:
        inquiries_list[idx] = np.nan

    df_credit = pd.DataFrame({
        "cust_id": cust_ids,
        "credit_score": credit_scores,
        "credit_utilisation": credit_utilisations,
        "outstanding_debt": outstanding_debts,
        "credit_inquiries_last_6_months": inquiries_list,
        "credit_limit": credit_limits
    })

    # 4. Duplicate customer IDs in credit profile (~6 duplicate rows)
    dup_cust_indices = rng.choice(n_customers, size=6, replace=False)
    dup_rows = df_credit.iloc[dup_cust_indices].copy()
    # slightly modify or repeat
    for _, row in dup_rows.iterrows():
        if pd.notna(row["credit_limit"]):
            row["credit_limit"] = round(float(row["credit_limit"]) * 1.05, -2)
    df_credit = pd.concat([df_credit, dup_rows], ignore_index=True)

    # ==========================================
    # 3. TRANSACTIONS DATASET (65,000 records)
    # ==========================================
    # Map cust_id to customer age & profile for realistic transactional patterns
    cust_age_map = dict(zip(df_customers["cust_id"], ages))
    
    tran_cust_ids = rng.choice(cust_ids, size=n_transactions)
    tran_ids = [f"TXN{i+1:06d}" for i in range(n_transactions)]

    start_date = datetime(2025, 1, 1)
    # Generate dates across 365 days
    day_offsets = rng.integers(0, 365, size=n_transactions)
    tran_dates = [
        (start_date + timedelta(days=int(d), hours=int(rng.integers(0, 24)))).strftime("%Y-%m-%d %H:%M:%S")
        for d in day_offsets
    ]

    platforms = rng.choice(PLATFORMS, size=n_transactions, p=PLATFORM_WEIGHTS).astype(object)
    
    # Category and Payment Type conditioned on Age
    categories = []
    payment_types = []
    tran_amounts = []

    for cid in tran_cust_ids:
        c_age = cust_age_map.get(cid, 35)
        is_young = (18 <= c_age <= 25)

        # Young customers prefer Electronics, Fashion, Beauty, Entertainment
        if is_young:
            cat_weights = [0.26, 0.24, 0.18, 0.08, 0.06, 0.06, 0.05, 0.07]
            # Lower credit card share for young (card usage gap!): UPI/PhonePe preferred
            pay_weights = [0.24, 0.18, 0.32, 0.16, 0.06, 0.04]
            # Log-normal transaction amount (mean ~$145)
            amt = rng.lognormal(mean=4.75, sigma=0.68)
        elif c_age < 49:
            cat_weights = [0.18, 0.16, 0.11, 0.12, 0.15, 0.14, 0.09, 0.05]
            pay_weights = [0.46, 0.16, 0.18, 0.08, 0.04, 0.08]
            amt = rng.lognormal(mean=5.10, sigma=0.72)
        else:
            cat_weights = [0.12, 0.12, 0.08, 0.09, 0.22, 0.22, 0.10, 0.05]
            pay_weights = [0.52, 0.14, 0.10, 0.04, 0.08, 0.12]
            amt = rng.lognormal(mean=5.05, sigma=0.65)

        cat = rng.choice(PRODUCT_CATEGORIES, p=cat_weights)
        pay = rng.choice(PAYMENT_TYPES, p=pay_weights)

        # Category-based adjustment
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

    # 3. Extreme transaction values (outliers, e.g. 7 records between $38,000 and $85,000)
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
    # 4. EXPERIMENT DATASET (A/B Test)
    # ==========================================
    # Campaign targeting 18-25 segment with a Credit Card Rewards & Cashback promotion
    # Control: Standard card offering
    # Test: Enhanced rewards on Electronics, Fashion & Beauty + 5% cashback
    n_exp_per_group = 1400
    exp_dates = []
    exp_start = datetime(2025, 9, 1)

    for i in range(n_exp_per_group * 2):
        d = exp_start + timedelta(days=int(i % 30), hours=int(rng.integers(8, 22)))
        exp_dates.append(d.strftime("%Y-%m-%d"))

    # Control group values: Mean ~$146.20, std ~$38.50
    control_vals = rng.normal(loc=146.20, scale=38.50, size=n_exp_per_group)
    control_vals = np.clip(control_vals, 15.0, 450.0)

    # Test group values: Mean ~$158.80 (Lift ~+8.6%), std ~$39.20
    test_vals = rng.normal(loc=158.80, scale=39.20, size=n_exp_per_group)
    test_vals = np.clip(test_vals, 18.0, 480.0)

    # Combine into experiment dataset
    exp_groups = ["Control"] * n_exp_per_group + ["Test"] * n_exp_per_group
    exp_metric_vals = np.concatenate([control_vals, test_vals])
    
    # Shuffle in matching date order
    exp_cust_ids = [f"EXP_CUST_{i+1:04d}" for i in range(len(exp_groups))]

    df_experiment = pd.DataFrame({
        "experiment_date": exp_dates,
        "group": exp_groups,
        "customer_id": exp_cust_ids,
        "metric_value": np.round(exp_metric_vals, 2)
    })

    return {
        "customers": df_customers,
        "credit_profiles": df_credit,
        "transactions": df_transactions,
        "experiment": df_experiment
    }
