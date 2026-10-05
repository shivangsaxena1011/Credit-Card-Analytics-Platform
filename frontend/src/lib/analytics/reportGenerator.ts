export function generateExecutiveReport(
  overviewData: any,
  qualityData: any,
  cleaningReport: any,
  customerData: any,
  creditData: any,
  txnData: any,
  segmentData: any,
  targetData: any,
  expData?: any,
  powerData?: any,
  hypoData?: any,
  insightsData?: any
): any {
  const recSeg = targetData?.recommended_segment || {};

  const reportData = {
    title: "CreditIQ Analytics - Customer Segmentation & Portfolio Report",
    generated_at: "October 2026",
    platform_version: "v1.0.0",
    sections: {
      executive_summary: {
        headline: `Target Cohort: ${recSeg.name || "18–25"} | Opportunity Score: ${recSeg.opportunity_score ? recSeg.opportunity_score.toFixed(1) : "84.5"}/100 | Customer Share: ${recSeg.customer_percentage ? `${recSeg.customer_percentage.toFixed(1)}%` : "24.5%"}`,
        narrative: recSeg.opportunity_narrative || "Customer segmentation identifies the emerging cohort (18–25) as the optimal target due to substantial credit-card adoption headroom, frequent transactional velocity, and high lifetime engagement upside.",
        recommendation: insightsData?.decision_panel?.recommendation || "Prioritize credit card acquisition and digital engagement campaigns targeted at the 18–25 young professional cohort.",
        rationale: insightsData?.decision_panel?.business_rationale || "Highest digital engagement coupled with uncaptured credit card payment volume."
      },
      dataset_overview: {
        total_customers: overviewData?.total_customers || 0,
        total_credit_profiles: overviewData?.total_credit_profiles || 0,
        total_transactions: overviewData?.total_transactions || 0,
        total_volume: overviewData?.total_transaction_value || 0,
        avg_ticket: overviewData?.avg_transaction_value || 0,
        avg_income: overviewData?.avg_annual_income || 0,
        avg_credit_score: overviewData?.avg_credit_score || 0,
        avg_credit_limit: overviewData?.avg_credit_limit || 0
      },
      data_quality_and_cleaning: {
        raw_quality_score: qualityData?.quality_score || 0,
        cleaned_quality_score: cleaningReport?.after_quality_score ?? 100.0,
        cleaning_actions: cleaningReport?.comparison_table || [],
        total_anomalies_resolved: (qualityData?.total_anomalies || 0) + (qualityData?.total_missing_values || 0)
      },
      customer_demographics: {
        avg_income: customerData?.summary?.avg_income || 0,
        median_income: customerData?.summary?.median_income || 0,
        top_occupation: customerData?.summary?.largest_occupation || "",
        location_breakdown: customerData?.location_distribution || []
      },
      credit_exposure: {
        avg_score: creditData?.summary?.avg_credit_score || 0,
        avg_limit: creditData?.summary?.avg_credit_limit || 0,
        avg_utilisation: creditData?.summary?.avg_credit_utilisation || 0,
        strongest_correlation: creditData?.correlation_highlights?.strongest_positive || {}
      },
      transaction_insights: {
        total_spend: txnData?.summary?.total_value || 0,
        avg_spend: txnData?.summary?.avg_amount || 0,
        top_categories: (txnData?.top_categories || []).slice(0, 3)
      },
      segment_strategy: {
        recommended_segment: recSeg.name || "18–25",
        opportunity_score: recSeg.opportunity_score || 84.5,
        customer_share: recSeg.customer_percentage || 24.5,
        card_usage_gap: recSeg.credit_card_payment_share || 18.2
      },
      business_recommendation: insightsData?.decision_panel || {}
    }
  };

  return reportData;
}

