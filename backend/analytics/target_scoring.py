"""
CreditIQ Analytics - Target Segment Recommendation Engine
Calculates multi-criteria weighted opportunity scores across candidate segments,
validates and normalizes weights, provides transparent scoring breakdowns,
adds statistical reliability indicators, and generates dynamic business opportunity narratives.
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
    """Normalizes a list of values to [0.2, 1.0]. If invert=True, lower values get higher scores."""
    if not values:
        return []
    min_v = min(values)
    max_v = max(values)
    if max_v == min_v:
        return [0.75 for _ in values]

    norm = [(v - min_v) / (max_v - min_v) for v in values]
    if invert:
        norm = [1.0 - n for n in norm]
    return [0.2 + 0.8 * n for n in norm]


def evaluate_target_segments(
    segments: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates segment candidate opportunity scores and generates target recommendation.
    Weights are validated and normalized to strictly sum to 1.0.
    """
    if not segments:
        return {"ranked_segments": [], "recommended_segment": None, "weights": DEFAULT_WEIGHTS}

    # Validate and normalize weights
    active_weights = DEFAULT_WEIGHTS.copy()
    if weights:
        for k, v in weights.items():
            if k in DEFAULT_WEIGHTS and v is not None:
                try:
                    val = float(v)
                    if val >= 0:
                        active_weights[k] = val
                except (ValueError, TypeError):
                    pass

    w_sum = sum(active_weights.values())
    if w_sum > 0:
        norm_weights = {k: round(v / w_sum, 4) for k, v in active_weights.items()}
    else:
        norm_weights = DEFAULT_WEIGHTS.copy()

    # Raw metrics extraction
    sizes = [float(s.get("customer_count", 0)) for s in segments]
    incomes = [float(s.get("avg_income", 0)) for s in segments]

    credit_opp_raw = [
        float(s.get("avg_credit_score", 600)) / max(1.0, float(s.get("avg_credit_limit", 5000))) * 1000.0
        for s in segments
    ]

    txn_activity_raw = [
        float(s.get("total_transactions", 0)) / max(1, s.get("customer_count", 1))
        for s in segments
    ]

    cc_shares = [float(s.get("credit_card_payment_share", 0)) for s in segments]

    digital_cats = {"Electronics", "Fashion & Apparel", "Beauty & Personal Care", "Travel"}
    cat_eng_raw = []
    for s in segments:
        top_names = s.get("top_category_names", [])
        overlap = len(set(top_names).intersection(digital_cats))
        cat_eng_raw.append(overlap * 10.0 + (float(s.get("avg_transaction_amount", 0)) / 10.0))

    # Normalized scores
    norm_sizes = min_max_normalize(sizes)
    norm_incomes = min_max_normalize(incomes)
    norm_credit_opp = min_max_normalize(credit_opp_raw)
    norm_txn_act = min_max_normalize(txn_activity_raw)
    norm_card_gap = min_max_normalize(cc_shares, invert=True)  # Higher gap = lower existing card share
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

        # Sample size reliability assessment
        cust_n = int(s.get("customer_count", 0))
        if cust_n < 50:
            reliability = "Low (Small Sample Size, N < 50)"
            reliability_badge = "amber"
        elif cust_n < 150:
            reliability = "Moderate Statistical Reliability"
            reliability_badge = "blue"
        else:
            reliability = "High Statistical Reliability (N ≥ 150)"
            reliability_badge = "emerald"

        # Explicit score explanation
        score_explanation = (
            f"Opportunity score {round(total_score, 1)} driven by {round(comp_gap * 100, 1)} pts card adoption gap "
            f"({cc_shares[i]:.1f}% card share), {round(comp_txn * 100, 1)} pts transaction velocity "
            f"({round(txn_activity_raw[i], 1)} txns/cust), and {round(comp_cred * 100, 1)} pts credit capacity."
        )

        evaluated_segments.append({
            **s,
            "opportunity_score": round(total_score, 1),
            "reliability": reliability,
            "reliability_badge": reliability_badge,
            "score_explanation": score_explanation,
            "scoring_breakdown": {
                "segment_size": {"raw": sizes[i], "normalized": round(norm_sizes[i], 3), "weighted": round(comp_size * 100, 2), "weight": norm_weights.get("segment_size", 0.20)},
                "income_opportunity": {"raw": incomes[i], "normalized": round(norm_incomes[i], 3), "weighted": round(comp_inc * 100, 2), "weight": norm_weights.get("income_opportunity", 0.15)},
                "credit_opportunity": {"raw": round(credit_opp_raw[i], 2), "normalized": round(norm_credit_opp[i], 3), "weighted": round(comp_cred * 100, 2), "weight": norm_weights.get("credit_opportunity", 0.20)},
                "transaction_activity": {"raw": round(txn_activity_raw[i], 1), "normalized": round(norm_txn_act[i], 3), "weighted": round(comp_txn * 100, 2), "weight": norm_weights.get("transaction_activity", 0.20)},
                "card_usage_gap": {"raw": cc_shares[i], "normalized": round(norm_card_gap[i], 3), "weighted": round(comp_gap * 100, 2), "weight": norm_weights.get("card_usage_gap", 0.15)},
                "category_engagement": {"raw": round(cat_eng_raw[i], 1), "normalized": round(norm_cat_eng[i], 3), "weighted": round(comp_cat * 100, 2), "weight": norm_weights.get("category_engagement", 0.10)}
            }
        })

    # Sort descending by opportunity score
    evaluated_segments.sort(key=lambda x: x["opportunity_score"], reverse=True)

    recommended = evaluated_segments[0]
    runner_ups = evaluated_segments[1:]

    # Dynamic Opportunity Narrative generation strictly based on calculated values
    top_cat_str = ", ".join(recommended.get("top_category_names", ["Retail", "Online"]))
    narrative = (
        f"The {recommended['name']} cohort represents {recommended.get('customer_percentage', 0)}% of the active portfolio "
        f"({recommended.get('customer_count', 0)} accounts) with an average annual income of ${recommended.get('avg_income', 0):,.2f}. "
        f"Currently, this segment exhibits a substantial credit card conversion whitespace: only {recommended.get('credit_card_payment_share', 0)}% "
        f"of purchases are settled via credit card despite high transactional engagement ({recommended.get('total_transactions', 0):,} total transactions, "
        f"averaging ${recommended.get('avg_transaction_amount', 0):.2f} per ticket). "
        f"With an average credit score of {recommended.get('avg_credit_score', 0):.0f} and conservative credit limits (${recommended.get('avg_credit_limit', 0):,.0f}), "
        f"this cohort presents a prime card-activation opportunity in merchant categories like {top_cat_str}."
    )

    why_selected = (
        f"Selected as the top target segment with an Opportunity Score of {recommended['opportunity_score']}/100. "
        f"Key drivers include the high credit card conversion gap ({recommended.get('credit_card_payment_share', 0)}% current card share), "
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
        "raw_weights": active_weights
    }
