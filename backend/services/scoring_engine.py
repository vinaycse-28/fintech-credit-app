from typing import Dict, Any, List, Tuple

def calculate_revenue_stability(financials: Dict[str, Any]) -> Tuple[int, int, str]:
    """
    Revenue Stability: Max 20 points.
    Formula based on Coefficient of Variation (CV) of revenue and growth momentum.
    """
    max_pts = 20

    # Guard: no revenue data means no stability score
    if financials.get("totalRevenue", 0.0) <= 0 or financials.get("totalMonths", 0) < 1:
        return 0, max_pts, "Insufficient revenue data to evaluate stability. Please upload transaction records."

    cv = financials.get("revenueCV", 0.0)
    growth = financials.get("revenueGrowth", 0.0)

    # Base consistency from CV (0 to 15 pts)
    cv_score = max(0.0, 1.0 - 2.0 * cv) * 15.0

    # Momentum bonus (0 to 5 pts)
    growth_score = min(5.0, max(0.0, 2.5 + (growth / 20.0) * 2.5))
    total = round(cv_score + growth_score)
    final_score = max(0, min(max_pts, total))

    if final_score >= 16:
        explanation = f"Predictable monthly turnover with low volatility (CV: {cv}) and positive revenue trajectory."
    elif final_score >= 11:
        explanation = f"Moderate monthly revenue stability (CV: {cv}). Growth is manageable at {growth}%."
    else:
        explanation = f"High revenue volatility observed (CV: {cv}). Inflow patterns exhibit erratic swings."

    return final_score, max_pts, explanation


def calculate_cash_flow_strength(financials: Dict[str, Any]) -> Tuple[int, int, str]:
    """
    Cash Flow Strength: Max 20 points.
    Based on positive cash flow months ratio (70%) and net operational margin (30%).
    """
    max_pts = 20
    total_months = financials.get("totalMonths", 1) or 1
    pos_months = financials.get("positiveMonths", 0)
    pos_ratio = pos_months / total_months

    total_rev = financials.get("totalRevenue", 0.0)
    net_cf = financials.get("netCashFlow", 0.0)
    net_margin = (net_cf / total_rev) if total_rev > 0 else 0.0

    # Margin factor normalized to 20% healthy margin benchmark
    margin_ratio = max(0.0, min(1.0, net_margin / 0.20))

    score = round((14.0 * pos_ratio) + (6.0 * margin_ratio))
    final_score = max(0, min(max_pts, score))

    if final_score >= 16:
        explanation = f"Disciplined cash generation; {pos_months} of {total_months} months generated net operational surplus."
    elif final_score >= 11:
        explanation = f"Acceptable cash flow with {pos_months} positive months, though operating cushions are lean."
    else:
        explanation = f"Frequent operational cash-flow deficits ({total_months - pos_months} negative months) threatening liquidity."

    return final_score, max_pts, explanation


def calculate_payment_behaviour(behaviour: Dict[str, Any]) -> Tuple[int, int, str]:
    """
    Payment Behaviour: Max 15 points.
    Evaluates digital channel adoption (UPI + Bank Transfer vs Cash).
    """
    max_pts = 15
    payment_mix = behaviour.get("paymentMix", [])
    digital_pct = sum(
        p.get("percent", 0) for p in payment_mix if p.get("name") in ["UPI", "Bank Transfer"]
    )

    score = round((digital_pct / 100.0) * max_pts)
    final_score = max(0, min(max_pts, score))

    if final_score >= 12:
        explanation = f"High auditable digital payment adoption ({digital_pct}% via UPI & Bank Transfer), minimizing informal leakage."
    elif final_score >= 8:
        explanation = f"Moderate digital mix ({digital_pct}%). Balance is conducted in cash, requiring physical invoice verification."
    else:
        explanation = f"Heavy reliance on cash transactions ({100 - digital_pct}% non-digital), creating an auditable paper-trail deficit."

    return final_score, max_pts, explanation