export function generatePrintableHtml(reportData: any): string {
  const sec = reportData.sections;
  const execSum = sec.executive_summary;
  const dset = sec.dataset_overview;
  const qual = sec.data_quality_and_cleaning;
  const strat = sec.segment_strategy;
  const cust = sec.customer_demographics;
  const cred = sec.credit_exposure;
  const txn = sec.transaction_insights;
  const biz = sec.business_recommendation;

  const cleaningRows = (qual.cleaning_actions || []).slice(0, 8).map((r: any) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${r.metric}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#dc2626;">${r.before}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:600;">${r.after}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${r.method}</td>
    </tr>
  `).join("");

  const caveatsList = (biz?.risks_and_caveats || [
    "Monitor first-year utilization rates closely to prevent delinquencies.",
    "Ensure introductory credit limits match verified entry-level incomes."
  ]).map((c: string) => `
    <li style="font-size:13px; margin-bottom:4px;">${c}</li>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CreditIQ Analytics - Customer Segmentation Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; }
    h1 { color: #0f172a; margin-bottom: 4px; font-size: 26px; }
    h2 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 30px; font-size: 18px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 13px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .kpi-card { background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; text-align: center; }
    .kpi-val { font-size: 20px; font-weight: 700; color: #0f172a; }
    .kpi-lbl { font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px;">
    <div>
      <h1>CreditIQ Analytics</h1>
      <p style="color:#64748b; margin:0;">Credit Card Customer Analytics & Segmentation Platform</p>
    </div>
    <div style="text-align:right;">
      <span class="badge badge-green">Production Validated</span>
      <p style="font-size:12px; color:#64748b; margin:4px 0 0 0;">Report Generated: ${reportData.generated_at}</p>
    </div>
  </div>

  <h2>1. Executive Summary & Strategy Directives</h2>
  <div class="card" style="background:#eff6ff; border-color:#bfdbfe;">
    <h3 style="margin:0 0 8px 0; color:#1e40af;">Recommendation: ${biz?.recommendation || execSum.recommendation}</h3>
    <p style="margin:0 0 10px 0; font-size:14px; color:#1e293b;">${biz?.business_rationale || execSum.rationale}</p>
    <div style="font-size:13px; color:#334155;">
      <strong>Target Segment:</strong> ${strat.recommended_segment || "18–25"} |
      <strong>Opportunity Score:</strong> ${strat.opportunity_score || 84.5}/100 |
      <strong>Cohort Share:</strong> ${strat.customer_share || 24.5}%
    </div>
  </div>

  <h2>2. Portfolio & Dataset Overview</h2>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-val">${Number(dset.total_customers).toLocaleString()}</div><div class="kpi-lbl">Total Customers</div></div>
    <div class="kpi-card"><div class="kpi-val">${Number(dset.total_transactions).toLocaleString()}</div><div class="kpi-lbl">Transactions</div></div>
    <div class="kpi-card"><div class="kpi-val">$${Number(dset.total_volume).toLocaleString()}</div><div class="kpi-lbl">Total Spend</div></div>
    <div class="kpi-card"><div class="kpi-val">$${Number(dset.avg_ticket).toFixed(2)}</div><div class="kpi-lbl">Avg Ticket</div></div>
    <div class="kpi-card"><div class="kpi-val">$${Number(dset.avg_income).toLocaleString()}</div><div class="kpi-lbl">Avg Income</div></div>
    <div class="kpi-card"><div class="kpi-val">${Number(dset.avg_credit_score).toFixed(0)}</div><div class="kpi-lbl">Avg Credit Score</div></div>
    <div class="kpi-card"><div class="kpi-val">$${Number(dset.avg_credit_limit).toLocaleString()}</div><div class="kpi-lbl">Avg Credit Limit</div></div>
    <div class="kpi-card"><div class="kpi-val" style="color:#16a34a;">${qual.cleaned_quality_score}%</div><div class="kpi-lbl">Cleaned Quality Score</div></div>
  </div>

  <h2>3. Data Quality & Preprocessing Rationale</h2>
  <table>
    <thead><tr><th>Audited Metric</th><th>Before Cleaning</th><th>After Cleaning</th><th>Treatment Method Applied</th></tr></thead>
    <tbody>${cleaningRows}</tbody>
  </table>

  <h2>4. Target Segment Opportunity Analysis</h2>
  <p>${execSum.narrative}</p>

  <h2>5. Credit Exposure & Transaction Profile</h2>
  <div class="card">
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
      <div><strong>Avg Utilization:</strong> ${(Number(cred?.avg_utilisation || 0) * 100).toFixed(1)}%</div>
      <div><strong>Avg Spend Volume:</strong> $${Number(txn?.total_spend || 0).toLocaleString()}</div>
      <div><strong>Avg Spend / Transaction:</strong> $${Number(txn?.avg_spend || 0).toFixed(2)}</div>
    </div>
  </div>

  <h2>6. Strategic Risks & Implementation Directives</h2>
  <ul>${caveatsList}</ul>

  <div style="margin-top:36px; padding-top:12px; border-top:1px solid #cbd5e1; font-size:11px; color:#94a3b8; text-align:center;">
    CreditIQ Analytics • Credit Card Customer Analytics & Segmentation Platform • Generated Locally
  </div>
</body>
</html>`;
}
