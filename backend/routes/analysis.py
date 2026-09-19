import json
import uuid
import copy
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import get_db
from models import Business, Transaction, AnalysisResult, User
from schemas import AnalyzeRequest
from services.financial_analysis import calculate_financial_metrics
from services.transaction_analysis import calculate_transaction_behaviour
from services.trust_analysis import (
    analyze_data_trust,
    check_financial_story_consistency,
    evaluate_cross_signals
)
from services.scoring_engine import (
    calculate_creditworthiness_score,
    calculate_revenue_stability,
    calculate_cash_flow_strength,
    calculate_payment_behaviour,
    calculate_transaction_behaviour as calc_txn_behaviour,
    calculate_financial_consistency,
    calculate_data_trust,
    sanitize_scoring_payload
)
from services.auth_service import get_optional_current_user
from routes.transactions import ensure_business_exists, make_txn_signature

router = APIRouter(tags=["Analysis Engine"])

class ScoreSimulatorRequest(BaseModel):
    business_id: Optional[str] = None
    revenue_change_pct: float = Field(default=0.0, ge=-20.0, le=30.0)
    expense_change_pct: float = Field(default=0.0, ge=-20.0, le=30.0)
    payment_consistency: float = Field(default=50.0, ge=0.0, le=100.0)
    transaction_consistency: float = Field(default=50.0, ge=0.0, le=100.0)

