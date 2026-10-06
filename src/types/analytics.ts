export interface FilterState {
  age_min?: number;
  age_max?: number;
  gender: string;
  location: string;
  occupation: string;
  marital_status: string;
  income_min?: number;
  income_max?: number;
  credit_score_min?: number;
  credit_score_max?: number;
  product_category: string;
  platform: string;
  payment_type: string;
  date_start?: string;
  date_end?: string;
  use_raw?: boolean;
}

export interface PipelineStages {
  RAW_DATA: string;
  VALIDATED: string;
  CLEANED: string;
  ANALYZED: string;
  SEGMENTED: string;
  EXPERIMENT_READY?: string;
  TESTED?: string;
}

export interface OverviewKPIs {
  total_customers: number;
  total_credit_profiles: number;
  total_transactions: number;
  total_transaction_value: number;
  avg_transaction_value: number;
  avg_annual_income: number;
  avg_credit_score: number;
  avg_credit_limit: number;
  missing_values_detected: number;
  duplicate_records_detected: number;
  anomalies_detected: number;
  quality_score: number;
  is_cleaned: boolean;
}

export interface DataQualityIssue {
  table: string;
  column: string;
  issue_type: string;
  affected_records: number;
  percentage: number;
  severity: "Low" | "Medium" | "High";
  recommended_treatment: string;
}

export interface DataQualityData {
  quality_score: number;
  total_records_analyzed: number;
  total_missing_values: number;
  total_duplicates: number;
  total_anomalies: number;
  breakdown: {
    missing_values: {
      customer_income: number;
      credit_limit: number;
      transaction_platform: number;
      other_missing: number;
    };
    duplicates: {
      credit_profile_duplicates: number;
    };
    invalid_values: {
      invalid_age_records: number;
      zero_amount_transactions: number;
    };
    consistency: {
      debt_exceeds_limit: number;
    };
    outliers: {
      extreme_transactions: number;
      iqr_lower_bound: number;
      iqr_upper_bound: number;
      extreme_threshold: number;
    };
  };
  issues_table: DataQualityIssue[];
}

export interface CleaningComparisonItem {
  metric: string;
  before: number;
  after: number;
  status: string;
  method: string;
}

export interface CleaningReport {
  pipeline_status: string;
  before_quality_score: number;
  after_quality_score: number;
  comparison_table: CleaningComparisonItem[];
  actions_taken?: string[];
}

export interface CustomerAnalyticsData {
  summary: {
    total_customers: number;
    avg_age: number;
    median_age: number;
    youngest_age: number;
    oldest_age: number;
    avg_income: number;
    median_income: number;
    largest_occupation: string;
    largest_location?: string;
  };
  age_distribution: Array<{ age_bin: string; count: number; percentage: number }>;
  income_distribution: Array<{ income_bracket: string; count: number; percentage: number }>;
  gender_distribution: Array<{ gender: string; count: number; percentage: number }>;
  location_distribution: Array<{ location: string; count: number; percentage: number }>;
  marital_distribution: Array<{ marital_status: string; count: number; percentage: number }>;
  income_by_occupation: Array<{ occupation: string; mean_income: number; median_income: number; count: number }>;
  income_vs_age: Array<{ x: number; y: number; name: string; occupation: string }>;
  occupation_location_matrix: Array<{ occupation: string; City: number; Suburb: number; Rural: number }>;
}