def calculate_transaction_behaviour(behaviour: Dict[str, Any]) -> Tuple[int, int, str]:
    """
    Transaction Behaviour: Max 15 points.
    Evaluates operational continuity, ticket size consistency, and dormancy gaps.
    """
    max_pts = 15

    # Guard: no transactions means no behaviour score
    if behaviour.get("totalCount", 0) < 1:
        return 0, max_pts, "No transaction records found. Upload financial data to evaluate operational behaviour."

    max_gap = behaviour.get("maxGapDays", 0)
    freq = behaviour.get("avgMonthlyFrequency", 0)

    # Inactivity penalty
    gap_penalty = min(8.0, max_gap * 0.5)
    base_freq_score = min(7.0, (freq / 20.0) * 7.0)

    score = round(max(0.0, 15.0 - gap_penalty + (base_freq_score - 3.5)))
    final_score = max(0, min(max_pts, score))

    if max_gap < 7 and freq >= 15:
        explanation = f"Continuous day-to-day transaction cadence ({freq} txns/mo) with zero dormancy gaps over 7 days."
    elif max_gap < 14:
        explanation = f"Steady operational activity ({freq} txns/mo). Max inactivity gap held to {max_gap} days."
    else:
        explanation = f"Extended operational pause detected (max gap: {max_gap} days). Indicates potential off-book activity or seasonal closure."

    return final_score, max_pts, explanation


def calculate_financial_consistency(story: Dict[str, Any], cross_signal: Dict[str, Any]) -> Tuple[int, int, str]:
    """
    Financial Consistency: Max 15 points.
    Checks alignment between declared turnover, observed turnover, and cross-signal harmony.
    """
    max_pts = 15
    variance_pct = story.get("variancePct", 0.0)
    is_cross_consistent = cross_signal.get("isConsistent", True)

    # Story variance score (0 to 10 pts)
    story_score = max(0.0, 10.0 - (variance_pct / 5.0))

    # Cross-signal bonus (0 to 5 pts)
    cross_score = 5.0 if is_cross_consistent else 1.0

    score = round(story_score + cross_score)
    final_score = max(0, min(max_pts, score))

    if final_score >= 12:
        explanation = f"Verified inflows closely substantiate self-declared monthly revenue (within {variance_pct}%), showing high ledger veracity."
    elif final_score >= 8:
        explanation = f"Moderate variance of {variance_pct}% between declared turnover and verified banking records."
    else:
        explanation = f"Substantial divergence ({variance_pct}% variance) between declared financials and banking trail."

    return final_score, max_pts, explanation


def calculate_data_trust(trust: Dict[str, Any]) -> Tuple[int, int, str]:
    """
    Data Trust: Max 15 points.
    Evaluates integrity: absence of duplicates, valid timestamps, valid amounts, and no artificial clustering.
    """
    max_pts = 15
    raw_trust_score = trust.get("score", 95)
    duplicates = trust.get("duplicateCount", 0)
    invalids = trust.get("invalidCount", 0)

    score = round((raw_trust_score / 100.0) * max_pts)
    final_score = max(0, min(max_pts, score))

    if duplicates == 0 and invalids == 0:
        explanation = "Pristine transactional hygiene: zero duplicate rows, valid timestamps, and authentic ticket distribution."
    elif duplicates <= 2 and invalids <= 1:
        explanation = f"Satisfactory data trust with minor warnings ({duplicates} duplicates, {invalids} format flags)."
    else:
        explanation = f"Ledger integrity concerns flagged ({duplicates} duplicates, {invalids} invalid entries)."

    return final_score, max_pts, explanation


# Constants for the 6 behavioral pillars
PILLAR_SPEC = [
    {"name": "Revenue Stability", "max_score": 20, "key": "revenue_stability", "weight": "20%", "icon": "TrendingUp", "color": "blue"},
    {"name": "Cash Flow Strength", "max_score": 20, "key": "cash_flow_strength", "weight": "20%", "icon": "DollarSign", "color": "emerald"},
    {"name": "Payment Behaviour", "max_score": 15, "key": "payment_behaviour", "weight": "15%", "icon": "CreditCard", "color": "purple"},
    {"name": "Transaction Behaviour", "max_score": 15, "key": "transaction_behaviour", "weight": "15%", "icon": "Activity", "color": "indigo"},
    {"name": "Financial Consistency", "max_score": 15, "key": "financial_consistency", "weight": "15%", "icon": "Scale", "color": "cyan"},
    {"name": "Data Trust", "max_score": 15, "key": "data_trust", "weight": "15%", "icon": "ShieldCheck", "color": "amber"},
]

