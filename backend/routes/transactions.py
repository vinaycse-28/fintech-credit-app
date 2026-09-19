import io
import csv
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from database import get_db
from models import Business, Transaction, User
from schemas import TransactionCreate, TransactionUploadResponse, TransactionListResponse
from routes.business import get_latest_business
from services.auth_service import get_optional_current_user

from datetime import datetime, timezone

router = APIRouter(tags=["Transactions"])

def make_txn_signature(date_val: Any, amount_val: Any, txn_type: str, method: str, desc: str) -> str:
    clean_date = str(date_val or "").strip()
    try:
        clean_amt = f"{float(amount_val):.2f}"
    except (ValueError, TypeError):
        clean_amt = str(amount_val)
    clean_type = str(txn_type or "").strip().lower()
    clean_method = str(method or "").strip().lower()
    clean_desc = str(desc or "").strip().lower()
    return f"{clean_date}_{clean_amt}_{clean_type}_{clean_method}_{clean_desc}"

def ensure_business_exists(db: Session, business_id: Optional[str] = None, current_user: Optional[User] = None) -> Business:
    if business_id:
        biz = db.query(Business).filter(Business.id == business_id).first()
        if biz:
            if current_user and biz.user_id and biz.user_id != current_user.id:
                if not (biz.id.startswith("demo_") or biz.id.startswith("biz_demo_")):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Forbidden: You do not have permission to access another user's business data."
                    )
            return biz
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business profile with ID '{business_id}' not found."
        )
    
    query = db.query(Business)
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    biz = query.order_by(Business.created_at.desc()).first()
    if not biz:
        biz = db.query(Business).order_by(Business.created_at.desc()).first()
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please create a business profile first."
        )
    return biz

