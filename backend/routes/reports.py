from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from routes.transactions import ensure_business_exists
from routes.analysis import get_persisted_or_computed_analysis
from services.report_service import generate_credit_report
from services.auth_service import get_optional_current_user

router = APIRouter(tags=["Credit Reports"])

@router.get("/credit-report/{business_id}")
@router.get("/credit-report")
def get_credit_report_data(
    business_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full assessment memorandum for the Credit Report print & export view from persistent SQLite.
    Verifies user ownership of business data.
    """
    biz = ensure_business_exists(db, business_id, current_user)
    analysis = get_persisted_or_computed_analysis(biz, db)
    report = generate_credit_report(analysis["profile"], analysis)
    # Attach financial story, anomalies, and loan readiness to report
    report["financialStory"] = analysis.get("financialStory")
    report["anomalies"] = analysis.get("anomalies", [])
    report["loanReadiness"] = analysis.get("loanReadiness")
    report["financialHealth"] = analysis.get("financialHealth")
    report["scoreChange"] = analysis.get("scoreChange")
    return report
