"""
CreditIQ Analytics - FastAPI Backend Server
Provides comprehensive REST API endpoints for banking analytics,
customer segmentation, statistical A/B testing, and reporting.
"""

import io
import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.analytics.data_loader import get_data_store
from backend.analytics.data_quality import inspect_data_quality
from backend.analytics.preprocessing import run_cleaning_pipeline
from backend.analytics.customer_analysis import analyze_customers
from backend.analytics.credit_analysis import analyze_credit
from backend.analytics.transaction_analysis import analyze_transactions
from backend.analytics.segmentation import segment_customers
from backend.analytics.target_scoring import evaluate_target_segments, DEFAULT_WEIGHTS
from backend.analytics.experiment import analyze_experiment
from backend.analytics.power_analysis import calculate_power_and_sample_size
from backend.analytics.hypothesis_testing import run_hypothesis_test
from backend.analytics.insights import generate_insights
from backend.analytics.report_generator import generate_executive_report, generate_printable_html

app = FastAPI(
    title="CreditIQ Analytics API",
    description="Credit Card Customer Analytics, Segmentation & A/B Testing Platform",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data store instance
store = get_data_store()


# ==========================================
# PYDANTIC REQUEST SCHEMAS
# ==========================================
class FilterRequest(BaseModel):
    age_min: Optional[float] = None
    age_max: Optional[float] = None
    gender: Optional[str] = "All"
    location: Optional[str] = "All"
    occupation: Optional[str] = "All"
    marital_status: Optional[str] = "All"
    income_min: Optional[float] = None
    income_max: Optional[float] = None
    credit_score_min: Optional[float] = None
    credit_score_max: Optional[float] = None
    product_category: Optional[str] = "All"
    platform: Optional[str] = "All"
    payment_type: Optional[str] = "All"
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    use_raw: Optional[bool] = False


class ResetRequest(BaseModel):
    seed: Optional[int] = 42


class AgeGroupItem(BaseModel):
    id: Optional[str] = None
    name: str
    min_age: int
    max_age: int
    label: Optional[str] = None


class SegmentationRequest(BaseModel):
    age_groups: Optional[List[AgeGroupItem]] = None
    filters: Optional[FilterRequest] = None


class TargetScoringRequest(BaseModel):
    weights: Optional[Dict[str, float]] = None
    age_groups: Optional[List[AgeGroupItem]] = None
    filters: Optional[FilterRequest] = None


class ExperimentRequest(BaseModel):
    control_label: Optional[str] = "Control"
    test_label: Optional[str] = "Test"
    metric_name: Optional[str] = "Average Transaction Value"


class PowerAnalysisRequest(BaseModel):
    alpha: Optional[float] = 0.05
    power: Optional[float] = 0.80
    effect_size: Optional[float] = 0.20
    alternative: Optional[str] = "larger"


class HypothesisTestRequest(BaseModel):
    test_type: Optional[str] = "z_test"  # "z_test" or "t_test"
    alternative: Optional[str] = "larger"  # "larger", "two-sided", "smaller"
    alpha: Optional[float] = 0.05
    control_label: Optional[str] = "Control"
    test_label: Optional[str] = "Test"


class DataExplorerRequest(BaseModel):
    table_name: str = "customers"  # customers, credit_profiles, transactions, cleaned_customers, cleaned_credit, cleaned_transactions, experiment
    page: int = 1
    page_size: int = 25
    search_term: Optional[str] = ""
    sort_by: Optional[str] = None
    sort_direction: Optional[str] = "asc"


# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/api/health")
def health_check():
    active = store.get_active_data()
    return {
        "status": "healthy",
        "app_name": "CreditIQ Analytics",
        "version": "1.0.0",
        "data_status": {
            "is_cleaned": store.is_cleaned,
            "seed": store.seed,
            "customer_count": len(active["customers"]),
            "credit_profile_count": len(active["credit_profiles"]),
            "transaction_count": len(active["transactions"]),
            "experiment_count": len(active["experiment"])
        },
        "pipeline_stages": store.pipeline_stages
    }


@app.get("/api/pipeline-status")
def get_pipeline_status():
    return {
        "stages": store.pipeline_stages,
        "is_cleaned": store.is_cleaned
    }


@app.post("/api/reset-data")
def reset_dataset(req: ResetRequest):
    """
    Resets the complete synthetic dataset with a new or default seed.
    """
    store.reset(seed=req.seed or 42)
    return {
        "message": f"Dataset successfully generated and reset with seed {store.seed}",
        "seed": store.seed,
        "is_cleaned": store.is_cleaned,
        "pipeline_stages": store.pipeline_stages
    }


@app.post("/api/clean")
def run_cleaning():
    """
    Executes the data cleaning pipeline and returns before vs after metrics.
    """
    report = store.apply_cleaning()
    return report


@app.get("/api/data-quality")
def get_data_quality():
    """
    Inspects raw dataset data quality and returns the dynamic Data Quality Score.
    """
    return inspect_data_quality(store.raw_data)


@app.post("/api/overview")
def get_overview(req: FilterRequest):
    """
    Provides top KPI cards and distribution charts reflecting global filters.
    """
    data = store.filter_data(req.model_dump(), use_raw=req.use_raw)
    df_cust = data["customers"]
    df_credit = data["credit_profiles"]
    df_txn = data["transactions"]

    # Basic KPIs
    total_cust = len(df_cust)
    total_credit = len(df_credit)
    total_txn = len(df_txn)

    txn_amounts = pd.to_numeric(df_txn["tran_amount"], errors="coerce").dropna()
    total_txn_val = float(txn_amounts.sum())
    avg_txn_val = float(txn_amounts.mean()) if total_txn > 0 else 0.0

    valid_inc = pd.to_numeric(df_cust["annual_income"], errors="coerce").dropna()
    avg_inc = float(valid_inc.mean()) if not valid_inc.empty else 0.0

    valid_score = pd.to_numeric(df_credit["credit_score"], errors="coerce").dropna()
    avg_score = float(valid_score.mean()) if not valid_score.empty else 0.0

    valid_limit = pd.to_numeric(df_credit["credit_limit"], errors="coerce").dropna()
    avg_limit = float(valid_limit.mean()) if not valid_limit.empty else 0.0

    # Data Quality overview counters
    raw_quality = inspect_data_quality(store.raw_data)

    # Customer Distributions
    cust_res = analyze_customers(df_cust)
    credit_res = analyze_credit(df_credit, df_cust)
    txn_res = analyze_transactions(df_txn, df_cust)

    return {
        "kpis": {
            "total_customers": total_cust,
            "total_credit_profiles": total_credit,
            "total_transactions": total_txn,
            "total_transaction_value": round(total_txn_val, 2),
            "avg_transaction_value": round(avg_txn_val, 2),
            "avg_annual_income": round(avg_inc, 2),
            "avg_credit_score": round(avg_score, 1),
            "avg_credit_limit": round(avg_limit, 2),
            "missing_values_detected": raw_quality["total_missing_values"],
            "duplicate_records_detected": raw_quality["total_duplicates"],
            "anomalies_detected": raw_quality["total_anomalies"],
            "quality_score": raw_quality["quality_score"],
            "is_cleaned": store.is_cleaned
        },
        "customer_distributions": {
            "age": cust_res["age_distribution"],
            "gender": cust_res["gender_distribution"],
            "location": cust_res["location_distribution"],
            "occupation": [
                {"occupation": item["occupation"], "count": item["count"]}
                for item in cust_res["income_by_occupation"]
            ]
        },
        "credit_distributions": {
            "score": credit_res["credit_score_distribution"],
            "utilisation": credit_res["utilisation_distribution"],
            "limit": credit_res["credit_limit_distribution"]
        },
        "transaction_distributions": {
            "category": txn_res["category_value"],
            "platform": txn_res["platform_amount"],
            "payment_type": txn_res["payment_type_distribution"],
            "monthly_trend": txn_res["monthly_trend"]
        }
    }


@app.post("/api/customers")
def get_customer_analytics(req: FilterRequest):
    data = store.filter_data(req.model_dump(), use_raw=req.use_raw)
    return analyze_customers(data["customers"])


@app.post("/api/credit")
def get_credit_analytics(req: FilterRequest):
    data = store.filter_data(req.model_dump(), use_raw=req.use_raw)
    return analyze_credit(data["credit_profiles"], data["customers"])


@app.post("/api/transactions")
def get_transaction_analytics(req: FilterRequest):
    data = store.filter_data(req.model_dump(), use_raw=req.use_raw)
    return analyze_transactions(data["transactions"], data["customers"])


@app.post("/api/segments")
def get_segments(req: SegmentationRequest):
    filters_dict = req.filters.model_dump() if req.filters else {}
    data = store.filter_data(filters_dict)
    
    age_groups_list = None
    if req.age_groups:
        age_groups_list = [g.model_dump() for g in req.age_groups]

    return segment_customers(
        data["customers"],
        data["credit_profiles"],
        data["transactions"],
        age_groups=age_groups_list
    )


@app.post("/api/target-segment-analysis")
def get_target_segment_analysis(req: TargetScoringRequest):
    filters_dict = req.filters.model_dump() if req.filters else {}
    data = store.filter_data(filters_dict)

    age_groups_list = None
    if req.age_groups:
        age_groups_list = [g.model_dump() for g in req.age_groups]

    seg_res = segment_customers(
        data["customers"],
        data["credit_profiles"],
        data["transactions"],
        age_groups=age_groups_list
    )

    return evaluate_target_segments(
        seg_res["segments"],
        weights=req.weights
    )


@app.post("/api/experiment-summary")
def get_experiment_summary(req: ExperimentRequest):
    base_data = store.get_active_data()
    return analyze_experiment(
        base_data["experiment"],
        control_label=req.control_label or "Control",
        test_label=req.test_label or "Test",
        metric_name=req.metric_name or "Average Transaction Value"
    )


@app.post("/api/power-analysis")
def get_power_analysis(req: PowerAnalysisRequest):
    return calculate_power_and_sample_size(
        alpha=req.alpha or 0.05,
        power=req.power or 0.80,
        effect_size=req.effect_size or 0.20,
        alternative=req.alternative or "larger"
    )


@app.post("/api/hypothesis-test")
def get_hypothesis_test(req: HypothesisTestRequest):
    base_data = store.get_active_data()
    df_exp = base_data["experiment"]

    ctrl_label = req.control_label or "Control"
    test_label = req.test_label or "Test"

    ctrl_df = df_exp[df_exp["group"] == ctrl_label]
    test_df = df_exp[df_exp["group"] == test_label]

    ctrl_vals = pd.to_numeric(ctrl_df["metric_value"], errors="coerce").dropna().values
    test_vals = pd.to_numeric(test_df["metric_value"], errors="coerce").dropna().values

    return run_hypothesis_test(
        control_vals=ctrl_vals,
        test_vals=test_vals,
        test_type=req.test_type or "z_test",
        alternative=req.alternative or "larger",
        alpha=req.alpha or 0.05
    )


@app.post("/api/insights")
def get_automated_insights(req: FilterRequest):
    filters_dict = req.model_dump()
    data = store.filter_data(filters_dict)

    cust_analytics = analyze_customers(data["customers"])
    credit_analytics = analyze_credit(data["credit_profiles"], data["customers"])
    txn_analytics = analyze_transactions(data["transactions"], data["customers"])
    segmentation_data = segment_customers(data["customers"], data["credit_profiles"], data["transactions"])
    target_data = evaluate_target_segments(segmentation_data["segments"])
    exp_data = analyze_experiment(data["experiment"])
    
    ctrl_vals = pd.to_numeric(data["experiment"][data["experiment"]["group"] == "Control"]["metric_value"], errors="coerce").dropna().values
    test_vals = pd.to_numeric(data["experiment"][data["experiment"]["group"] == "Test"]["metric_value"], errors="coerce").dropna().values
    test_result = run_hypothesis_test(ctrl_vals, test_vals, test_type="z_test", alternative="larger", alpha=0.05)

    return generate_insights(
        cust_analytics,
        credit_analytics,
        txn_analytics,
        segmentation_data,
        target_data,
        exp_data,
        test_result
    )


@app.post("/api/export-report")
def export_report_endpoint():
    """
    Builds the full executive report and returns both the structured data and printable HTML.
    """
    raw_quality = inspect_data_quality(store.raw_data)
    cleaning_rep = store.cleaning_report or store.apply_cleaning()
    
    clean_data = store.get_active_data(use_raw=False)
    df_cust = clean_data["customers"]
    df_credit = clean_data["credit_profiles"]
    df_txn = clean_data["transactions"]
    df_exp = clean_data["experiment"]

    overview_kpis = {
        "total_customers": len(df_cust),
        "total_credit_profiles": len(df_credit),
        "total_transactions": len(df_txn),
        "total_transaction_value": float(pd.to_numeric(df_txn["tran_amount"], errors="coerce").sum()),
        "avg_transaction_value": float(pd.to_numeric(df_txn["tran_amount"], errors="coerce").mean()),
        "avg_annual_income": float(pd.to_numeric(df_cust["annual_income"], errors="coerce").mean()),
        "avg_credit_score": float(pd.to_numeric(df_credit["credit_score"], errors="coerce").mean()),
        "avg_credit_limit": float(pd.to_numeric(df_credit["credit_limit"], errors="coerce").mean())
    }

    cust_analytics = analyze_customers(df_cust)
    credit_analytics = analyze_credit(df_credit, df_cust)
    txn_analytics = analyze_transactions(df_txn, df_cust)
    segmentation_data = segment_customers(df_cust, df_credit, df_txn)
    target_data = evaluate_target_segments(segmentation_data["segments"])
    exp_data = analyze_experiment(df_exp)
    power_data = calculate_power_and_sample_size(alpha=0.05, power=0.80, effect_size=0.20, alternative="larger")

    ctrl_vals = pd.to_numeric(df_exp[df_exp["group"] == "Control"]["metric_value"], errors="coerce").dropna().values
    test_vals = pd.to_numeric(df_exp[df_exp["group"] == "Test"]["metric_value"], errors="coerce").dropna().values
    hypo_data = run_hypothesis_test(ctrl_vals, test_vals, test_type="z_test", alternative="larger", alpha=0.05)

    insights_data = generate_insights(
        cust_analytics, credit_analytics, txn_analytics,
        segmentation_data, target_data, exp_data, hypo_data
    )

    report_data = generate_executive_report(
        overview_kpis, raw_quality, cleaning_rep, cust_analytics,
        credit_analytics, txn_analytics, segmentation_data,
        target_data, exp_data, power_data, hypo_data, insights_data
    )

    printable_html = generate_printable_html(report_data)

    return {
        "report": report_data,
        "printable_html": printable_html
    }


@app.post("/api/data-explorer")
def explore_dataset(req: DataExplorerRequest):
    """
    Row inspection with pagination, search, sorting, and column filtering.
    """
    table_name = req.table_name.lower()
    
    # Resolve target dataframe
    if table_name == "customers":
        df = store.raw_data["customers"].copy()
    elif table_name == "cleaned_customers":
        df = store.cleaned_data["customers"].copy()
    elif table_name == "credit_profiles":
        df = store.raw_data["credit_profiles"].copy()
    elif table_name == "cleaned_credit":
        df = store.cleaned_data["credit_profiles"].copy()
    elif table_name == "transactions":
        df = store.raw_data["transactions"].copy()
    elif table_name == "cleaned_transactions":
        df = store.cleaned_data["transactions"].copy()
    elif table_name == "experiment":
        df = store.raw_data["experiment"].copy()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown table: {table_name}")

    total_rows = len(df)

    # Search filter
    if req.search_term and req.search_term.strip():
        term = req.search_term.strip().lower()
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(term).any(), axis=1)
        df = df[mask]

    filtered_rows = len(df)

    # Sort
    if req.sort_by and req.sort_by in df.columns:
        ascending = (req.sort_direction.lower() == "asc")
        df = df.sort_values(by=req.sort_by, ascending=ascending)

    # Paginate
    start_idx = (req.page - 1) * req.page_size
    end_idx = start_idx + req.page_size
    page_df = df.iloc[start_idx:end_idx]

    # Convert NaNs to None for valid JSON serialization
    records = page_df.where(pd.notnull(page_df), None).to_dict(orient="records")

    return {
        "table_name": table_name,
        "page": req.page,
        "page_size": req.page_size,
        "total_rows": total_rows,
        "filtered_rows": filtered_rows,
        "total_pages": math.ceil(filtered_rows / req.page_size) if req.page_size > 0 else 1,
        "columns": list(df.columns),
        "data": records
    }


@app.get("/api/export-csv/{table_name}")
def export_csv(table_name: str):
    """
    Downloads CSV for any raw or cleaned dataset.
    """
    tbl = table_name.lower()
    if tbl == "customers":
        df = store.raw_data["customers"]
    elif tbl == "cleaned_customers":
        df = store.cleaned_data["customers"]
    elif tbl == "credit_profiles":
        df = store.raw_data["credit_profiles"]
    elif tbl == "cleaned_credit":
        df = store.cleaned_data["credit_profiles"]
    elif tbl == "transactions":
        df = store.raw_data["transactions"]
    elif tbl == "cleaned_transactions":
        df = store.cleaned_data["transactions"]
    elif tbl == "experiment":
        df = store.raw_data["experiment"]
    else:
        raise HTTPException(status_code=400, detail="Invalid table name")

    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_bytes = csv_buffer.getvalue().encode("utf-8")

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=creditiq_{tbl}.csv"}
    )