@router.post("/upload-transactions", response_model=TransactionUploadResponse)
async def upload_transactions(
    request: Request,
    file: Optional[UploadFile] = File(None),
    business_id: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept CSV transaction data using multipart/form-data OR application/json.
    Validates required columns, flags invalid rows, detects duplicate transactions,
    and stores clean records in the relational database.
    """
    raw_rows: List[Dict[str, Any]] = []
    content_type = request.headers.get("content-type", "").lower()

    if "multipart/form-data" in content_type and file is not None:
        contents = await file.read()
        try:
            text = contents.decode("utf-8-sig")
        except UnicodeDecodeError:
            text = contents.decode("latin-1")

        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV has no header row.")

        # Normalize fieldnames
        field_map = {}
        for fn in reader.fieldnames:
            clean_fn = fn.strip().lower()
            if "date" in clean_fn:
                field_map["date"] = fn
            elif "amount" in clean_fn:
                field_map["amount"] = fn
            elif "type" in clean_fn:
                field_map["transaction_type"] = fn
            elif "method" in clean_fn or "payment" in clean_fn:
                field_map["payment_method"] = fn
            elif "category" in clean_fn:
                field_map["category"] = fn
            elif "desc" in clean_fn:
                field_map["description"] = fn
            elif "id" in clean_fn:
                field_map["transaction_id"] = fn

        if "date" not in field_map or "amount" not in field_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV must contain at least 'date' and 'amount' columns."
            )

        for row in reader:
            raw_rows.append({
                "transaction_id": row.get(field_map.get("transaction_id", ""), "").strip(),
                "date": row.get(field_map.get("date", ""), "").strip(),
                "amount": row.get(field_map.get("amount", ""), "").strip(),
                "transaction_type": row.get(field_map.get("transaction_type", ""), "credit").strip(),
                "category": row.get(field_map.get("category", ""), "").strip() or "General",
                "payment_method": row.get(field_map.get("payment_method", ""), "UPI").strip(),
                "description": row.get(field_map.get("description", ""), "Transaction ledger record").strip()
            })

    elif "application/json" in content_type:
        body = await request.json()
        if isinstance(body, list):
            raw_rows = body
        elif isinstance(body, dict):
            raw_rows = body.get("transactions") or []
            business_id = business_id or body.get("business_id")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported Content-Type. Please upload a CSV multipart file or send a JSON payload."
        )

    if not raw_rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transaction records found in request."
        )

    biz = ensure_business_exists(db, business_id)

    total_rows = len(raw_rows)
    valid_rows = 0
    invalid_rows = 0
    duplicate_rows = 0
    transactions_to_save: List[Transaction] = []

    # Query existing signatures for this business to detect duplicates persistently
    # (source IDs from CSVs are not persisted; we rely on content signature dedup)
    existing_txns = db.query(Transaction).filter(Transaction.business_id == biz.id).all()
    seen_ids: set = set()  # tracks source_ids seen in THIS upload batch only
    seen_sigs = {
        make_txn_signature(t.date, t.amount, t.transaction_type, t.payment_method, t.description)
        for t in existing_txns
    }

    for idx, r in enumerate(raw_rows):
        date_val = str(r.get("date", "")).strip()
        amt_raw = r.get("amount")

        # Amount validation
        try:
            amt_val = float(amt_raw)
            if amt_val <= 0:
                invalid_rows += 1
                continue
        except (ValueError, TypeError):
            invalid_rows += 1
            continue

        # Date validation
        if not date_val:
            invalid_rows += 1
            continue

        t_type_raw = str(r.get("transaction_type", "credit")).strip().lower()
        t_type = "debit" if any(x in t_type_raw for x in ["deb", "exp", "withdrawal", "out"]) else "credit"
        # Source ID from CSV — used only for dedup detection, NOT as the DB primary key
        source_id = str(r.get("transaction_id") or r.get("id") or "").strip()

        desc = str(r.get("description", "Transaction record")).strip()
        cat = str(r.get("category", "Sales Revenue" if t_type == "credit" else "Operational Expense")).strip()
        method = str(r.get("payment_method", "UPI")).strip() or "UPI"

        sig = make_txn_signature(date_val, amt_val, t_type, method, desc)
        # Dedup: check source_id within this business OR check the content signature
        if (source_id and source_id.lower() in seen_ids) or (sig in seen_sigs):
            duplicate_rows += 1
            continue

        # Always generate a globally unique DB primary key to avoid UNIQUE constraint errors
        t_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        if source_id:
            seen_ids.add(source_id.lower())
        seen_sigs.add(sig)
        valid_rows += 1

        transactions_to_save.append(
            Transaction(
                id=t_id,
                business_id=biz.id,
                date=date_val,
                amount=amt_val,
                transaction_type=t_type,
                category=cat,
                payment_method=method,
                description=desc,
                created_at=datetime.now(timezone.utc)
            )
        )

    if transactions_to_save:
        db.bulk_save_objects(transactions_to_save)
        db.commit()

    sample = [
        {
            "transaction_id": t.id,
            "date": t.date,
            "amount": t.amount,
            "transaction_type": t.transaction_type,
            "category": t.category,
            "payment_method": t.payment_method,
            "description": t.description
        }
        for t in transactions_to_save[:5]
    ]

    return TransactionUploadResponse(
        success=True,
        total_rows=total_rows,
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        duplicate_rows=duplicate_rows,
        transactions_saved=len(transactions_to_save),
        count=len(transactions_to_save),
        sample=sample
    )

@router.post("/transactions")
def add_single_transaction(
    payload: TransactionCreate,
    business_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts manually entered single transaction, validates, and saves it.
    """
    biz = ensure_business_exists(db, business_id, current_user)

    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction amount must be strictly greater than 0."
        )

    t_id = payload.transaction_id or payload.id or f"TXN-MAN-{uuid.uuid4().hex[:6].upper()}"
    t_type = "debit" if any(x in payload.transaction_type.lower() for x in ["deb", "exp"]) else "credit"
    desc = payload.description or "Manual transaction entry"
    cat = payload.category or ("Sales Revenue" if t_type == "credit" else "General Expense")
    method = payload.payment_method or "UPI"
    amt = float(payload.amount)

    sig = make_txn_signature(payload.date, amt, t_type, method, desc)
    existing = db.query(Transaction).filter(Transaction.business_id == biz.id).all()
    for ex in existing:
        if (t_id and ex.id and ex.id.lower() == t_id.lower()) or make_txn_signature(ex.date, ex.amount, ex.transaction_type, ex.payment_method, ex.description) == sig:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction already exists for this business profile."
            )

    new_txn = Transaction(
        id=t_id,
        business_id=biz.id,
        date=payload.date,
        amount=amt,
        transaction_type=t_type,
        category=cat,
        payment_method=method,
        description=desc,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)

    total_count = db.query(Transaction).filter(Transaction.business_id == biz.id).count()

    return {
        "success": True,
        "transaction": {
            "transaction_id": new_txn.id,
            "date": new_txn.date,
            "amount": new_txn.amount,
            "transaction_type": new_txn.transaction_type,
            "category": new_txn.category,
            "payment_method": new_txn.payment_method,
            "description": new_txn.description
        },
        "totalCount": total_count
    }

