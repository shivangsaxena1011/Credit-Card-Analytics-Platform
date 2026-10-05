"""
CreditIQ Analytics - Target Segment Recommendation Engine
Calculates multi-criteria weighted opportunity scores across candidate segments,
ranks target segments, and generates dynamic business opportunity narratives.
"""

import numpy as np
from typing import Dict, Any, List, Optional


DEFAULT_WEIGHTS = {
    "segment_size": 0.20,
    "income_opportunity": 0.15,
    "credit_opportunity": 0.20,
    "transaction_activity": 0.20,
    "card_usage_gap": 0.15,
    "category_engagement": 0.10
}


def min_max_normalize(values: List[float], invert: bool = False) -> List[float]:
    """Normalizes a list of values to [0.1, 1.0]. If invert=True, lower values get higher scores."""
    if not values:
        return []
    min_v = min(values)
    max_v = max(values)
    if max_v == min_v:
        return [0.75 for _ in values]
    
    norm = [(v - min_v) / (max_v - min_v) for v in values]
    if invert:
        norm = [1.0 - n for n in norm]
    # Scale from 0.2 to 1.0 so minimum still contributes reasonably
    return [0.2 + 0.8 * n for n in norm]


def evaluate_target_segments(
    segments: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates segment candidate opportunity scores and generates target recommendation.
    """
    if not segments:
        return {"ranked_segments": [], "recommended_segment": None, "weights": DEFAULT_WEIGHTS}

    if weights is None:
        weights = DEFAULT_WEIGHTS.copy()
    
    # Normalize weights so sum is 1.0
    w_sum = sum(weights.values())
    if w_sum > 0:
        norm_weights = {k: v / w_sum for k, v in weights.items()}
    else:
        norm_weights = DEFAULT_WEIGHTS.copy()

    # Raw metrics extraction
    sizes = [float(s["customer_count"]) for s in segments]
    incomes = [float(s["avg_income"]) for s in segments]
    
    # Credit opportunity: segments with moderate/healthy scores and lower existing limits have room for expansion
    credit_opp_raw = [
        float(s["avg_credit_score"]) / max(1.0, float(s["avg_credit_limit"])) * 1000.0
        for s in segments
    ]
    
    # Transaction activity: average transactions per customer
    txn_activity_raw = [
        float(s["total_transactions"]) / max(1, s["customer_count"])
        for s in segments
    ]

    # Card usage gap: Lower existing Credit Card share means larger whitespace to capture!
    # Hence, invert credit_card_payment_share
    cc_shares = [float(s["credit_card_payment_share"]) for s in segments]

    # Category engagement: top categories volume and presence in digital retail
    digital_cats = {"Electronics", "Fashion & Apparel", "Beauty & Personal Care", "Travel"}
    cat_eng_raw = []
    for s in segments:
        top_names = s.get("top_category_names", [])
        overlap = len(set(top_names).intersection(digital_cats))
        cat_eng_raw.append(overlap * 10.0 + (s.get("avg_transaction_amount", 0) / 10.0))

    # Normalized scores
    norm_sizes = min_max_normalize(sizes)
    norm_incomes = min_max_normalize(incomes)
    norm_credit_opp = min_max_normalize(credit_opp_raw)
    norm_txn_act = min_max_normalize(txn_activity_raw)
    norm_card_gap = min_max_normalize(cc_shares, invert=True)  # Higher gap = lower CC share
    norm_cat_eng = min_max_normalize(cat_eng_raw)

    evaluated_segments: List[Dict[str, Any]] = []

    for i, s in enumerate(segments):
        comp_size = norm_sizes[i] * norm_weights.get("segment_size", 0.20)
        comp_inc = norm_incomes[i] * norm_weights.get("income_opportunity", 0.15)
        comp_cred = norm_credit_opp[i] * norm_weights.get("credit_opportunity", 0.20)
        comp_txn = norm_txn_act[i] * norm_weights.get("transaction_activity", 0.20)
        comp_gap = norm_card_gap[i] * norm_weights.get("card_usage_gap", 0.15)
        comp_cat = norm_cat_eng[i] * norm_weights.get("category_engagement", 0.10)

        total_score = (comp_size + comp_inc + comp_cred + comp_txn + comp_gap + comp_cat) * 100.0

        evaluated_segments.append({
            **s,
            "opportunity_score": round(total_score, 1),
            "scoring_breakdown": {
                "segment_size": {"raw": sizes[i], "normalized": round(norm_sizes[i], 3), "weighted": round(comp_size * 100, 2)},
                "income_opportunity": {"raw": incomes[i], "normalized": round(norm_incomes[i], 3), "weighted": round(comp_inc * 100, 2)},
                "credit_opportunity": {"raw": round(credit_opp_raw[i], 2), "normalized": round(norm_credit_opp[i], 3), "weighted": round(comp_cred * 100, 2)},
                "transaction_activity": {"raw": round(txn_activity_raw[i], 1), "normalized": round(norm_txn_act[i], 3), "weighted": round(comp_txn * 100, 2)},
                "card_usage_gap": {"raw": cc_shares[i], "normalized": round(norm_card_gap[i], 3), "weighted": round(comp_gap * 100, 2)},
                "category_engagement": {"raw": round(cat_eng_raw[i], 1), "normalized": round(norm_cat_eng[i], 3), "weighted": round(comp_cat * 100, 2)}
            }
        })

    # Sort descending by opportunity score
    evaluated_segments.sort(key=lambda x: x["opportunity_score"], reverse=True)

    recommended = evaluated_segments[0]
    runner_ups = evaluated_segments[1:]

    # Dynamic Opportunity Narrative generation strictly based on calculated values
    top_cat_str = ", ".join(recommended.get("top_category_names", ["Retail", "Online"]))
    narrative = (
        f"The {recommended['name']} segment represents {recommended['customer_percentage']}% of the customer base "
        f"({recommended['customer_count']} accounts) with an average annual income of ${recommended['avg_income']:,.2f}. "
        f"Currently, this group exhibits a substantial card usage gap, with only {recommended['credit_card_payment_share']}% "
        f"of transactions settled via credit card despite frequent purchase behavior ({recommended['total_transactions']} total transactions, "
        f"averaging ${recommended['avg_transaction_amount']:.2f} per ticket). "
        f"With an average credit score of {recommended['avg_credit_score']:.0f} and conservative credit limits (${recommended['avg_credit_limit']:,.0f}), "
        f"this cohort presents a prime credit-building and rewards-incentive opportunity in categories like {top_cat_str}."
    )

    why_selected = (
        f"Selected as the top target segment with an Opportunity Score of {recommended['opportunity_score']}/100. "
        f"Key drivers include the high credit card conversion gap ({recommended['credit_card_payment_share']}% current card share), "
        f"strong transactional engagement, and healthy credit profile capacity."
    )

    return {
        "ranked_segments": evaluated_segments,
        "recommended_segment": {
            **recommended,
            "opportunity_narrative": narrative,
            "why_selected": why_selected
        },
        "runner_ups": runner_ups,
        "weights": norm_weights,
        "raw_weights": weights
    }
