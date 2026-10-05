"""
CreditIQ Analytics - Data Store & Lifecycle Management
Manages in-memory datasets, filtering engine, cleaning status, and CSV exports.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from backend.analytics.data_generator import generate_synthetic_data
from backend.analytics.data_quality import inspect_data_quality
from backend.analytics.preprocessing import run_cleaning_pipeline


class DataStore:
    _instance: Optional["DataStore"] = None

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.raw_data: Dict[str, pd.DataFrame] = {}
        self.cleaned_data: Dict[str, pd.DataFrame] = {}
        self.cleaning_report: Optional[Dict[str, Any]] = None
        self.is_cleaned: bool = False
        self.pipeline_stages: Dict[str, str] = {
            "RAW_DATA": "Completed",
            "VALIDATED": "Pending",
            "CLEANED": "Pending",
            "ANALYZED": "Pending",
            "SEGMENTED": "Pending",
            "EXPERIMENT_READY": "Pending",
            "TESTED": "Pending"
        }
        self.reset(seed)

    @classmethod
    def get_instance(cls) -> "DataStore":
        if cls._instance is None:
            cls._instance = DataStore(seed=42)
        return cls._instance

    def reset(self, seed: int = 42) -> None:
        self.seed = seed
        self.raw_data = generate_synthetic_data(seed=seed)
        self.cleaned_data, self.cleaning_report = run_cleaning_pipeline(self.raw_data)
        # By default start with Cleaned data active so the user can immediately explore,
        # but also allow toggling or inspecting raw data
        self.is_cleaned = True
        self.pipeline_stages = {
            "RAW_DATA": "Completed",
            "VALIDATED": "Completed",
            "CLEANED": "Completed",
            "ANALYZED": "Completed",
            "SEGMENTED": "Completed",
            "EXPERIMENT_READY": "Completed",
            "TESTED": "Completed"
        }

    def apply_cleaning(self) -> Dict[str, Any]:
        self.cleaned_data, self.cleaning_report = run_cleaning_pipeline(self.raw_data)
        self.is_cleaned = True
        self.pipeline_stages["CLEANED"] = "Completed"
        self.pipeline_stages["ANALYZED"] = "Completed"
        self.pipeline_stages["SEGMENTED"] = "Completed"
        self.pipeline_stages["EXPERIMENT_READY"] = "Completed"
        return self.cleaning_report

    def get_active_data(self, use_raw: bool = False) -> Dict[str, pd.DataFrame]:
        return self.raw_data if (use_raw or not self.is_cleaned) else self.cleaned_data

    def filter_data(self, filters: Dict[str, Any], use_raw: bool = False) -> Dict[str, pd.DataFrame]:
        """
        Applies global filters across customers, credit, and transactions.
        """
        base = self.get_active_data(use_raw=use_raw)
        df_cust = base["customers"].copy()
        df_credit = base["credit_profiles"].copy()
        df_txn = base["transactions"].copy()

        # Customer filters
        if filters.get("age_min") is not None:
            df_cust = df_cust[df_cust["age"] >= float(filters["age_min"])]
        if filters.get("age_max") is not None:
            df_cust = df_cust[df_cust["age"] <= float(filters["age_max"])]

        if filters.get("gender") and filters["gender"] != "All":
            df_cust = df_cust[df_cust["gender"] == filters["gender"]]

        if filters.get("location") and filters["location"] != "All":
            df_cust = df_cust[df_cust["location"] == filters["location"]]

        if filters.get("occupation") and filters["occupation"] != "All":
            df_cust = df_cust[df_cust["occupation"] == filters["occupation"]]

        if filters.get("marital_status") and filters["marital_status"] != "All":
            df_cust = df_cust[df_cust["marital_status"] == filters["marital_status"]]

        if filters.get("income_min") is not None:
            df_cust = df_cust[df_cust["annual_income"].fillna(0) >= float(filters["income_min"])]
        if filters.get("income_max") is not None:
            df_cust = df_cust[df_cust["annual_income"].fillna(9999999) <= float(filters["income_max"])]

        valid_cust_ids = set(df_cust["cust_id"])

        # Credit filters
        df_credit = df_credit[df_credit["cust_id"].isin(valid_cust_ids)]
        if filters.get("credit_score_min") is not None:
            df_credit = df_credit[df_credit["credit_score"].fillna(0) >= float(filters["credit_score_min"])]
        if filters.get("credit_score_max") is not None:
            df_credit = df_credit[df_credit["credit_score"].fillna(999) <= float(filters["credit_score_max"])]

        valid_cust_ids = set(df_credit["cust_id"])
        df_cust = df_cust[df_cust["cust_id"].isin(valid_cust_ids)]

        # Transaction filters
        df_txn = df_txn[df_txn["cust_id"].isin(valid_cust_ids)]

        if filters.get("product_category") and filters["product_category"] != "All":
            df_txn = df_txn[df_txn["product_category"] == filters["product_category"]]

        if filters.get("platform") and filters["platform"] != "All":
            df_txn = df_txn[df_txn["platform"] == filters["platform"]]

        if filters.get("payment_type") and filters["payment_type"] != "All":
            df_txn = df_txn[df_txn["payment_type"] == filters["payment_type"]]

        if filters.get("date_start"):
            df_txn = df_txn[df_txn["tran_date"] >= filters["date_start"]]
        if filters.get("date_end"):
            df_txn = df_txn[df_txn["tran_date"] <= filters["date_end"]]

        return {
            "customers": df_cust,
            "credit_profiles": df_credit,
            "transactions": df_txn,
            "experiment": base["experiment"]
        }


def get_data_store() -> DataStore:
    return DataStore.get_instance()
