"""
CreditIQ Analytics - Data Store & Lifecycle Management
Manages in-memory datasets, deterministic seed control, query filter caching,
optimized data exploration, and clean CSV exports with relational customer integrity.
"""

import hashlib
import json
import math
import numpy as np
import pandas as pd
import sys
from pathlib import Path
from typing import Optional, Dict, Any, List

_BASE_DIR = Path(__file__).resolve().parent
_ROOT_DIR = _BASE_DIR.parent.parent
for _d in (str(_BASE_DIR.parent), str(_ROOT_DIR)):
    if _d not in sys.path:
        sys.path.insert(0, _d)

try:
    from backend.analytics.data_generator import generate_synthetic_data
    from backend.analytics.data_quality import inspect_data_quality
    from backend.analytics.preprocessing import run_cleaning_pipeline
except ImportError:
    from analytics.data_generator import generate_synthetic_data
    from analytics.data_quality import inspect_data_quality
    from analytics.preprocessing import run_cleaning_pipeline


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
            "VALIDATED": "Completed",
            "CLEANED": "Completed",
            "ANALYZED": "Completed",
            "SEGMENTED": "Completed"
        }
        # In-memory query cache for filtered datasets to prevent repeated 65k row scans
        self._filter_cache: Dict[str, Dict[str, pd.DataFrame]] = {}
        self.reset(seed)

    @classmethod
    def get_instance(cls) -> "DataStore":
        if cls._instance is None:
            cls._instance = DataStore(seed=42)
        return cls._instance

    def reset(self, seed: int = 42) -> None:
        """
        Deterministically regenerates all datasets from the given seed
        and clears query caches.
        """
        self.seed = seed
        self._filter_cache.clear()
        self.raw_data = generate_synthetic_data(seed=seed)
        self.cleaned_data, self.cleaning_report = run_cleaning_pipeline(self.raw_data)
        self.is_cleaned = True
        self.pipeline_stages = {
            "RAW_DATA": "Completed",
            "VALIDATED": "Completed",
            "CLEANED": "Completed",
            "ANALYZED": "Completed",
            "SEGMENTED": "Completed"
        }

    def apply_cleaning(self) -> Dict[str, Any]:
        """
        Re-executes the cleaning pipeline and invalidates caches.
        """
        self._filter_cache.clear()
        self.cleaned_data, self.cleaning_report = run_cleaning_pipeline(self.raw_data)
        self.is_cleaned = True
        return self.cleaning_report

    def get_active_data(self, use_raw: bool = False) -> Dict[str, pd.DataFrame]:
        return self.raw_data if (use_raw or not self.is_cleaned) else self.cleaned_data

    def _hash_filters(self, filters: Dict[str, Any], use_raw: bool) -> str:
        serialized = json.dumps(filters, sort_keys=True, default=str)
        return hashlib.md5(f"{serialized}_{use_raw}_{self.seed}_{self.is_cleaned}".encode("utf-8")).hexdigest()

    def filter_data(self, filters: Dict[str, Any], use_raw: bool = False) -> Dict[str, pd.DataFrame]:
        """
        Applies global filters with relational customer integrity and caching.
        Filters customers, credit profiles, transactions, and experiment cohorts.
        """
        cache_key = self._hash_filters(filters, use_raw)
        if cache_key in self._filter_cache:
            return self._filter_cache[cache_key]

        base = self.get_active_data(use_raw=use_raw)
        df_cust = base["customers"].copy()
        df_credit = base["credit_profiles"].copy()
        df_txn = base["transactions"].copy()
        df_exp = base["experiment"].copy() if "experiment" in base else pd.DataFrame()

        # 1. Customer filters
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

        # 2. Credit filters
        df_credit = df_credit[df_credit["cust_id"].isin(valid_cust_ids)]
        if filters.get("credit_score_min") is not None:
            df_credit = df_credit[df_credit["credit_score"].fillna(0) >= float(filters["credit_score_min"])]
        if filters.get("credit_score_max") is not None:
            df_credit = df_credit[df_credit["credit_score"].fillna(999) <= float(filters["credit_score_max"])]

        valid_cust_ids = set(df_credit["cust_id"])
        df_cust = df_cust[df_cust["cust_id"].isin(valid_cust_ids)]

        # 3. Transaction filters (linked via cust_id)
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

        # 4. Experiment filters (linked via customer_id)
        if not df_exp.empty and "customer_id" in df_exp.columns:
            filtered_exp = df_exp[df_exp["customer_id"].isin(valid_cust_ids)]
            # If filtered experiment has adequate sample size (>=10 per group), use it;
            # otherwise retain full experiment so A/B statistical testing doesn't collapse
            if len(filtered_exp[filtered_exp["group"] == "Control"]) >= 10 and len(filtered_exp[filtered_exp["group"] == "Test"]) >= 10:
                df_exp = filtered_exp

        result = {
            "customers": df_cust,
            "credit_profiles": df_credit,
            "transactions": df_txn,
            "experiment": df_exp
        }

        # Store in cache (limit cache size to 32 entries)
        if len(self._filter_cache) > 32:
            self._filter_cache.clear()
        self._filter_cache[cache_key] = result
        return result

    def query_table(
        self,
        table_name: str,
        page: int = 1,
        page_size: int = 25,
        search_term: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_direction: str = "asc"
    ) -> Dict[str, Any]:
        """
        High-performance paginated data explorer with vectorized search
        and strict bounds validation.
        """
        tbl = table_name.lower().strip()

        # Resolve target DataFrame
        if tbl == "customers":
            df = self.raw_data["customers"].copy()
        elif tbl == "cleaned_customers":
            df = self.cleaned_data["customers"].copy()
        elif tbl == "credit_profiles":
            df = self.raw_data["credit_profiles"].copy()
        elif tbl == "cleaned_credit":
            df = self.cleaned_data["credit_profiles"].copy()
        elif tbl == "transactions":
            df = self.raw_data["transactions"].copy()
        elif tbl == "cleaned_transactions":
            df = self.cleaned_data["transactions"].copy()
        elif tbl == "experiment":
            df = self.raw_data["experiment"].copy()
        else:
            return {"error": f"Invalid table name '{table_name}'. Supported tables: customers, credit_profiles, transactions, experiment."}

        total_rows = len(df)

        # Vectorized search optimization: search only across string/text columns
        if search_term and search_term.strip():
            term = search_term.strip().lower()
            str_cols = df.select_dtypes(include=["object", "string", "category"]).columns
            if len(str_cols) > 0:
                mask = pd.Series(False, index=df.index)
                for col in str_cols:
                    mask |= df[col].astype(str).str.lower().str.contains(term, regex=False, na=False)
                df = df[mask]
            else:
                df = df[df.astype(str).apply(lambda row: row.str.lower().str.contains(term, regex=False).any(), axis=1)]

        filtered_rows = len(df)

        # Validated sorting
        if sort_by and sort_by in df.columns:
            ascending = (sort_direction.lower() == "asc")
            df = df.sort_values(by=sort_by, ascending=ascending, na_position="last")

        # Bounded pagination (page >= 1, 5 <= page_size <= 100)
        page = max(1, page)
        page_size = max(5, min(page_size, 100))
        total_pages = max(1, math.ceil(filtered_rows / page_size))
        page = min(page, total_pages)

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_df = df.iloc[start_idx:end_idx]

        records = page_df.where(pd.notnull(page_df), None).to_dict(orient="records")

        return {
            "table_name": tbl,
            "page": page,
            "page_size": page_size,
            "total_rows": total_rows,
            "filtered_rows": filtered_rows,
            "total_pages": total_pages,
            "columns": list(df.columns),
            "data": records
        }


def get_data_store() -> DataStore:
    return DataStore.get_instance()