PILLAR_MAX_MAP = {p["name"]: p["max_score"] for p in PILLAR_SPEC}
BREAKDOWN_MAX_MAP = {p["key"]: p["max_score"] for p in PILLAR_SPEC}

def sanitize_scoring_payload(scoring: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validation and safety layer (Requirements 2, 4, 8, 9, 10).
    Ensures every feature score satisfies: 0 <= earnedScore <= maxScore.
    Removes raw percentage conversions (e.g., 100, 87, 27, 33, 47) and recalculates
    the final creditworthiness signal as the exact sum of the six corrected feature scores.
    """
    if not isinstance(scoring, dict):
        scoring = {}

    raw_pillars = scoring.get("pillars") or []
    breakdown = scoring.get("breakdown") or {}
    sanitized_pillars = []
    corrected_breakdown = {}
    calculated_total = 0

    # Build lookup from existing pillars by name
    existing_pillars_by_name = {
        p.get("name"): p for p in raw_pillars if isinstance(p, dict) and p.get("name")
    }

    for spec in PILLAR_SPEC:
        name = spec["name"]
        max_score = spec["max_score"]
        key = spec["key"]
        existing = existing_pillars_by_name.get(name, {})

        # Extract potential score candidates
        earned = None
        raw_sc = existing.get("raw_score")
        if raw_sc is not None:
            try:
                val = float(raw_sc)
                if val == val and 0 <= val <= max_score:
                    earned = round(val)
            except (ValueError, TypeError):
                pass

        if earned is None:
            sc = existing.get("score")
            if sc is not None:
                try:
                    val = float(sc)
                    if val == val:
                        if val > max_score:
                            # Old percentage stored as score (e.g. 100 for 20, 87 for 13)
                            earned = round((val / 100.0) * max_score)
                        elif val < 0:
                            earned = 0
                        else:
                            earned = round(val)
                except (ValueError, TypeError):
                    pass

        if earned is None and key in breakdown:
            try:
                bd_val = float(breakdown[key])
                if bd_val == bd_val:
                    if bd_val > max_score:
                        earned = round((bd_val / 100.0) * max_score)
                    elif bd_val < 0:
                        earned = 0
                    else:
                        earned = round(bd_val)
            except (ValueError, TypeError):
                pass

        # Fallback to 0 if completely invalid/missing
        if earned is None:
            earned = 0

        # Strict clamping: 0 <= earnedScore <= maxScore
        earned = max(0, min(max_score, earned))
        percentage = min(100, max(0, round((earned / max_score) * 100)))

        calculated_total += earned
        corrected_breakdown[key] = earned

        sanitized_pillars.append({
            "name": name,
            "score": earned,
            "max_score": max_score,
            "raw_score": earned,
            "percentage": percentage,
            "weight": spec["weight"],
            "icon": existing.get("icon", spec["icon"]),
            "color": existing.get("color", spec["color"]),
            "explanation": existing.get("explanation", f"Evaluated under {name} pillar ({earned}/{max_score} pts).")
        })

    # Requirement 8: Final creditworthiness signal is calculated from the six corrected feature scores
    final_score = max(0, min(100, calculated_total))

    # Re-evaluate risk categorization if needed
    if final_score >= 80:
        risk_level = "Low Risk"
        risk_category = "Strong Financial Behaviour"
        badge_color = "emerald"
    elif final_score >= 65:
        risk_level = "Moderate Risk"
        risk_category = "Relatively Stable Behaviour"
        badge_color = "blue"
    elif final_score >= 40:
        risk_level = "Moderate-High Risk"
        risk_category = "Moderate Financial Behaviour"
        badge_color = "amber"
    else:
        risk_level = "High Risk"
        risk_category = "Elevated Risk Pattern"
        badge_color = "rose"

    scoring["score"] = final_score
    scoring["risk_level"] = risk_level
    scoring["riskLevel"] = risk_level
    scoring["risk_category"] = risk_category
    scoring["riskCategory"] = risk_category
    scoring["badgeColor"] = badge_color
    scoring["breakdown"] = corrected_breakdown
    scoring["pillars"] = sanitized_pillars

    return scoring


def calculate_creditworthiness_score(
    financials: Dict[str, Any],
    behaviour: Dict[str, Any],
    trust: Dict[str, Any],
    story: Dict[str, Any],
    cross_signal: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Master 0-100 deterministic scoring engine.
    Calculates 6 category scores totaling 100 points, determines prototype risk category,
    generates positive/negative drivers, and returns explainable attributions.
    """
    has_data = behaviour.get("totalCount", 0) > 0 and financials.get("totalRevenue", 0.0) > 0
    if not has_data:
        no_data_pillars = [
            {"name": "Revenue Stability", "score": 0, "raw_score": 0, "max_score": 20, "percentage": 0, "weight": "20%", "icon": "TrendingUp", "color": "blue", "explanation": "No revenue data. Upload transactions to calculate."},
            {"name": "Cash Flow Strength", "score": 0, "raw_score": 0, "max_score": 20, "percentage": 0, "weight": "20%", "icon": "DollarSign", "color": "emerald", "explanation": "No cash flow data. Upload transactions to calculate."},
            {"name": "Payment Behaviour", "score": 0, "raw_score": 0, "max_score": 15, "percentage": 0, "weight": "15%", "icon": "CreditCard", "color": "purple", "explanation": "No payment data. Upload transactions to calculate."},
            {"name": "Transaction Behaviour", "score": 0, "raw_score": 0, "max_score": 15, "percentage": 0, "weight": "15%", "icon": "Activity", "color": "indigo", "explanation": "No transaction records. Upload transactions to calculate."},
            {"name": "Financial Consistency", "score": 0, "raw_score": 0, "max_score": 15, "percentage": 0, "weight": "15%", "icon": "Scale", "color": "cyan", "explanation": "Cannot verify consistency without transaction data."},
            {"name": "Data Trust", "score": 0, "raw_score": 0, "max_score": 15, "percentage": 0, "weight": "15%", "icon": "ShieldCheck", "color": "amber", "explanation": "No data uploaded for integrity analysis."},
        ]
        return {
            "score": 0,
            "risk_level": "Unscored",
            "riskLevel": "Unscored",
            "risk_category": "Insufficient Data",
            "riskCategory": "Insufficient Data — Upload Transactions",
            "badgeColor": "slate",
            "disclaimer": "CreditBridge prototype risk classification requires transaction data. Please upload CSV records.",
            "breakdown": {"revenue_stability": 0, "cash_flow_strength": 0, "payment_behaviour": 0, "transaction_behaviour": 0, "financial_consistency": 0, "data_trust": 0},
            "pillars": no_data_pillars,
            "positive_drivers": [],
            "positiveDrivers": [],
            "negative_drivers": [{"title": "No Transaction Data", "detail": "The analysis engine requires at least some transaction records to compute a creditworthiness signal. Please upload your CSV or add transactions manually."}],
            "negativeDrivers": [{"title": "No Transaction Data", "detail": "Upload transaction records to generate score."}],
            "warnings": [{"severity": "high", "title": "No Financial Data Uploaded", "message": "Analysis was run with zero transactions. Please upload a CSV with at least 10 records for a meaningful creditworthiness signal."}],
            "riskWarnings": [{"severity": "high", "title": "No Financial Data", "message": "Upload transactions to get a score."}]
        }

    s_rev, max_rev, exp_rev = calculate_revenue_stability(financials)
    s_cf, max_cf, exp_cf = calculate_cash_flow_strength(financials)
    s_pay, max_pay, exp_pay = calculate_payment_behaviour(behaviour)
    s_txn, max_txn, exp_txn = calculate_transaction_behaviour(behaviour)
    s_cons, max_cons, exp_cons = calculate_financial_consistency(story, cross_signal)
    s_trust, max_trust, exp_trust = calculate_data_trust(trust)

    # Strictly clamp each pillar score to its designated maximum (Requirement 2 & 4)
    s_rev = max(0, min(20, s_rev))
    s_cf = max(0, min(20, s_cf))
    s_pay = max(0, min(15, s_pay))
    s_txn = max(0, min(15, s_txn))
    s_cons = max(0, min(15, s_cons))
    s_trust = max(0, min(15, s_trust))

    # Requirement 8: The final creditworthiness signal is calculated from the six corrected feature scores
    total_score = s_rev + s_cf + s_pay + s_txn + s_cons + s_trust
    total_score = max(0, min(100, total_score))

    # Prototype Risk Categories
    if total_score >= 80:
        risk_level = "Low Risk"
        risk_category = "Strong Financial Behaviour"
        badge_color = "emerald"
    elif total_score >= 65:
        risk_level = "Moderate Risk"
        risk_category = "Relatively Stable Behaviour"
        badge_color = "blue"
    elif total_score >= 40:
        risk_level = "Moderate-High Risk"
        risk_category = "Moderate Financial Behaviour"
        badge_color = "amber"
    else:
        risk_level = "High Risk"
        risk_category = "Elevated Risk Pattern"
        badge_color = "rose"

    # Dynamic positive and negative drivers
    positive_drivers = []
    negative_drivers = []
    warnings = []

    # Revenue drivers
    if s_rev >= 15:
        positive_drivers.append({
            "title": "Consistent Revenue Inflows",
            "detail": f"Monthly revenue variation is low (CV: {financials.get('revenueCV')}), providing predictable operational turnover."
        })
    elif s_rev < 10:
        negative_drivers.append({
            "title": "Revenue Volatility",
            "detail": f"Turnover swings (CV: {financials.get('revenueCV')}) create operational cash-flow uncertainty."
        })

    # Cash flow drivers
    pos_months = financials.get("positiveMonths", 0)
    total_months = financials.get("totalMonths", 1)
    if s_cf >= 15:
        positive_drivers.append({
            "title": "Disciplined Cash Flow Cushion",
            "detail": f"{pos_months} of {total_months} months generated positive net operational surplus."
        })
    elif s_cf < 10:
        negative_drivers.append({
            "title": "Frequent Cash-Flow Deficits",
            "detail": f"{total_months - pos_months} months experienced negative operational cash flow."
        })

    # Payment drivers
    payment_mix = behaviour.get("paymentMix", [])
    digital_pct = sum(p.get("percent", 0) for p in payment_mix if p.get("name") in ["UPI", "Bank Transfer"])
    if s_pay >= 12:
        positive_drivers.append({
            "title": "High Digital Payment Adoption",
            "detail": f"{digital_pct}% of receipts flow through verifiable UPI & Bank Transfer channels."
        })
    elif digital_pct < 50:
        negative_drivers.append({
            "title": "High Cash Concentration",
            "detail": f"Cash receipts account for {100 - digital_pct}%, reducing auditable banking trail."
        })

    # Inactivity & Dormancy
    max_gap = behaviour.get("maxGapDays", 0)
    if max_gap < 7 and behaviour.get("totalCount", 0) > 15:
        positive_drivers.append({
            "title": "Active Daily Operations",
            "detail": f"No dormancy gaps exceeding {max_gap} days; steady customer transactions."
        })
    elif max_gap >= 14:
        negative_drivers.append({
            "title": f"Prolonged Inactivity Gap ({max_gap} days)",
            "detail": f"Extended dormancy period indicates operational pauses or off-ledger cash activity."
        })
        warnings.append({
            "severity": "high",
            "title": "Operational Dormancy Alert",
            "message": f"Maximum transaction gap of {max_gap} days exceeds the 14-day safety threshold."
        })

    # Story consistency
    if story.get("badgeType") == "good":
        positive_drivers.append({
            "title": "High Financial Story Consistency",
            "detail": f"Declared revenue matches verified bank inflows within {story.get('variancePct')}%."
        })
    else:
        warnings.append({
            "severity": "high" if story.get("badgeType") == "danger" else "medium",
            "title": "Story Divergence Flag",
            "message": story.get("detail", "")
        })

    # Expense spikes
    spikes = financials.get("expenseSpikes", [])
    if len(spikes) > 0:
        warnings.append({
            "severity": "high",
            "title": "Expense Spike Anomaly",
            "message": f"{len(spikes)} month(s) exhibited debits significantly above statistical moving average."
        })
        negative_drivers.append({
            "title": f"{len(spikes)} Major Expense Spike(s) Detected",
            "detail": "Outflows exceeded statistical control limits, eroding cash buffers."
        })

    # Data Trust
    if trust.get("badgeType") != "good":
        warnings.append({
            "severity": "medium",
            "title": "Data Trust Integrity Review",
            "message": f"{trust.get('duplicateCount', 0)} duplicates or {trust.get('invalidCount', 0)} invalid rows detected in ledger."
        })

    # Breakdown dictionary with exact earned scores
    breakdown = {
        "revenue_stability": s_rev,
        "cash_flow_strength": s_cf,
        "payment_behaviour": s_pay,
        "transaction_behaviour": s_txn,
        "financial_consistency": s_cons,
        "data_trust": s_trust
    }

    # Pillars formatted for frontend: score MUST BE earned points, NOT 0-100 percentage! (Requirement 1, 2, 3, 5, 6)
    pillars = [
        {
            "name": "Revenue Stability",
            "score": s_rev,
            "max_score": 20,
            "raw_score": s_rev,
            "percentage": min(100, max(0, round((s_rev / 20.0) * 100))),
            "weight": "20%",
            "icon": "TrendingUp",
            "color": "blue",
            "explanation": exp_rev
        },
        {
            "name": "Cash Flow Strength",
            "score": s_cf,
            "max_score": 20,
            "raw_score": s_cf,
            "percentage": min(100, max(0, round((s_cf / 20.0) * 100))),
            "weight": "20%",
            "icon": "DollarSign",
            "color": "emerald",
            "explanation": exp_cf
        },
        {
            "name": "Payment Behaviour",
            "score": s_pay,
            "max_score": 15,
            "raw_score": s_pay,
            "percentage": min(100, max(0, round((s_pay / 15.0) * 100))),
            "weight": "15%",
            "icon": "CreditCard",
            "color": "purple",
            "explanation": exp_pay
        },
        {
            "name": "Transaction Behaviour",
            "score": s_txn,
            "max_score": 15,
            "raw_score": s_txn,
            "percentage": min(100, max(0, round((s_txn / 15.0) * 100))),
            "weight": "15%",
            "icon": "Activity",
            "color": "indigo",
            "explanation": exp_txn
        },
        {
            "name": "Financial Consistency",
            "score": s_cons,
            "max_score": 15,
            "raw_score": s_cons,
            "percentage": min(100, max(0, round((s_cons / 15.0) * 100))),
            "weight": "15%",
            "icon": "Scale",
            "color": "cyan",
            "explanation": exp_cons
        },
        {
            "name": "Data Trust",
            "score": s_trust,
            "max_score": 15,
            "raw_score": s_trust,
            "percentage": min(100, max(0, round((s_trust / 15.0) * 100))),
            "weight": "15%",
            "icon": "ShieldCheck",
            "color": "amber",
            "explanation": exp_trust
        }
    ]

    res = {
        "score": total_score,
        "risk_level": risk_level,
        "riskLevel": risk_level,
        "risk_category": risk_category,
        "riskCategory": risk_category,
        "badgeColor": badge_color,
        "disclaimer": "CreditBridge prototype risk classification, NOT an official CIBIL/bank credit bureau score.",
        "breakdown": breakdown,
        "pillars": pillars,
        "positive_drivers": positive_drivers,
        "positiveDrivers": positive_drivers,
        "negative_drivers": negative_drivers,
        "negativeDrivers": negative_drivers,
        "warnings": warnings,
        "riskWarnings": warnings
    }

    # Pass through the validation & safety layer to guarantee invariant: 0 <= score <= max_score
    return sanitize_scoring_payload(res)

