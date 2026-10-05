/**
 * CreditIQ Analytics - Data Quality Audit Engine (TypeScript)
 */

import { Customer, CreditProfile, Transaction, ExperimentRecord } from "./dataGenerator";
import { DataQualityData, DataQualityIssue } from "../../types/analytics";

export function inspectDataQuality(
  customers: Customer[],
  creditProfiles: CreditProfile[],
  transactions: Transaction[]
): DataQualityData {
  const nCust = customers.length;
  const nCredit = creditProfiles.length;
  const nTxn = transactions.length;

  const issues: DataQualityIssue[] = [];

  // 1. Missing Values
  const missingInc = customers.filter(c => c.annual_income === null || isNaN(c.annual_income)).length;
  if (missingInc > 0) {
    issues.push({
      table: "customers",
      column: "annual_income",
      issue_type: "Missing Values",
      affected_records: missingInc,
      percentage: Math.round((missingInc / nCust) * 10000) / 100,
      severity: "Medium",
      recommended_treatment: "Impute using occupation-wise median income"
    });
  }

  const missingMarital = customers.filter(c => c.marital_status === null).length;
  if (missingMarital > 0) {
    issues.push({
      table: "customers",
      column: "marital_status",
      issue_type: "Missing Values",
      affected_records: missingMarital,
      percentage: Math.round((missingMarital / nCust) * 10000) / 100,
      severity: "Low",
      recommended_treatment: "Impute with mode ('Married' or 'Single')"
    });
  }

  const missingLimit = creditProfiles.filter(cp => cp.credit_limit === null || isNaN(cp.credit_limit)).length;
  if (missingLimit > 0) {
    issues.push({
      table: "credit_profiles",
      column: "credit_limit",
      issue_type: "Missing Values",
      affected_records: missingLimit,
      percentage: Math.round((missingLimit / nCredit) * 10000) / 100,
      severity: "High",
      recommended_treatment: "Impute using credit-score bracket median limit"
    });
  }

  const missingUtil = creditProfiles.filter(cp => cp.credit_utilisation === null || isNaN(cp.credit_utilisation)).length;
  const missingInq = creditProfiles.filter(cp => cp.credit_inquiries_last_6_months === null || isNaN(cp.credit_inquiries_last_6_months)).length;
  if (missingUtil > 0) {
    issues.push({
      table: "credit_profiles",
      column: "credit_utilisation",
      issue_type: "Missing Values",
      affected_records: missingUtil,
      percentage: Math.round((missingUtil / nCredit) * 10000) / 100,
      severity: "Low",
      recommended_treatment: "Impute with overall median utilization"
    });
  }
  if (missingInq > 0) {
    issues.push({
      table: "credit_profiles",
      column: "credit_inquiries_last_6_months",
      issue_type: "Missing Values",
      affected_records: missingInq,
      percentage: Math.round((missingInq / nCredit) * 10000) / 100,
      severity: "Low",
      recommended_treatment: "Impute with median inquiries (0 or 1)"
    });
  }

  const missingPlat = transactions.filter(t => t.platform === null).length;
  if (missingPlat > 0) {
    issues.push({
      table: "transactions",
      column: "platform",
      issue_type: "Missing Values",
      affected_records: missingPlat,
      percentage: Math.round((missingPlat / nTxn) * 10000) / 100,
      severity: "Medium",
      recommended_treatment: "Impute with most frequent platform (mode)"
    });
  }

  const missingCat = transactions.filter(t => t.product_category === null).length;
  const missingPay = transactions.filter(t => t.payment_type === null).length;
  if (missingCat > 0) {
    issues.push({
      table: "transactions",
      column: "product_category",
      issue_type: "Missing Values",
      affected_records: missingCat,
      percentage: Math.round((missingCat / nTxn) * 10000) / 100,
      severity: "Low",
      recommended_treatment: "Impute with most frequent product category"
    });
  }
  if (missingPay > 0) {
    issues.push({
      table: "transactions",
      column: "payment_type",
      issue_type: "Missing Values",
      affected_records: missingPay,
      percentage: Math.round((missingPay / nTxn) * 10000) / 100,
      severity: "Low",
      recommended_treatment: "Impute with most frequent payment type"
    });
  }

  // 2. Duplicates in Credit Profiles
  const seenCustIds = new Set<string>();
  let dupCredit = 0;
  for (const cp of creditProfiles) {
    if (seenCustIds.has(cp.cust_id)) dupCredit++;
    else seenCustIds.add(cp.cust_id);
  }
  if (dupCredit > 0) {
    issues.push({
      table: "credit_profiles",
      column: "cust_id",
      issue_type: "Duplicate Records",
      affected_records: dupCredit,
      percentage: Math.round((dupCredit / nCredit) * 10000) / 100,
      severity: "High",
      recommended_treatment: "Deterministic deduplication (retain highest valid limit)"
    });
  }

  // 3. Invalid Values
  const invalidAges = customers.filter(c => c.age < 15 || c.age > 80).length;
  if (invalidAges > 0) {
    issues.push({
      table: "customers",
      column: "age",
      issue_type: "Invalid Range",
      affected_records: invalidAges,
      percentage: Math.round((invalidAges / nCust) * 10000) / 100,
      severity: "High",
      recommended_treatment: "Replace invalid values (<15 or >80) with occupation-wise median age"
    });
  }

  const zeroTxns = transactions.filter(t => t.tran_amount === 0).length;
  if (zeroTxns > 0) {
    issues.push({
      table: "transactions",
      column: "tran_amount",
      issue_type: "Invalid Value (Zero Amount)",
      affected_records: zeroTxns,
      percentage: Math.round((zeroTxns / nTxn) * 10000) / 100,
      severity: "Medium",
      recommended_treatment: "Impute with category-specific median transaction value"
    });
  }

  // 4. Consistency Violations (Debt > Limit)
  const debtViol = creditProfiles.filter(cp => cp.credit_limit !== null && cp.outstanding_debt > cp.credit_limit).length;
  if (debtViol > 0) {
    issues.push({
      table: "credit_profiles",
      column: "outstanding_debt",
      issue_type: "Business Rule Violation",
      affected_records: debtViol,
      percentage: Math.round((debtViol / nCredit) * 10000) / 100,
      severity: "High",
      recommended_treatment: "Cap outstanding debt at credit limit (100% threshold rule)"
    });
  }

  // 5. Outliers (IQR)
  const sortedAmts = transactions.map(t => t.tran_amount).filter(a => a > 0).sort((a, b) => a - b);
  const q1 = sortedAmts[Math.floor(sortedAmts.length * 0.25)] || 50;
  const q3 = sortedAmts[Math.floor(sortedAmts.length * 0.75)] || 220;
  const iqr = q3 - q1;
  const extremeThreshold = q3 + 5.0 * iqr;
  const extremeCount = sortedAmts.filter(a => a > extremeThreshold).length;

  if (extremeCount > 0) {
    issues.push({
      table: "transactions",
      column: "tran_amount",
      issue_type: "Statistical Outlier (Extreme)",
      affected_records: extremeCount,
      percentage: Math.round((extremeCount / nTxn) * 10000) / 100,
      severity: "Medium",
      recommended_treatment: "Cap extreme anomalies at 99.5th percentile"
    });
  }

  // Dynamic Score Calculation
  let penalty = 0.0;
  penalty += Math.min(5.0, (missingInc / nCust) * 40 + (missingLimit / nCredit) * 30);
  penalty += Math.min(3.0, (dupCredit / nCredit) * 80);
  penalty += Math.min(3.0, (invalidAges / nCust) * 60);
  penalty += Math.min(3.0, (debtViol / nCredit) * 50);
  penalty += Math.min(3.0, (zeroTxns / nTxn) * 100 + (extremeCount / nTxn) * 150);

  const qualityScore = Math.max(50.0, Math.round((100.0 - penalty) * 10) / 10);
  const totalMissing = missingInc + missingMarital + missingLimit + missingUtil + missingInq + missingPlat + missingCat + missingPay;
  const totalAnomalies = invalidAges + zeroTxns + debtViol + extremeCount;

  return {
    quality_score: qualityScore,
    total_records_analyzed: nCust + nCredit + nTxn,
    total_missing_values: totalMissing,
    total_duplicates: dupCredit,
    total_anomalies: totalAnomalies,
    breakdown: {
      missing_values: {
        customer_income: missingInc,
        credit_limit: missingLimit,
        transaction_platform: missingPlat,
        other_missing: totalMissing - (missingInc + missingLimit + missingPlat)
      },
      duplicates: {
        credit_profile_duplicates: dupCredit
      },
      invalid_values: {
        invalid_age_records: invalidAges,
        zero_amount_transactions: zeroTxns
      },
      consistency: {
        debt_exceeds_limit: debtViol
      },
      outliers: {
        extreme_transactions: extremeCount,
        iqr_lower_bound: Math.max(0, Math.round((q1 - 1.5 * iqr) * 100) / 100),
        iqr_upper_bound: Math.round((q3 + 1.5 * iqr) * 100) / 100,
        extreme_threshold: Math.round(extremeThreshold * 100) / 100
      }
    },
    issues_table: issues
  };
}
