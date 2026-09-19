"""
CreditBridge Backend — Pytest Test Suite
Covers: profile creation, transaction operations, CSV validation, analysis engine, scoring, risk, report.
Run from project root: py -m pytest backend/tests/test_backend.py -v
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from services.financial_analysis import calculate_financial_metrics
from services.transaction_analysis import calculate_transaction_behaviour
from services.trust_analysis import analyze_data_trust, check_financial_story_consistency, evaluate_cross_signals
from services.scoring_engine import calculate_creditworthiness_score

# ---------- In-Memory Test DB ----------
TEST_DATABASE_URL = "sqlite:///./test_creditbridge.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    import os
    try:
        os.remove("test_creditbridge.db")
    except Exception:
        pass

@pytest.fixture(scope="module")
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# ========================================
# SAMPLE DATA FIXTURES
# ========================================

SAMPLE_TRANSACTIONS = [
    {"transaction_id": f"TXN-T-{i:03d}", "date": f"2024-0{(i%6)+1}-{(i%28)+1:02d}",
     "amount": 10000 + i * 1500,
     "transaction_type": "credit" if i % 3 != 0 else "debit",
     "category": "Sales Revenue" if i % 3 != 0 else "Inventory Purchase",
     "payment_method": "UPI" if i % 2 == 0 else "Bank Transfer",
     "description": f"Test transaction {i}"}
    for i in range(30)
]

# ========================================
# 1. BUSINESS CREATION TESTS
# ========================================

def test_create_business_profile(client):
    payload = {
        "name": "Test Provisions Store",
        "industry": "Retail & FMCG",
        "location": "Bengaluru, Karnataka",
        "age": "2 years",
        "employees": "4",
        "declaredMonthlyRevenue": 350000,
        "existingMonthlyEmi": 15000,
        "primaryPaymentMethods": ["UPI", "Bank Transfer"]
    }
    resp = client.post("/api/business-profile", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "business_id" in data
    assert data["message"] == "Business profile created successfully"
    assert data["profile"]["name"] == "Test Provisions Store"

def test_create_business_with_snake_case_fields(client):
    payload = {
        "business_name": "Snake Case Shop",
        "business_type": "Food & Beverage / Cloud Kitchen",
        "location": "Mumbai",
        "declared_monthly_revenue": 280000
    }
    resp = client.post("/api/business-profile", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "business_id" in data

def test_get_business_profile(client):
    resp = client.get("/api/business-profile")
    assert resp.status_code == 200
    data = resp.json()
    assert "id" in data
    assert "name" in data or "business_name" in data

# ========================================
# 2. TRANSACTION CREATION TESTS
# ========================================

def test_add_single_transaction(client):
    resp = client.post("/api/transactions", json={
        "date": "2024-01-15",
        "amount": 25000,
        "transaction_type": "credit",
        "category": "Sales Revenue",
        "payment_method": "UPI",
        "description": "Test single transaction"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "transaction" in data
    assert data["transaction"]["amount"] == 25000

def test_add_invalid_amount_transaction(client):
    resp = client.post("/api/transactions", json={
        "date": "2024-01-15",
        "amount": -100,
        "transaction_type": "credit",
        "description": "Invalid negative amount"
    })
    assert resp.status_code == 400

# ========================================
# 3. CSV UPLOAD TESTS
# ========================================

def test_upload_json_transactions(client):
    payload = {"transactions": SAMPLE_TRANSACTIONS[:10]}
    resp = client.post("/api/upload-transactions",
                       content=b'{"transactions":[{"date":"2024-01-01","amount":30000,"transaction_type":"credit","payment_method":"UPI","description":"CSV test"}]}',
                       headers={"Content-Type": "application/json"})
    assert resp.status_code == 200
    data = resp.json()
    assert "transactions_saved" in data
    assert data["total_rows"] >= 1

def test_upload_csv_file(client):
    csv_content = b"date,amount,transaction_type,category,payment_method,description\n2024-02-01,45000,credit,Sales Revenue,UPI,CSV upload test\n2024-02-05,12000,debit,Inventory,Bank Transfer,Stock purchase"
    resp = client.post(
        "/api/upload-transactions",
        files={"file": ("test.csv", csv_content, "text/csv")}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_rows"] == 2
    assert data["valid_rows"] >= 1

def test_csv_invalid_rows_detected(client):
    csv_content = b"date,amount,transaction_type\n2024-02-01,50000,credit\n,INVALID,credit\n2024-02-10,-500,debit"
    resp = client.post(
        "/api/upload-transactions",
        files={"file": ("test_invalid.csv", csv_content, "text/csv")}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["invalid_rows"] >= 2

def test_duplicate_detection_in_csv(client):
    csv_content = b"date,amount,transaction_type,description\n2024-03-01,30000,credit,Duplicate row\n2024-03-01,30000,credit,Duplicate row"
    resp = client.post(
        "/api/upload-transactions",
        files={"file": ("test_dup.csv", csv_content, "text/csv")}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["duplicate_rows"] >= 1

# ========================================
# 4. REVENUE CALCULATION TESTS
# ========================================

def test_calculate_revenue_from_transactions():
    txns = [
        {"date": "2024-01-01", "amount": 50000, "transaction_type": "credit"},
        {"date": "2024-01-15", "amount": 40000, "transaction_type": "credit"},
        {"date": "2024-02-01", "amount": 60000, "transaction_type": "credit"},
    ]
    result = calculate_financial_metrics(txns)
    assert result["totalRevenue"] == pytest.approx(150000.0, rel=0.01)
    assert result["avgMonthlyRevenue"] > 0

def test_revenue_with_no_transactions():
    result = calculate_financial_metrics([])
    assert result["totalRevenue"] == 0
    assert result["avgMonthlyRevenue"] == 0

# ========================================
# 5. EXPENSE CALCULATION TESTS
# ========================================

def test_calculate_expenses():
    txns = [
        {"date": "2024-01-05", "amount": 20000, "transaction_type": "debit"},
        {"date": "2024-01-20", "amount": 15000, "transaction_type": "debit"},
        {"date": "2024-02-10", "amount": 25000, "transaction_type": "debit"},
    ]
    result = calculate_financial_metrics(txns)
    assert result["totalExpenses"] == pytest.approx(60000.0, rel=0.01)
    assert result["expenseRatio"] == 0  # No revenue

def test_expense_ratio_calculation():
    txns = [
        {"date": "2024-01-01", "amount": 100000, "transaction_type": "credit"},
        {"date": "2024-01-15", "amount": 80000, "transaction_type": "debit"},
    ]
    result = calculate_financial_metrics(txns)
    assert result["expenseRatio"] == pytest.approx(80.0, rel=0.01)

# ========================================
# 6. CASH FLOW CALCULATION TESTS
# ========================================

def test_cash_flow_calculation():
    txns = [
        {"date": "2024-01-01", "amount": 80000, "transaction_type": "credit"},
        {"date": "2024-01-10", "amount": 30000, "transaction_type": "debit"},
        {"date": "2024-02-01", "amount": 70000, "transaction_type": "credit"},
        {"date": "2024-02-15", "amount": 20000, "transaction_type": "debit"},
    ]
    result = calculate_financial_metrics(txns)
    assert result["netCashFlow"] == pytest.approx(100000.0, rel=0.01)
    assert result["positiveMonths"] == 2

def test_negative_cash_flow_detection():
    txns = [
        {"date": "2024-01-01", "amount": 20000, "transaction_type": "credit"},
        {"date": "2024-01-10", "amount": 40000, "transaction_type": "debit"},
    ]
    result = calculate_financial_metrics(txns)
    assert result["netCashFlow"] < 0
    assert result["positiveMonths"] == 0

# ========================================
# 7. SCORING ENGINE TESTS
# ========================================

GOOD_FINANCIALS = {
    "totalRevenue": 2400000.0,
    "totalExpenses": 1800000.0,
    "netCashFlow": 600000.0,
    "avgMonthlyRevenue": 400000.0,
    "avgMonthlyExpenses": 300000.0,
    "avgMonthlyCashFlow": 100000.0,
    "revenueGrowth": 12.0,
    "revenueConsistency": "High Consistency",
    "revenueCV": 0.12,
    "expenseRatio": 75.0,
    "expenseSpikes": [],
    "positiveMonths": 5,
    "negativeMonths": 1,
    "totalMonths": 6
}

GOOD_BEHAVIOUR = {
    "totalCount": 72,
    "creditCount": 48,
    "debitCount": 24,
    "avgTicketSize": 32000,
    "avgMonthlyFrequency": 12,
    "maxGapDays": 5,
    "gapAlerts": [],
    "paymentMix": [
        {"name": "UPI", "percent": 60, "count": 43, "color": "#3B82F6"},
        {"name": "Bank Transfer", "percent": 30, "count": 22, "color": "#10B981"},
        {"name": "Cash", "percent": 10, "count": 7, "color": "#F59E0B"}
    ]
}

GOOD_TRUST = {"status": "High Data Trust", "badgeType": "good", "score": 95, "duplicateCount": 0, "invalidCount": 0}
GOOD_STORY = {"status": "Consistent", "badgeType": "good", "variancePct": 8.5, "detail": "Consistent"}
GOOD_CROSS = {"isConsistent": True, "status": "Consistent Alignment", "badgeType": "good"}

def test_score_calculation_high_quality():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    assert result["score"] >= 65
    assert "breakdown" in result
    assert "pillars" in result
    assert len(result["pillars"]) == 6

def test_score_is_deterministic():
    s1 = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    s2 = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    assert s1["score"] == s2["score"]

# ========================================
# 8. RISK CATEGORIZATION TESTS
# ========================================

def test_risk_category_high_score():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    if result["score"] >= 80:
        assert result["riskLevel"] == "Low Risk"
    elif result["score"] >= 65:
        assert result["riskLevel"] == "Moderate Risk"

def test_risk_categories_exist():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    assert result["riskLevel"] in ["Low Risk", "Moderate Risk", "Moderate-High Risk", "High Risk"]

def test_prototype_disclaimer_present():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    assert "disclaimer" in result
    assert "prototype" in result["disclaimer"].lower()

# ========================================
# 9. SCORE EXPLANATION TESTS
# ========================================

def test_score_has_pillar_explanations():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    for pillar in result["pillars"]:
        assert "name" in pillar
        assert "score" in pillar
        assert "explanation" in pillar

def test_breakdown_sum_within_range():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    total_pts = sum(result["breakdown"].values())
    assert 10 <= total_pts <= 100

def test_positive_and_negative_drivers():
    result = calculate_creditworthiness_score(GOOD_FINANCIALS, GOOD_BEHAVIOUR, GOOD_TRUST, GOOD_STORY, GOOD_CROSS)
    assert isinstance(result["positiveDrivers"], list)
    assert isinstance(result["negativeDrivers"], list)
    assert len(result["positiveDrivers"]) > 0

# ========================================
# 10. ANALYSIS API ENDPOINT TESTS
# ========================================

def test_analyze_endpoint(client):
    resp = client.post("/api/analyze", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert "scoring" in data
    assert "financials" in data
    assert "summary" in data

def test_dashboard_endpoint(client):
    resp = client.get("/api/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data

def test_score_explanation_endpoint(client):
    resp = client.get("/api/score-explanation")
    assert resp.status_code == 200
    data = resp.json()
    assert "score" in data
    assert "pillars" in data

def test_credit_report_endpoint(client):
    resp = client.get("/api/credit-report")
    assert resp.status_code == 200
    data = resp.json()
    assert "reportId" in data
    assert "profile" in data