def generate_financial_story(financials: Dict[str, Any], behaviour: Dict[str, Any], story: Dict[str, Any], trust: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a dynamic, data-driven narrative and key observations (Part 13)."""
    avg_rev = financials.get("avgMonthlyRevenue", 0)
    avg_exp = financials.get("avgMonthlyExpenses", 0)
    net_cf = financials.get("avgMonthlyCashFlow", 0)
    pos_months = financials.get("positiveMonths", 0)
    total_months = financials.get("totalMonths", 1) or 1
    rev_cv = financials.get("revenueCV", 0)
    variance_pct = story.get("variancePct", 0)

    # Narrative generation
    stability_desc = "remained stable" if rev_cv < 0.25 else ("showed moderate fluctuations" if rev_cv < 0.45 else "exhibited significant volatility")
    cf_desc = f"maintained positive cash flow in {pos_months} of {total_months} months" if net_cf >= 0 else "experienced operational cash deficits"
    txn_desc = f"Transaction activity was consistent with {behaviour.get('totalCount', 0)} recorded entries"

    summary_text = (
        f"Revenue {stability_desc} during the evaluated {total_months}-month cycle, and the business {cf_desc}. "
        f"{txn_desc}. Declared figures aligned within {variance_pct}% of audited banking records."
    )

    observations = []
    if rev_cv < 0.3:
        observations.append({"type": "positive", "text": "Stable monthly revenue run-rate"})
    else:
        observations.append({"type": "warning", "text": f"Elevated revenue volatility (CV: {rev_cv})"})

    if net_cf > 0:
        observations.append({"type": "positive", "text": f"Positive net operating cash flow (₹{round(net_cf):,} avg/mo)"})
    else:
        observations.append({"type": "warning", "text": "Operating cash flow deficit requiring liquidity cushion"})

    if behaviour.get("maxGapDays", 0) <= 7:
        observations.append({"type": "positive", "text": "Consistent daily transaction activity with zero dormancy gaps"})
    else:
        observations.append({"type": "warning", "text": f"Transaction gap of {behaviour.get('maxGapDays')} days observed"})

    if variance_pct <= 15:
        observations.append({"type": "positive", "text": "Observed turnover validates declared revenue"})
    else:
        observations.append({"type": "warning", "text": f"Variance of {variance_pct}% between declared and verified revenue"})

    if trust.get("score", 100) >= 90:
        observations.append({"type": "positive", "text": "High ledger integrity with clean record verification"})
    else:
        observations.append({"type": "warning", "text": f"Data quality flags detected ({trust.get('duplicateCount', 0)} duplicates, {trust.get('invalidCount', 0)} format anomalies)"})

    return {
        "summary": summary_text,
        "observations": observations
    }

def detect_financial_anomalies(financials: Dict[str, Any], behaviour: Dict[str, Any], story: Dict[str, Any], trust: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Detects real anomalies with severity (Part 14)."""
    anomalies = []

    # 1. Expense Spike
    monthly = financials.get("monthlyData", [])
    avg_exp = financials.get("avgMonthlyExpenses", 0)
    for m in monthly:
        if avg_exp > 0 and m.get("expenses", 0) > avg_exp * 1.4:
            anomalies.append({
                "title": "Expense Spike Detected",
                "description": f"Outflows in {m.get('month', 'a recent period')} (₹{round(m.get('expenses', 0)):,}) were {round((m.get('expenses', 0)/avg_exp - 1)*100)}% higher than the historical average.",
                "severity": "High" if m.get('expenses', 0) > avg_exp * 1.7 else "Medium"
            })
            break

    # 2. Revenue Mismatch
    var_pct = story.get("variancePct", 0)
    if var_pct > 25:
        anomalies.append({
            "title": "Revenue Mismatch",
            "description": f"Declared monthly revenue differs from observed transaction turnover by {var_pct}%.",
            "severity": "High" if var_pct > 40 else "Medium"
        })
    elif var_pct > 15:
        anomalies.append({
            "title": "Minor Revenue Variance",
            "description": f"Declared revenue differs from observed banking turnover by {var_pct}%.",
            "severity": "Low"
        })

    # 3. Transaction Gap
    max_gap = behaviour.get("maxGapDays", 0)
    if max_gap > 14:
        anomalies.append({
            "title": "Prolonged Transaction Dormancy",
            "description": f"An unusually long dormancy pause of {max_gap} consecutive days was detected in the transaction timeline.",
            "severity": "High" if max_gap > 21 else "Medium"
        })
    elif max_gap > 7:
        anomalies.append({
            "title": "Transaction Gap",
            "description": f"Operational inactivity gap of {max_gap} days detected between transactions.",
            "severity": "Low"
        })

    # 4. Data Quality / Duplicates
    dups = trust.get("duplicateCount", 0)
    invalids = trust.get("invalidCount", 0)
    if dups > 0 or invalids > 0:
        anomalies.append({
            "title": "Data Quality Flag",
            "description": f"Auditing detected {dups} duplicate transactions and {invalids} invalid entries in the uploaded dataset.",
            "severity": "Medium" if (dups > 5 or invalids > 2) else "Low"
        })

    return anomalies

def calculate_loan_readiness(financials: Dict[str, Any], scoring: Dict[str, Any], biz: Business) -> Dict[str, Any]:
    """Calculates prototype loan readiness decision support (Part 17)."""
    score = scoring.get("score", 70)
    avg_cf = financials.get("avgMonthlyCashFlow", 0)
    avg_rev = financials.get("avgMonthlyRevenue", 0)
    existing_emi = biz.existing_monthly_emi or 0.0

    # Net available monthly surplus after existing EMI
    net_surplus = max(0.0, avg_cf - existing_emi)

    # Conservative DSCR benchmark: 35% to 50% of available net surplus
    # If cash flow is lean, cap to 10% of revenue
    if net_surplus > 0:
        affordable_min = round(net_surplus * 0.30)
        affordable_max = round(net_surplus * 0.50)
    else:
        affordable_min = round(max(0.0, avg_rev * 0.04))
        affordable_max = round(max(0.0, avg_rev * 0.08))

    # Potential financing facility (12 to 24 month tenure)
    potential_min = max(50000, round(affordable_min * 12))
    potential_max = max(100000, round(affordable_max * 24))

    def format_inr(val):
        if val >= 10000000:
            return f"₹{val/10000000:.1f} Cr"
        if val >= 100000:
            return f"₹{val/100000:.1f}L"
        return f"₹{val:,}"

    breakdown = scoring.get("breakdown", {})
    return {
        "creditworthiness_signal": score,
        "cash_flow_strength": breakdown.get("cash_flow_strength", 14),
        "revenue_stability": breakdown.get("revenue_stability", 15),
        "debt_burden": f"{round((existing_emi / avg_rev * 100) if avg_rev > 0 else 0)}% of revenue",
        "data_trust": breakdown.get("data_trust", 14),
        "affordable_repayment_min": affordable_min,
        "affordable_repayment_max": affordable_max,
        "affordable_repayment_display": f"{format_inr(affordable_min)} – {format_inr(affordable_max)}",
        "potential_financing_min": potential_min,
        "potential_financing_max": potential_max,
        "potential_financing_display": f"{format_inr(potential_min)} – {format_inr(potential_max)}",
        "methodology": "Based on 35–50% operational cash surplus after existing EMI debt obligations over an estimated 12–24 month tenure.",
        "disclaimer": "Prototype estimate for demonstration only. Not a loan approval, guarantee, or official credit decision."
    }

def calculate_score_changes(prev_scoring: Dict[str, Any], current_scoring: Dict[str, Any]) -> List[str]:
    """Derives explainable score change drivers between two actual analyses (Part 11)."""
    prev_bd = prev_scoring.get("breakdown", {})
    curr_bd = current_scoring.get("breakdown", {})
    reasons = []

    diff_rev = curr_bd.get("revenue_stability", 0) - prev_bd.get("revenue_stability", 0)
    if diff_rev > 0:
        reasons.append(f"+{diff_rev} Revenue stability improved")
    elif diff_rev < 0:
        reasons.append(f"{diff_rev} Revenue stability declined")

    diff_cf = curr_bd.get("cash_flow_strength", 0) - prev_bd.get("cash_flow_strength", 0)
    if diff_cf > 0:
        reasons.append(f"+{diff_cf} Cash-flow consistency improved")
    elif diff_cf < 0:
        reasons.append(f"{diff_cf} Operating cash flow narrowed")

    diff_txn = curr_bd.get("transaction_behaviour", 0) - prev_bd.get("transaction_behaviour", 0)
    if diff_txn > 0:
        reasons.append(f"+{diff_txn} Transaction activity cadence improved")
    elif diff_txn < 0:
        reasons.append(f"{diff_txn} Inactivity gap or frequency reduction detected")

    diff_pay = curr_bd.get("payment_behaviour", 0) - prev_bd.get("payment_behaviour", 0)
    if diff_pay > 0:
        reasons.append(f"+{diff_pay} Digital payment share increased")
    elif diff_pay < 0:
        reasons.append(f"{diff_pay} Cash transaction reliance increased")

    diff_trust = curr_bd.get("data_trust", 0) - prev_bd.get("data_trust", 0)
    if diff_trust > 0:
        reasons.append(f"+{diff_trust} Data trust verified")
    elif diff_trust < 0:
        reasons.append(f"{diff_trust} Data quality anomalies flagged")

    return reasons

def execute_pipeline_for_business(biz: Business, db: Session, client_txns: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Core deterministic analytical pipeline:
    1. Read transactions from DB or payload
    2. Data trust integrity check
    3. Financial aggregation
    4. Transaction behaviour
    5. Story consistency
    6. Cross-signal consistency
    7. 100-point explainable scoring engine
    8. Dynamic positive/negative driver & warning generation
    9. Persist analysis result with history retention
    """
    db_txns = db.query(Transaction).filter(Transaction.business_id == biz.id).order_by(Transaction.date.asc()).all()

    # If client passed transactions in payload and DB had none, persist them into SQLite first
    if not db_txns and client_txns and len(client_txns) > 0:
        seen_sigs = set()
        to_save = []
        for r in client_txns:
            try:
                amt = float(r.get("amount", 0))
            except (ValueError, TypeError):
                continue
            if amt <= 0:
                continue
            d_val = str(r.get("date", "")).strip()
            if not d_val:
                continue
            t_type = "debit" if any(x in str(r.get("transaction_type", "")).lower() for x in ["deb", "exp"]) else "credit"
            t_id = str(r.get("transaction_id") or r.get("id") or f"TXN-{uuid.uuid4().hex[:8].upper()}").strip()
            desc = str(r.get("description", "Transaction record")).strip()
            method = str(r.get("payment_method", "UPI")).strip() or "UPI"
            cat = str(r.get("category", "Sales Revenue" if t_type == "credit" else "Operational Expense")).strip()
            sig = make_txn_signature(d_val, amt, t_type, method, desc)
            if sig in seen_sigs:
                continue
            seen_sigs.add(sig)
            to_save.append(
                Transaction(
                    id=t_id,
                    business_id=biz.id,
                    date=d_val,
                    amount=amt,
                    transaction_type=t_type,
                    category=cat,
                    payment_method=method,
                    description=desc,
                    created_at=datetime.now(timezone.utc)
                )
            )
        if to_save:
            db.bulk_save_objects(to_save)
            db.commit()
            db_txns = db.query(Transaction).filter(Transaction.business_id == biz.id).order_by(Transaction.date.asc()).all()

    raw_txns = [
        {
            "transaction_id": t.id,
            "id": t.id,
            "date": t.date,
            "amount": t.amount,
            "transaction_type": t.transaction_type,
            "category": t.category,
            "payment_method": t.payment_method,
            "description": t.description
        }
        for t in db_txns
    ]

    trust = analyze_data_trust(raw_txns)
    financials = calculate_financial_metrics(raw_txns)
    behaviour = calculate_transaction_behaviour(raw_txns)
    story = check_financial_story_consistency(
        biz.declared_monthly_revenue or 450000.0,
        financials.get("avgMonthlyRevenue", 0.0)
    )
    cross_signal = evaluate_cross_signals(financials, behaviour)
    scoring = calculate_creditworthiness_score(financials, behaviour, trust, story, cross_signal)

    # Check previous analysis run for score change explanations
    prev_record = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.business_id == biz.id)
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )
    score_change_info = None
    if prev_record and prev_record.analysis_json:
        try:
            prev_analysis = json.loads(prev_record.analysis_json)
            prev_scoring = prev_analysis.get("scoring", {})
            reasons = calculate_score_changes(prev_scoring, scoring)
            score_change_info = {
                "previous_score": prev_scoring.get("score", prev_record.creditworthiness_score),
                "current_score": scoring["score"],
                "delta": scoring["score"] - prev_scoring.get("score", prev_record.creditworthiness_score),
                "reasons": reasons
            }
        except Exception:
            pass

    financial_story = generate_financial_story(financials, behaviour, story, trust)
    anomalies = detect_financial_anomalies(financials, behaviour, story, trust)
    loan_readiness = calculate_loan_readiness(financials, scoring, biz)

    # Financial health scores (Part 12: 0-100 normalized metrics)
    bd = scoring.get("breakdown", {})
    exp_ratio = financials.get("expenseRatio", 0.75)
    financial_health = {
        "revenue_health": min(100, max(10, round((bd.get("revenue_stability", 15) / 20.0) * 100))),
        "cash_flow": min(100, max(10, round((bd.get("cash_flow_strength", 14) / 20.0) * 100))),
        "expense_control": min(100, max(10, round((1.0 - min(0.9, exp_ratio)) * 100 + 20))),
        "payment_behaviour": min(100, max(10, round((bd.get("payment_behaviour", 12) / 15.0) * 100))),
        "data_trust": min(100, max(10, round((bd.get("data_trust", 14) / 15.0) * 100)))
    }

    profile_dict = {
        "id": biz.id,
        "name": biz.business_name,
        "business_name": biz.business_name,
        "industry": biz.business_type,
        "business_type": biz.business_type,
        "location": biz.location,
        "age": biz.business_age,
        "business_age": biz.business_age,
        "employees": biz.employees,
        "declaredMonthlyRevenue": biz.declared_monthly_revenue,
        "declared_monthly_revenue": biz.declared_monthly_revenue,
        "existingMonthlyEmi": biz.existing_monthly_emi,
        "existing_monthly_emi": biz.existing_monthly_emi,
        "primaryPaymentMethods": [m.strip() for m in (biz.primary_payment_method or "").split(",") if m.strip()]
    }

    summary = {
        "score": scoring["score"],
        "riskCategory": scoring["riskCategory"],
        "risk_category": scoring["riskCategory"],
        "riskLevel": scoring["riskLevel"],
        "risk_level": scoring["riskLevel"],
        "badgeColor": scoring["badgeColor"],
        "monthlyRevenue": round(financials.get("avgMonthlyRevenue", 0.0)),
        "monthlyExpenses": round(financials.get("avgMonthlyExpenses", 0.0)),
        "netCashFlow": round(financials.get("avgMonthlyCashFlow", 0.0)),
        "transactionCount": behaviour.get("totalCount", 0),
        "evaluatedPeriod": f"{financials.get('totalMonths', 0)} months" if financials.get('totalMonths', 0) > 0 else "N/A"
    }

    complete_analysis = {
        "businessProfile": profile_dict,
        "profile": profile_dict,
        "summary": summary,
        "financials": financials,
        "behaviour": behaviour,
        "trust": trust,
        "story": story,
        "crossSignal": cross_signal,
        "scoring": scoring,
        "monthlyPreview": financials.get("monthlyData", [])[-6:],
        "trustStatus": trust.get("status"),
        "trustBadgeType": trust.get("badgeType"),
        "storyStatus": story.get("status"),
        "financialStory": financial_story,
        "anomalies": anomalies,
        "loanReadiness": loan_readiness,
        "financialHealth": financial_health,
        "scoreChange": score_change_info,
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }

    # Save as new AnalysisResult in DB to preserve full historical run sequence
    result_record = AnalysisResult(
        id=f"RES-{uuid.uuid4().hex[:8].upper()}",
        business_id=biz.id,
        revenue=financials.get("totalRevenue", 0.0),
        expenses=financials.get("totalExpenses", 0.0),
        cash_flow=financials.get("netCashFlow", 0.0),
        transaction_frequency=behaviour.get("avgMonthlyFrequency", 0.0),
        transaction_gaps=behaviour.get("maxGapDays", 0),
        seasonality_score=behaviour.get("seasonality", {}).get("seasonality_score", 0.0),
        payment_mix_score=float(scoring["breakdown"]["payment_behaviour"]),
        trust_score=float(trust.get("score", 95)),
        consistency_score=float(scoring["breakdown"]["financial_consistency"]),
        creditworthiness_score=scoring["score"],
        risk_level=scoring["riskLevel"],
        analysis_json=json.dumps(complete_analysis),
        created_at=datetime.now(timezone.utc)
    )
    db.add(result_record)
    db.commit()
    db.refresh(result_record)

    return complete_analysis

def get_persisted_or_computed_analysis(biz: Business, db: Session) -> Dict[str, Any]:
    """Retrieves most recent stored AnalysisResult from SQLite, or executes pipeline if not analyzed yet."""
    result_record = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.business_id == biz.id)
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )
    if result_record and result_record.analysis_json:
        try:
            saved = json.loads(result_record.analysis_json)
            saved["profile"]["name"] = biz.business_name
            saved["profile"]["business_name"] = biz.business_name
            return saved
        except Exception:
            pass
    return execute_pipeline_for_business(biz, db)

@router.post("/analyze")
def run_analysis(
    payload: Optional[AnalyzeRequest] = None,
    business_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Run complete analytical pipeline and return comprehensive decision support JSON."""
    biz_id = (payload.business_id if payload else None) or business_id
    biz = ensure_business_exists(db, biz_id, current_user)

    if payload and payload.profile:
        p = payload.profile
        if p.get("name"):
            biz.business_name = p.get("name")
        if p.get("industry") or p.get("business_type"):
            biz.business_type = p.get("industry") or p.get("business_type")
        if p.get("declaredMonthlyRevenue") or p.get("declared_monthly_revenue"):
            biz.declared_monthly_revenue = float(p.get("declaredMonthlyRevenue") or p.get("declared_monthly_revenue"))
        db.commit()

    client_txns = payload.transactions if payload else None
    return execute_pipeline_for_business(biz, db, client_txns)

@router.get("/dashboard/{business_id}")
@router.get("/dashboard")
def get_dashboard_summary(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Returns top-level dashboard metrics for the business from persistent SQLite storage."""
    biz = ensure_business_exists(db, business_id, current_user)
    analysis = get_persisted_or_computed_analysis(biz, db)
    return {
        "profile": analysis["profile"],
        "business_profile": analysis["profile"],
        "creditworthiness_score": analysis["scoring"]["score"],
        "risk_level": analysis["scoring"]["riskLevel"],
        "revenue": analysis["financials"]["totalRevenue"],
        "expenses": analysis["financials"]["totalExpenses"],
        "cash_flow": analysis["financials"]["netCashFlow"],
        "transaction_count": analysis["behaviour"]["totalCount"],
        "key_metrics": analysis["summary"],
        "summary": analysis["summary"],
        "scoring": analysis["scoring"],
        "financials": analysis["financials"],
        "behaviour": analysis["behaviour"],
        "trust": analysis["trust"],
        "story": analysis["story"],
        "monthlyPreview": analysis["monthlyPreview"],
        "trustStatus": analysis["trustStatus"],
        "trustBadgeType": analysis["trustBadgeType"],
        "storyStatus": analysis["storyStatus"],
        "crossSignal": analysis["crossSignal"],
        "positive_drivers": analysis["scoring"].get("positive_drivers", analysis["scoring"].get("positiveDrivers", [])),
        "negative_drivers": analysis["scoring"].get("negative_drivers", analysis["scoring"].get("negativeDrivers", [])),
        "warnings": analysis["scoring"].get("warnings", analysis["scoring"].get("riskWarnings", [])),
        "financialStory": analysis.get("financialStory"),
        "anomalies": analysis.get("anomalies", []),
        "loanReadiness": analysis.get("loanReadiness"),
        "financialHealth": analysis.get("financialHealth"),
        "scoreChange": analysis.get("scoreChange")
    }

@router.get("/financial-analysis/{business_id}")
@router.get("/financial-analysis")
def get_financial_analysis(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    biz = ensure_business_exists(db, business_id, current_user)
    analysis = get_persisted_or_computed_analysis(biz, db)
    return analysis["financials"]

@router.get("/transaction-behaviour/{business_id}")
@router.get("/transaction-behaviour")
def get_transaction_behaviour(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    biz = ensure_business_exists(db, business_id, current_user)
    analysis = get_persisted_or_computed_analysis(biz, db)
    return analysis["behaviour"]

@router.get("/trust-analysis/{business_id}")
@router.get("/trust-analysis")
def get_trust_analysis(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    biz = ensure_business_exists(db, business_id, current_user)
    analysis = get_persisted_or_computed_analysis(biz, db)
    return {
        "data_completeness": analysis["trust"].get("completeness"),
        "duplicate_count": analysis["trust"].get("duplicateCount"),
        "invalid_transaction_count": analysis["trust"].get("invalidCount"),
        "declared_revenue": analysis["story"].get("declaredRevenue"),
        "observed_revenue": analysis["story"].get("observedRevenue"),
        "revenue_difference": analysis["story"].get("variancePct"),
        "revenue_consistency": analysis["story"].get("status"),
        "cross_signal_consistency": analysis["crossSignal"].get("status"),
        "overall_trust_result": analysis["trust"].get("status"),
        "trust": analysis["trust"],
        "story": analysis["story"],
        "crossSignal": analysis["crossSignal"]
    }

@router.get("/score-explanation/{business_id}")
@router.get("/score-explanation")
def get_score_explanation(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    biz = ensure_business_exists(db, business_id, current_user)
    analysis = get_persisted_or_computed_analysis(biz, db)
    return analysis["scoring"]

@router.get("/score-history/{business_id}")
@router.get("/score-history")
def get_score_history(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Part 10 & 11: Real score history across analysis runs and change explanations."""
    biz = ensure_business_exists(db, business_id, current_user)
    records = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.business_id == biz.id)
        .order_by(AnalysisResult.created_at.asc())
        .all()
    )

    history = []
    for r in records:
        dt = r.created_at.strftime("%b %d, %Y") if r.created_at else "Analysis"
        history.append({
            "id": r.id,
            "date": dt,
            "score": r.creditworthiness_score,
            "risk_level": r.risk_level,
            "revenue": r.revenue,
            "cash_flow": r.cash_flow,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    # If only 1 record, show requirement message
    message = "Score history will appear as more financial data is analyzed." if len(records) <= 1 else None

    # Derive change explanation if 2 or more records exist
    change_explanation = None
    if len(records) >= 2:
        try:
            prev_a = json.loads(records[-2].analysis_json).get("scoring", {})
            curr_a = json.loads(records[-1].analysis_json).get("scoring", {})
            reasons = calculate_score_changes(prev_a, curr_a)
            change_explanation = {
                "score_delta": records[-1].creditworthiness_score - records[-2].creditworthiness_score,
                "reasons": reasons
            }
        except Exception:
            pass

    return {
        "history": history,
        "count": len(history),
        "message": message,
        "change_explanation": change_explanation
    }

@router.post("/score-simulator")
def run_score_simulator(
    payload: ScoreSimulatorRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 16: What-if Credit Score Simulator.
    Calculates projected creditworthiness without modifying persistent database records.
    """
    biz = ensure_business_exists(db, payload.business_id, current_user)
    base_analysis = get_persisted_or_computed_analysis(biz, db)

    current_score = base_analysis["scoring"]["score"]
    base_financials = copy.deepcopy(base_analysis["financials"])
    base_behaviour = copy.deepcopy(base_analysis["behaviour"])
    base_trust = copy.deepcopy(base_analysis["trust"])
    base_story = copy.deepcopy(base_analysis["story"])
    base_cross = copy.deepcopy(base_analysis["crossSignal"])

    # Apply simulation adjustments
    rev_mult = 1.0 + (payload.revenue_change_pct / 100.0)
    exp_mult = 1.0 + (payload.expense_change_pct / 100.0)

    sim_financials = copy.deepcopy(base_financials)
    sim_financials["totalRevenue"] = round(base_financials.get("totalRevenue", 0) * rev_mult)
    sim_financials["totalExpenses"] = round(base_financials.get("totalExpenses", 0) * exp_mult)
    sim_financials["avgMonthlyRevenue"] = round(base_financials.get("avgMonthlyRevenue", 0) * rev_mult)
    sim_financials["avgMonthlyExpenses"] = round(base_financials.get("avgMonthlyExpenses", 0) * exp_mult)
    sim_financials["netCashFlow"] = sim_financials["totalRevenue"] - sim_financials["totalExpenses"]
    sim_financials["avgMonthlyCashFlow"] = sim_financials["avgMonthlyRevenue"] - sim_financials["avgMonthlyExpenses"]

    # Adjust monthly data if present
    sim_monthly = []
    for m in base_financials.get("monthlyData", []):
        m_copy = copy.deepcopy(m)
        m_copy["revenue"] = round(m_copy.get("revenue", 0) * rev_mult)
        m_copy["expenses"] = round(m_copy.get("expenses", 0) * exp_mult)
        m_copy["netCashFlow"] = m_copy["revenue"] - m_copy["expenses"]
        sim_monthly.append(m_copy)
    sim_financials["monthlyData"] = sim_monthly
    sim_financials["positiveMonths"] = sum(1 for m in sim_monthly if m.get("netCashFlow", 0) >= 0)

    # Adjust behaviour according to sliders
    sim_behaviour = copy.deepcopy(base_behaviour)
    if payload.transaction_consistency > 60:
        sim_behaviour["maxGapDays"] = max(2, round(base_behaviour.get("maxGapDays", 7) * 0.6))
        sim_behaviour["avgMonthlyFrequency"] = round(base_behaviour.get("avgMonthlyFrequency", 15) * 1.2)
    elif payload.transaction_consistency < 40:
        sim_behaviour["maxGapDays"] = round(base_behaviour.get("maxGapDays", 7) * 1.4)

    # Adjust payment mix according to payment consistency slider
    sim_behaviour["paymentMix"] = [
        {"name": "UPI", "percent": min(85, round(payload.payment_consistency * 0.8))},
        {"name": "Bank Transfer", "percent": 15},
        {"name": "Cash", "percent": max(0, 100 - round(payload.payment_consistency * 0.8) - 15)}
    ]

    # Re-evaluate simulated scores
    sim_scoring = calculate_creditworthiness_score(
        sim_financials,
        sim_behaviour,
        base_trust,
        base_story,
        base_cross
    )

    projected_score = sim_scoring["score"]
    delta = projected_score - current_score

    # Determine "What changed?"
    what_changed = []
    if payload.revenue_change_pct > 5:
        what_changed.append("Revenue expansion improved overall debt-servicing capacity.")
    elif payload.revenue_change_pct < -5:
        what_changed.append("Revenue contraction increased volatility risk.")

    if payload.expense_change_pct < -5:
        what_changed.append("Operating expense reduction widened net cash flow margin.")
    elif payload.expense_change_pct > 5:
        what_changed.append("Higher operating expenses narrowed cash buffer.")

    if payload.payment_consistency > 60:
        what_changed.append("Higher digital transaction adoption enhanced auditable paper trail.")

    if payload.transaction_consistency > 60:
        what_changed.append("Tighter transaction cadence reduced operational dormancy penalty.")

    if not what_changed:
        what_changed.append("Minor baseline adjustments within normal operational variance.")

    return {
        "current_score": current_score,
        "projected_score": projected_score,
        "delta": delta,
        "what_changed": what_changed,
        "projected_breakdown": sim_scoring.get("breakdown"),
        "projected_risk_category": sim_scoring.get("riskCategory"),
        "projected_risk_level": sim_scoring.get("riskLevel"),
        "disclaimer": "Simulation only. This does not represent a guaranteed future score or loan approval."
    }
