import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Business, User
from schemas import BusinessProfileCreate, BusinessProfileResponse
from services.auth_service import get_current_user, get_optional_current_user, verify_business_ownership

router = APIRouter(tags=["Business Profile"])

def get_latest_business(db: Session, user: Optional[User] = None) -> Business:
    query = db.query(Business)
    if user:
        query = query.filter(Business.user_id == user.id)
    biz = query.order_by(Business.created_at.desc()).first()
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please create a business profile first."
        )
    return biz

@router.get("/businesses")
def get_user_businesses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    PART 6: Return only businesses belonging to the authenticated user.
    """
    user_businesses = (
        db.query(Business)
        .filter(Business.user_id == current_user.id)
        .order_by(Business.created_at.desc())
        .all()
    )

    businesses_data = [
        {
            "id": b.id,
            "business_name": b.business_name,
            "name": b.business_name,
            "business_type": b.business_type,
            "industry": b.business_type,
            "location": b.location,
            "business_age": b.business_age,
            "declared_monthly_revenue": b.declared_monthly_revenue,
            "created_at": b.created_at.isoformat() if b.created_at else None
        }
        for b in user_businesses
    ]

    return {"businesses": businesses_data}

@router.post("/business-profile", response_model=BusinessProfileResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_business_profile(
    payload: BusinessProfileCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Create or update small-business profile information.
    Automatically attaches user_id = authenticated user.
    """
    biz_id = payload.id or f"biz_{uuid.uuid4().hex[:8]}"
    existing = db.query(Business).filter(Business.id == biz_id).first()

    # Data isolation: if existing business belongs to another user, forbid modification
    if existing and existing.user_id and current_user and existing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot modify a business belonging to another user."
        )

    name = payload.business_name or payload.name or "MSME Enterprise"
    b_type = payload.business_type or payload.industry or "Retail & FMCG"
    age = payload.business_age or payload.age or "3 years"
    rev = float(payload.declared_monthly_revenue if payload.declared_monthly_revenue is not None else (payload.declaredMonthlyRevenue or 450000.0))
    emi = float(payload.existing_monthly_emi if payload.existing_monthly_emi is not None else (payload.existingMonthlyEmi or 0.0))

    pay_methods = payload.primary_payment_method
    if isinstance(pay_methods, list):
        pay_methods_str = ", ".join(pay_methods)
    else:
        pay_methods_str = str(pay_methods or "UPI, Bank Transfer")

    target_user_id = current_user.id if current_user else None

    if existing:
        existing.business_name = name
        existing.business_type = b_type
        existing.location = payload.location or existing.location
        existing.business_age = age
        existing.employees = payload.employees or existing.employees
        existing.declared_monthly_revenue = rev
        existing.existing_monthly_emi = emi
        existing.primary_payment_method = pay_methods_str
        if not existing.user_id and target_user_id:
            existing.user_id = target_user_id
        db.commit()
        db.refresh(existing)
        target_biz = existing
    else:
        target_biz = Business(
            id=biz_id,
            user_id=target_user_id,
            business_name=name,
            business_type=b_type,
            location=payload.location or "India",
            business_age=age,
            employees=payload.employees or "5",
            declared_monthly_revenue=rev,
            existing_monthly_emi=emi,
            primary_payment_method=pay_methods_str,
            created_at=datetime.now(timezone.utc)
        )
        db.add(target_biz)
        db.commit()
        db.refresh(target_biz)

    profile_dict = {
        "id": target_biz.id,
        "name": target_biz.business_name,
        "business_name": target_biz.business_name,
        "industry": target_biz.business_type,
        "business_type": target_biz.business_type,
        "location": target_biz.location,
        "age": target_biz.business_age,
        "business_age": target_biz.business_age,
        "employees": target_biz.employees,
        "declaredMonthlyRevenue": target_biz.declared_monthly_revenue,
        "declared_monthly_revenue": target_biz.declared_monthly_revenue,
        "existingMonthlyEmi": target_biz.existing_monthly_emi,
        "existing_monthly_emi": target_biz.existing_monthly_emi,
        "primaryPaymentMethods": [m.strip() for m in target_biz.primary_payment_method.split(",") if m.strip()],
        "primary_payment_method": target_biz.primary_payment_method,
        "description": payload.description or ""
    }

    return BusinessProfileResponse(
        business_id=target_biz.id,
        message="Business profile created successfully",
        profile=profile_dict
    )

@router.get("/business/{business_id}")
@router.get("/business-profile/{business_id}")
def get_business_profile_by_id(
    business_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(Business).filter(Business.id == business_id).first()
    if not biz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Business '{business_id}' not found")

    # Enforce data isolation if authenticated user tries to view another user's business
    if current_user and biz.user_id and biz.user_id != current_user.id:
        if not (biz.id.startswith("demo_") or biz.id.startswith("biz_demo_")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access this business profile."
            )

    return {
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
        "primaryPaymentMethods": [m.strip() for m in (biz.primary_payment_method or "").split(",") if m.strip()],
        "created_at": biz.created_at.isoformat() if biz.created_at else None
    }

@router.get("/business-profile")
def get_current_business_profile(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    biz = get_latest_business(db, current_user)
    return {
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
        "primaryPaymentMethods": [m.strip() for m in (biz.primary_payment_method or "").split(",") if m.strip()],
        "created_at": biz.created_at.isoformat() if biz.created_at else None
    }