export interface CreditAnalyticsData {
  summary: {
    avg_credit_score: number;
    avg_credit_limit: number;
    avg_credit_utilisation: number;
    avg_outstanding_debt: number;
    high_utilisation_rate: number;
  };
  credit_score_distribution: Array<{ tier: string; count: number; percentage: number }>;
  credit_limit_distribution: Array<{ bracket: string; count: number; percentage: number }>;
  utilisation_distribution: Array<{ bracket: string; count: number; percentage: number }>;
  debt_distribution: Array<{ bracket: string; count: number; percentage: number }>;
  inquiries_distribution: Array<{ inquiries: string; count: number; percentage: number }>;
  scatter_plots: {
    score_vs_limit: Array<{ x: number; y: number; name: string; cust_id: string }>;
    income_vs_limit: Array<{ x: number; y: number; name: string; cust_id: string }>;
    income_vs_score: Array<{ x: number; y: number; name: string; cust_id: string }>;
    limit_vs_debt: Array<{ x: number; y: number; name: string; cust_id: string }>;
  };
  correlation_matrix: Array<Record<string, any>>;
  columns: string[];
  correlation_highlights: {
    strongest_positive: { var1: string; var2: string; r: number };
    strongest_negative: { var1: string; var2: string; r: number };
    disclaimer: string;
  };
}

export interface TransactionAnalyticsData {
  summary: {
    total_value: number;
    avg_amount: number;
    median_amount: number;
    total_count: number;
  };
  monthly_trend: Array<{ month: string; total_value: number; avg_amount: number; count: number }>;
  category_value: Array<{ category: string; total_value: number; percentage: number }>;
  category_count: Array<{ category: string; count: number }>;
  platform_amount: Array<{ platform: string; total_value: number; count: number; percentage: number }>;
  payment_type_distribution: Array<{ payment_type: string; total_value: number; count: number; share_percentage: number }>;
  age_group_value: Array<{ segment: string; total_value: number; avg_amount: number; count: number; percentage: number }>;
  category_payment_matrix: Array<Record<string, any>>;
  payment_columns: string[];
  platform_category_matrix: Array<Record<string, any>>;
  category_columns: string[];
  top_categories: Array<{
    rank: number;
    category: string;
    total_value: number;
    avg_amount: number;
    count: number;
    share_percentage: number;
  }>;
}

export interface AgeGroupConfig {
  id?: string;
  name: string;
  min_age: number;
  max_age: number;
  label?: string;
}

export interface SegmentItem {
  id: string;
  name: string;
  label: string;
  min_age: number;
  max_age: number;
  customer_count: number;
  customer_percentage: number;
  avg_income: number;
  median_income: number;
  avg_credit_score: number;
  avg_credit_limit: number;
  avg_credit_utilisation: number;
  avg_outstanding_debt: number;
  avg_transaction_amount: number;
  total_transactions: number;
  credit_card_payment_share: number;
  top_product_categories: string[];
  top_category_names: string[];
  opportunity_score?: number;
  opportunity_narrative?: string;
  why_selected?: string;
  scoring_breakdown?: Record<string, { raw: number; normalized: number; weighted: number }>;
}

export interface SegmentationData {
  segments: SegmentItem[];
  total_customers_segmented: number;
  charts: {
    income_vs_limit: Array<{ segment: string; avg_income: number; avg_credit_limit: number }>;
    credit_metrics: Array<{ segment: string; avg_credit_score: number; credit_utilisation: number }>;
    transaction_behavior: Array<{ segment: string; avg_txn_amount: number; cc_payment_share: number }>;
  };
}

export interface TargetScoringData {
  ranked_segments: SegmentItem[];
  recommended_segment: SegmentItem;
  runner_ups: SegmentItem[];
  weights: Record<string, number>;
  raw_weights: Record<string, number>;
}

export interface InsightItem {
  category: string;
  finding: string;
  evidence: string;
  business_meaning: string;
}

export interface DecisionPanelData {
  target_segment: string;
  recommendation: string;
  business_rationale: string;
  risks_and_caveats: string[];
}

export interface AuditSummary {
  raw_records_audited?: number;
  cleaned_records?: number;
  data_quality_score?: number;
  cleaning_pipeline_status?: string;
}

export interface InsightsData {
  insights: InsightItem[];
  decision_panel: DecisionPanelData;
  audit_summary?: AuditSummary;
}
