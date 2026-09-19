from datetime import datetime
from typing import List, Dict, Any
from services.financial_analysis import parse_date

def calculate_transaction_behaviour(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes operational transaction patterns:
    - Activity frequency & volume
    - Average ticket size
    - Dormancy gaps & dormancy warnings (>=14 days)
    - Payment mix distribution (UPI, Bank Transfer, Cash, Other)
    - Seasonality detection
    """
    if not transactions:
        return {
            "totalCount": 0,
            "creditCount": 0,
            "debitCount": 0,
            "avgTicketSize": 0,
            "avgMonthlyFrequency": 0,
            "maxGapDays": 0,
            "gapAlerts": [],
            "largestTransaction": None,
            "paymentMix": [],
            "seasonality": {
                "seasonality_detected": False,
                "seasonality_score": 0.0,
                "seasonal_months": []
            }
        }

    # Sort chronologically
    sorted_txns = sorted(transactions, key=lambda t: parse_date(t.get("date", "")))

    credit_count = 0
    debit_count = 0
    total_volume = 0.0
    largest_txn = sorted_txns[0] if sorted_txns else None

    method_counts = {"UPI": 0, "Bank Transfer": 0, "Cash": 0, "Other": 0}
    month_counts: Dict[str, int] = {}
    month_volumes: Dict[str, float] = {}

    for t in sorted_txns:
        t_type = str(t.get("transaction_type", "")).lower()
        amt = float(t.get("amount", 0.0) or 0.0)
        total_volume += amt

        if t_type in ["credit", "income"]:
            credit_count += 1
        else:
            debit_count += 1

        if largest_txn is None or amt > float(largest_txn.get("amount", 0.0) or 0.0):
            largest_txn = t

        # Payment method classification
        m = str(t.get("payment_method", "")).strip().lower()
        if any(term in m for term in ["bank", "neft", "imps", "rtgs", "wire"]):
            method_counts["Bank Transfer"] += 1
        elif "upi" in m:
            method_counts["UPI"] += 1
        elif "cash" in m:
            method_counts["Cash"] += 1
        else:
            method_counts["Other"] += 1

        # Track monthly activity for seasonality
        d = parse_date(t.get("date", ""))
        m_key = d.strftime("%b %Y")
        month_counts[m_key] = month_counts.get(m_key, 0) + 1
        month_volumes[m_key] = month_volumes.get(m_key, 0.0) + amt

    # Calculate dormancy gaps between consecutive transactions
    max_gap_days = 0
    gap_alerts = []

    for i in range(1, len(sorted_txns)):
        prev_d = parse_date(sorted_txns[i - 1].get("date", ""))
        curr_d = parse_date(sorted_txns[i].get("date", ""))
        diff_days = abs((curr_d - prev_d).days)

        if diff_days > max_gap_days:
            max_gap_days = diff_days

        if diff_days >= 14:
            gap_alerts.append({
                "days": diff_days,
                "startDate": sorted_txns[i - 1].get("date"),
                "endDate": sorted_txns[i].get("date"),
                "detail": f"Dormancy gap of {diff_days} days detected between {sorted_txns[i - 1].get('date')} and {sorted_txns[i].get('date')}."
            })

    total_count = len(sorted_txns)
    payment_mix = [
        {"name": "UPI", "count": method_counts["UPI"], "percent": round((method_counts["UPI"] / total_count) * 100), "color": "#3B82F6"},
        {"name": "Bank Transfer", "count": method_counts["Bank Transfer"], "percent": round((method_counts["Bank Transfer"] / total_count) * 100), "color": "#10B981"},
        {"name": "Cash", "count": method_counts["Cash"], "percent": round((method_counts["Cash"] / total_count) * 100), "color": "#F59E0B"},
        {"name": "Other", "count": method_counts["Other"], "percent": round((method_counts["Other"] / total_count) * 100), "color": "#8B5CF6"},
    ]
    payment_mix = [p for p in payment_mix if p["count"] > 0]

    # Calculate operational span in months
    first_date = parse_date(sorted_txns[0].get("date", ""))
    last_date = parse_date(sorted_txns[-1].get("date", ""))
    months_span = max(1, (last_date.year - first_date.year) * 12 + (last_date.month - first_date.month) + 1)

    avg_monthly_frequency = round(total_count / months_span)
    avg_ticket_size = round(total_volume / (total_count or 1))

    # Seasonality analysis
    seasonality_detected = False
    seasonal_months = []
    seasonality_score = 0.0
    if len(month_volumes) >= 3:
        volumes = list(month_volumes.values())
        avg_vol = sum(volumes) / len(volumes)
        for m_name, vol in month_volumes.items():
            if vol > avg_vol * 1.35 or vol < avg_vol * 0.65:
                seasonal_months.append(m_name)
        if len(seasonal_months) > 0:
            seasonality_detected = True
            seasonality_score = round(min(100.0, (len(seasonal_months) / len(month_volumes)) * 100), 1)

    return {
        "totalCount": total_count,
        "creditCount": credit_count,
        "debitCount": debit_count,
        "avgTicketSize": avg_ticket_size,
        "avgMonthlyFrequency": avg_monthly_frequency,
        "maxGapDays": max_gap_days,
        "gapAlerts": gap_alerts,
        "largestTransaction": largest_txn,
        "paymentMix": payment_mix,
        "seasonality": {
            "seasonality_detected": seasonality_detected,
            "seasonality_score": seasonality_score,
            "seasonal_months": seasonal_months
        }
    }
