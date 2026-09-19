import math
from datetime import datetime
from typing import List, Dict, Any

def parse_date(date_str: str) -> datetime:
    """Parse date strings in various common ISO/CSV formats."""
    formats = ["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"]
    for fmt in formats:
        try:
            return datetime.strptime(str(date_str).strip(), fmt)
        except (ValueError, AttributeError):
            continue
    # Fallback to dateutil if needed, or default
    try:
        return datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
    except Exception:
        return datetime.utcnow()

def calculate_std_dev(arr: List[float]) -> float:
    if not arr or len(arr) <= 1:
        return 0.0
    mean = sum(arr) / len(arr)
    variance = sum((x - mean) ** 2 for x in arr) / (len(arr) - 1)
    return math.sqrt(variance)

def calculate_financial_metrics(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes transactional ledger and computes core financial metrics:
    - Monthly breakdown (Revenue, Expenses, Net Cash Flow, Margins)
    - Revenue CV (volatility), revenue growth %
    - Expense ratio % and statistical expense spikes
    - Positive vs Negative cash-flow months
    """
    if not transactions:
        return {
            "monthlyData": [],
            "totalRevenue": 0.0,
            "totalExpenses": 0.0,
            "netCashFlow": 0.0,
            "avgMonthlyRevenue": 0.0,
            "avgMonthlyExpenses": 0.0,
            "avgMonthlyCashFlow": 0.0,
            "revenueGrowth": 0.0,
            "revenueConsistency": "N/A",
            "revenueCV": 0.0,
            "expenseRatio": 0.0,
            "expenseSpikes": [],
            "positiveMonths": 0,
            "negativeMonths": 0,
            "totalMonths": 0,
            "highestRevenueMonth": None,
            "lowestRevenueMonth": None
        }

    # Group transactions by year-month
    month_map: Dict[str, Dict[str, Any]] = {}
    for t in transactions:
        d = parse_date(t.get("date", ""))
        key = f"{d.year}-{d.month:02d}"
        month_name = d.strftime("%b %Y")

        if key not in month_map:
            month_map[key] = {
                "key": key,
                "name": month_name,
                "revenue": 0.0,
                "expenses": 0.0,
                "netCashFlow": 0.0,
                "txnCount": 0,
                "timestamp": datetime(d.year, d.month, 1).timestamp()
            }

        amt = float(t.get("amount", 0.0) or 0.0)
        txn_type = str(t.get("transaction_type", "")).lower()

        if txn_type in ["credit", "income"]:
            month_map[key]["revenue"] += amt
        else:
            month_map[key]["expenses"] += amt

        month_map[key]["txnCount"] += 1

    # Sort months chronologically
    sorted_months = sorted(month_map.values(), key=lambda x: x["timestamp"])
    for m in sorted_months:
        m["netCashFlow"] = round(m["revenue"] - m["expenses"], 2)
        m["revenue"] = round(m["revenue"], 2)
        m["expenses"] = round(m["expenses"], 2)

    revenues = [m["revenue"] for m in sorted_months]
    expenses = [m["expenses"] for m in sorted_months]
    net_cash_flows = [m["netCashFlow"] for m in sorted_months]

    total_revenue = round(sum(revenues), 2)
    total_expenses = round(sum(expenses), 2)
    net_cash_flow = round(total_revenue - total_expenses, 2)
    num_months = len(sorted_months) or 1

    avg_monthly_revenue = round(total_revenue / num_months, 2)
    avg_monthly_expenses = round(total_expenses / num_months, 2)
    avg_monthly_cash_flow = round(net_cash_flow / num_months, 2)

    # Coefficient of Variation for Revenue
    rev_std = calculate_std_dev(revenues)
    rev_cv = round(rev_std / avg_monthly_revenue, 3) if avg_monthly_revenue > 0 else 0.0
    
    if rev_cv > 0.40:
        revenue_consistency = "Volatile"
    elif rev_cv >= 0.20:
        revenue_consistency = "Moderate Consistency"
    else:
        revenue_consistency = "High Consistency"

    # Revenue Growth % (comparing first half vs second half or first vs last)
    revenue_growth = 0.0
    if len(sorted_months) >= 2:
        mid = math.ceil(len(sorted_months) / 2)
        first_half = sorted_months[:mid]
        second_half = sorted_months[mid:]
        first_avg = sum(m["revenue"] for m in first_half) / len(first_half)
        second_avg = sum(m["revenue"] for m in second_half) / len(second_half)
        if first_avg > 0:
            revenue_growth = round(((second_avg - first_avg) / first_avg) * 100, 1)

    # Expense Ratio %
    expense_ratio = round((total_expenses / total_revenue) * 100, 1) if total_revenue > 0 else 0.0

    # Expense Spikes (mean + 1.8 * std, std > 1000)
    exp_std = calculate_std_dev(expenses)
    spike_threshold = avg_monthly_expenses + (1.8 * exp_std)
    expense_spikes = [
        m for m in sorted_months if m["expenses"] > spike_threshold and exp_std > 1000
    ]

    # Positive vs Negative cash flow months
    positive_months = sum(1 for m in sorted_months if m["netCashFlow"] > 0)
    negative_months = num_months - positive_months

    # Highest & Lowest revenue months
    highest_month = max(sorted_months, key=lambda m: m["revenue"]) if sorted_months else None
    lowest_month = min(sorted_months, key=lambda m: m["revenue"]) if sorted_months else None

    return {
        "monthlyData": sorted_months,
        "totalRevenue": total_revenue,
        "totalExpenses": total_expenses,
        "netCashFlow": net_cash_flow,
        "avgMonthlyRevenue": avg_monthly_revenue,
        "avgMonthlyExpenses": avg_monthly_expenses,
        "avgMonthlyCashFlow": avg_monthly_cash_flow,
        "revenueGrowth": revenue_growth,
        "revenueConsistency": revenue_consistency,
        "revenueCV": rev_cv,
        "expenseRatio": expense_ratio,
        "expenseSpikes": expense_spikes,
        "positiveMonths": positive_months,
        "negativeMonths": negative_months,
        "totalMonths": num_months,
        "highestRevenueMonth": highest_month,
        "lowestRevenueMonth": lowest_month
    }
