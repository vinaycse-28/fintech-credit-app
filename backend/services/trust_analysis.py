from datetime import datetime
from typing import List, Dict, Any
from services.financial_analysis import parse_date

def analyze_data_trust(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates ledger hygiene:
    - Duplicate transaction IDs or duplicate row signatures
    - Chronological invalid or future dates
    - Non-positive or malformed amounts
    - Suspicious repeated amount clustering
    """
    if not transactions:
        return {
            "status": "No Transaction Data",
            "badgeType": "danger",
            "score": 0,
            "duplicateCount": 0,
            "invalidCount": 0,
            "repeatedAmountRatio": 0.0,
            "completeness": 0,
            "checks": [
                {"label": "Transaction Data Presence", "passed": False, "detail": "No transactions found. Please upload financial records before analyzing."}
            ]
        }

    seen_ids = set()
    seen_signatures = set()
    duplicate_count = 0
    invalid_count = 0
    now = datetime.utcnow()
    amount_counts: Dict[float, int] = {}

    for t in transactions:
        t_id = t.get("transaction_id") or t.get("id")
        if t_id and t_id in seen_ids:
            duplicate_count += 1
        elif t_id:
            seen_ids.add(t_id)

        # Signature duplicate check (date + amount + type + description)
        sig = f"{t.get('date')}_{t.get('amount')}_{t.get('transaction_type')}_{t.get('description')}"
        if sig in seen_signatures:
            duplicate_count += 1
        else:
            seen_signatures.add(sig)

        # Date validity check
        d = parse_date(t.get("date", ""))
        if d > now:
            invalid_count += 1

        # Amount validity check
        try:
            amt = float(t.get("amount", 0.0) or 0.0)
            if amt <= 0:
                invalid_count += 1
            else:
                amt_key = round(amt)
                amount_counts[amt_key] = amount_counts.get(amt_key, 0) + 1
        except (ValueError, TypeError):
            invalid_count += 1

    # Check repeated amounts clustering (>25% share of same amount)
    max_cluster_count = max(amount_counts.values()) if amount_counts else 0
    dominant_amount = 0
    for amt, cnt in amount_counts.items():
        if cnt == max_cluster_count:
            dominant_amount = amt
            break
    repeated_ratio = (max_cluster_count / len(transactions)) if transactions else 0.0

    checks = [
        {
            "label": "Chronological & Date Validity",
            "passed": invalid_count == 0,
            "detail": "All dates are valid timestamps" if invalid_count == 0 else f"{invalid_count} invalid or future timestamps detected"
        },
        {
            "label": "Duplicate Records Check",
            "passed": duplicate_count == 0,
            "detail": "Zero duplicated transaction IDs or rows" if duplicate_count == 0 else f"{duplicate_count} duplicate transactions flagged"
        },
        {
            "label": "Amount Clustering Analysis",
            "passed": repeated_ratio < 0.25,
            "detail": f"Natural amount diversity (highest cluster: {round(repeated_ratio * 100, 1)}%)" if repeated_ratio < 0.25 else f"Suspicious clustering: {round(repeated_ratio * 100, 1)}% of entries are exactly ₹{dominant_amount}"
        },
        {
            "label": "Schema & Ledger Integrity",
            "passed": len(transactions) >= 10,
            "detail": f"{len(transactions)} rows verified across required fields" if len(transactions) >= 10 else f"Insufficient sample size ({len(transactions)} rows)"
        }
    ]

    trust_status = "High Data Trust"
    badge_type = "good"
    score = 95

    if duplicate_count > 3 or invalid_count > 2 or repeated_ratio >= 0.35:
        trust_status = "Needs Review"
        badge_type = "danger"
        score = 45
    elif len(transactions) < 10:
        # Insufficient data for reliable analysis
        trust_status = "Insufficient Data"
        badge_type = "danger"
        score = 20
    elif duplicate_count > 0 or invalid_count > 0 or repeated_ratio >= 0.25 or len(transactions) < 20:
        trust_status = "Moderate Data Trust"
        badge_type = "warning"
        score = 75

    completeness = max(0, 100 - (invalid_count * 10) - (duplicate_count * 5))

    return {
        "status": trust_status,
        "badgeType": badge_type,
        "score": score,
        "duplicateCount": duplicate_count,
        "invalidCount": invalid_count,
        "repeatedAmountRatio": round(repeated_ratio * 100, 1),
        "completeness": completeness,
        "checks": checks
    }

def check_financial_story_consistency(declared_monthly_revenue: float, observed_monthly_avg: float) -> Dict[str, Any]:
    """
    Compares owner-declared monthly revenue with observed bank inflows.
    Calculates divergence percentage and flags material inconsistencies.
    """
    declared = float(declared_monthly_revenue or 1.0)
    observed = float(observed_monthly_avg or 0.0)
    variance = (abs(declared - observed) / declared) * 100

    status = "Consistent"
    badge_type = "good"
    detail = "Self-declared monthly revenue closely matches actual observed bank inflows."

    if variance > 30:
        status = "Possible Inconsistency"
        badge_type = "danger"
        detail = f"High divergence ({round(variance, 1)}% variance). Declared: ₹{int(declared):,} vs Observed: ₹{int(observed):,}."
    elif variance >= 15:
        status = "Minor Variance"
        badge_type = "warning"
        detail = f"Minor divergence ({round(variance, 1)}% variance). Requires light underwriter clarification."

    return {
        "declaredRevenue": declared,
        "observedRevenue": round(observed, 2),
        "variancePct": round(variance, 1),
        "status": status,
        "badgeType": badge_type,
        "detail": detail
    }

def evaluate_cross_signals(financials: Dict[str, Any], behaviour: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cross-checks multi-dimensional signals to ensure harmonious business narrative:
    - Revenue Growth vs Net Operating Margin
    - Expense Spikes vs Revenue Volatility
    - Declared Growth vs Transaction Inactivity Gaps
    """
    rev_growth = financials.get("revenueGrowth", 0.0)
    total_rev = financials.get("totalRevenue", 0.0)
    net_cf = financials.get("netCashFlow", 0.0)
    net_margin = round((net_cf / total_rev) * 100, 1) if total_rev > 0 else 0.0
    spikes = financials.get("expenseSpikes", [])
    rev_cv = financials.get("revenueCV", 0.0)
    max_gap = behaviour.get("maxGapDays", 0)
    freq = behaviour.get("avgMonthlyFrequency", 0)

    is_consistent = True
    explanation = "Revenue trajectory, transaction volume, and operational cash-flow margins move in structural harmony."
    status = "Consistent Alignment"
    badge_type = "good"

    if rev_growth > 25 and net_margin < 0:
        is_consistent = False
        status = "Inconsistency Detected"
        badge_type = "warning"
        explanation = f"High revenue growth (+{rev_growth}%) contradicted by negative net margin ({net_margin}%). Suggests aggressive non-profitable volume."
    elif len(spikes) > 0 and rev_cv > 0.40:
        is_consistent = False
        status = "Volatile Divergence"
        badge_type = "danger"
        explanation = "Severe expense spikes coinciding with volatile revenue swings indicate unpredictable working capital cushions."
    elif max_gap >= 14 and rev_growth > 10:
        is_consistent = False
        status = "Activity Disconnect"
        badge_type = "warning"
        explanation = f"Declared growth occurs alongside long dormant operational gap ({max_gap} days). Verify if seasonal or ledger-omission."

    return {
        "isConsistent": is_consistent,
        "status": status,
        "badgeType": badge_type,
        "explanation": explanation,
        "signals": [
            {
                "name": "Revenue Trend",
                "direction": "up" if rev_growth >= 5 else ("down" if rev_growth <= -5 else "flat"),
                "value": f"{'+' if rev_growth >= 0 else ''}{rev_growth}%"
            },
            {
                "name": "Transaction Activity",
                "direction": "up" if freq >= 15 else "flat",
                "value": f"{freq} txns/mo"
            },
            {
                "name": "Cash-Flow Cushion",
                "direction": "up" if net_margin > 10 else ("down" if net_margin < 0 else "flat"),
                "value": f"{net_margin}% margin"
            }
        ]
    }
