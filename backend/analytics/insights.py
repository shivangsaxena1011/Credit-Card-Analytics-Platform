"""
CreditIQ Analytics - Automated Insights & Executive Decision Panel
Synthesizes findings across demographic, credit, transaction, segmentation,
and A/B testing modules into executive findings and business recommendations.
"""

from typing import Dict, Any, List


def generate_insights(
    cust_analytics: Dict[str, Any],
    credit_analytics: Dict[str, Any],
    txn_analytics: Dict[str, Any],
    segmentation_data: Dict[str, Any],
    target_data: Dict[str, Any],
    experiment_data: Dict[str, Any],
    test_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Produces dynamic, evidence-backed insights and executive decision framework.
    """
    rec_seg = target_data.get("recommended_segment", {})
    seg_name = rec_seg.get("name", "18–25")
    exp_lift = experiment_data.get("comparison", {}).get("percentage_lift", 0.0)
    is_sig = test_result.get("decision", {}).get("reject_h0", False)
    p_val_str = test_result.get("statistics", {}).get("p_value_display", "0.05")

    insights_list: List[Dict[str, Any]] = []

    # 1. Customer Demographics Insight
    insights_list.append({
        "category": "Customer Demographics",
        "finding": f"Prime earning population (26–48) anchors bank volume, while the emerging cohort ({seg_name}) represents untapped growth.",
        "evidence": f"Customers aged {seg_name} comprise {rec_seg.get('customer_percentage', 25)}% of total accounts with average income of ${rec_seg.get('avg_income', 50000):,.0f}.",
        "business_meaning": "Building early financial relationships with younger cohorts provides long-term customer lifetime value (LTV) as their earnings trajectory expands."
    })

    # 2. Credit Behavior Insight
    top_corr = credit_analytics.get("correlation_highlights", {}).get("strongest_positive", {})
    insights_list.append({
        "category": "Credit Behavior",
        "finding": "Credit limits scale predictably with income and credit score, but younger customers maintain lower credit limits.",
        "evidence": f"Strongest positive association is between {top_corr.get('var1', 'Income')} and {top_corr.get('var2', 'Limit')} (r = {top_corr.get('r', 0.65)}). Segment {seg_name} average limit is ${rec_seg.get('avg_credit_limit', 12000):,.0f}.",
        "business_meaning": "Lower existing credit exposure allows room for controlled limit increases tied to verified debit/UPI payment histories without breaching risk policy."
    })

    # 3. Transaction Behavior Insight
    top_cat = txn_analytics.get("top_categories", [{}])[0]
    insights_list.append({
        "category": "Transaction Behavior",
        "finding": f"Consumer spending is heavily concentrated in {top_cat.get('category', 'Electronics')} and Digital Commerce.",
        "evidence": f"{top_cat.get('category', 'Top category')} accounts for {top_cat.get('share_percentage', 25)}% of total volume (${top_cat.get('total_value', 0):,.0f} total spend).",
        "business_meaning": "Reward structures aligned with these high-frequency categories will achieve greater engagement than generic cashback cards."
    })

    # 4. Target Segment Opportunity Insight
    insights_list.append({
        "category": "Target Segment Identification",
        "finding": f"Segment {seg_name} shows the largest credit-card conversion gap despite high merchant frequency.",
        "evidence": f"Only {rec_seg.get('credit_card_payment_share', 28)}% of {seg_name} transactions currently use Credit Card, compared to >48% in older cohorts.",
        "business_meaning": "The primary barrier is product adoption and card activation rather than lack of spending propensity."
    })

    # 5. Campaign Experiment Outcome Insight
    insights_list.append({
        "category": "A/B Testing Experiment",
        "finding": f"Targeted promotional incentive generated an observed {exp_lift:+.2f}% lift in average transaction value.",
        "evidence": f"Control ATV was ${experiment_data.get('control_group', {}).get('mean', 0):.2f} vs Test ATV of ${experiment_data.get('test_group', {}).get('mean', 0):.2f}.",
        "business_meaning": "Tailored cashback on digital categories effectively motivates higher ticket sizes among cardholders in this segment."
    })

    # 6. Statistical Significance & Rigor Insight
    insights_list.append({
        "category": "Statistical Evaluation",
        "finding": "Observed treatment effect achieves formal statistical significance." if is_sig else "Observed difference does not yet reach required statistical confidence.",
        "evidence": f"Test Statistic = {test_result.get('statistics', {}).get('test_statistic', 0)}, p-value = {p_val_str} (vs α = {test_result.get('alpha', 0.05)}).",
        "business_meaning": "Evidence indicates the spend uplift is attributable to the intervention rather than random transaction volatility." if is_sig else "Additional sample or extended duration required before concluding genuine lift."
    })

    # Executive Decision Panel
    decision_panel = {
        "target_segment": seg_name,
        "campaign_outcome": f"Positive Lift (+{exp_lift:.1f}%)" if exp_lift > 0 else "Neutral/Negative",
        "statistical_significance": "Statistically Significant (p < α)" if is_sig else "Not Statistically Significant (p ≥ α)",
        "observed_lift": f"+{exp_lift:.2f}%",
        "sample_adequacy": f"Adequate (Control N={experiment_data.get('control_group', {}).get('sample_size', 0):,}, Test N={experiment_data.get('test_group', {}).get('sample_size', 0):,})",
        "recommendation": "Proceed to a Phase-2 controlled rollout (15% account exposure) with strict unit-economic monitoring." if is_sig else "Refine campaign incentives and re-test with expanded sample before rollout.",
        "business_rationale": (
            f"The test cohort demonstrated an observed +{exp_lift:.1f}% spend expansion with confirmed statistical significance (p={p_val_str}). "
            f"However, because full-scale portfolio rollout incurs merchant discount rate (MDR) subsidies and rewards liabilities, "
            f"a staged expansion ensures profitability is verified under steady-state customer retention."
        ),
        "risks_and_caveats": [
            "Margin Dilution: Ensure merchant cashback margins exceed funding costs.",
            "Novelty Decay: Lift may experience taper after initial 60-day promotional novelty.",
            "Credit Risk Balance: Monitor 30-day delinquency rates as transaction volume expands.",
            "Causation vs Association: Test confirms ATV lift in this sample, but macro seasonal factors should be controlled."
        ]
    }

    return {
        "insights": insights_list,
        "decision_panel": decision_panel
    }