MONTH_MAP = {
    "1": "01", "01": "01", "january": "01", "jan": "01",
    "2": "02", "02": "02", "february": "02", "feb": "02",
    "3": "03", "03": "03", "march": "03", "mar": "03",
    "4": "04", "04": "04", "april": "04", "apr": "04",
    "5": "05", "05": "05", "may": "05",
    "6": "06", "06": "06", "june": "06", "jun": "06",
    "7": "07", "07": "07", "july": "07", "jul": "07",
    "8": "08", "08": "08", "august": "08", "aug": "08",
    "9": "09", "09": "09", "september": "09", "sep": "09",
    "10": "10", "october": "10", "oct": "10",
    "11": "11", "november": "11", "nov": "11",
    "12": "12", "december": "12", "dec": "12",
}

@router.get("/transactions/{business_id}")
@router.get("/transactions")
def get_transactions_list(
    business_id: Optional[str] = None,
    search: str = Query("", description="Search description, ID, category"),
    type: str = Query("all", description="credit, debit, or all"),
    category: str = Query("all", description="Category filter"),
    year: str = Query("all", description="Year filter"),
    month: str = Query("all", description="Month filter"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(15, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns filterable, searchable, and paginated transaction ledger.
    """
    biz = ensure_business_exists(db, business_id, current_user)
    query = db.query(Transaction).filter(Transaction.business_id == biz.id)

    if type != "all":
        query = query.filter(Transaction.transaction_type == type.lower())

    if category != "all":
        query = query.filter(Transaction.category == category)

    # Dynamic Year Filter
    if year != "all" and str(year).strip():
        y_val = str(year).strip()
        query = query.filter(Transaction.date.like(f"{y_val}%"))

    # Dynamic Month Filter
    if month != "all" and str(month).strip():
        m_code = MONTH_MAP.get(str(month).strip().lower(), str(month).strip())
        if len(m_code) == 1:
            m_code = f"0{m_code}"
        query = query.filter(
            (Transaction.date.like(f"%-{m_code}-%")) |
            (Transaction.date.like(f"%/{m_code}/%")) |
            (Transaction.date.like(f"%-{m_code}"))
        )

    if search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.description.ilike(s)) |
            (Transaction.id.ilike(s)) |
            (Transaction.category.ilike(s)) |
            (Transaction.payment_method.ilike(s))
        )

    total = query.count()
    items = query.order_by(Transaction.date.desc()).offset((page - 1) * pageSize).limit(pageSize).all()

    # Get distinct categories for filter dropdown
    all_categories = [
        c[0] for c in db.query(Transaction.category).filter(Transaction.business_id == biz.id).distinct().all() if c[0]
    ]

    # Get distinct years dynamically from all transactions for this business
    all_dates = [
        d[0] for d in db.query(Transaction.date).filter(Transaction.business_id == biz.id).all() if d[0]
    ]
    years_set = set()
    for d_str in all_dates:
        parts = str(d_str).split("-")
        if len(parts) >= 1 and len(parts[0]) == 4 and parts[0].isdigit():
            years_set.add(parts[0])
        elif "/" in str(d_str):
            slash_parts = str(d_str).split("/")
            for sp in slash_parts:
                if len(sp) == 4 and sp.isdigit():
                    years_set.add(sp)
    all_years = sorted(list(years_set), reverse=True)

    formatted_items = [
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
        for t in items
    ]

    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 1

    return {
        "items": formatted_items,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages,
        "categories": all_categories,
        "years": all_years
    }
