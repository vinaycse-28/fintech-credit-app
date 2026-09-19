import os
import pytest
from fastapi.testclient import TestClient
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from database import get_db, SessionLocal
from models import User, Business, Transaction, AnalysisResult

client = TestClient(app)

def test_user_registration_and_hash():
    email = "testuser1@creditbridge.io"
    # Clean up if existing from previous test run
    db = SessionLocal()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    res = client.post("/api/auth/register", json={
        "full_name": "Vinay Kumar",
        "email": email,
        "password": "Password@123",
        "confirm_password": "Password@123"
    })
    assert res.status_code == 201, res.text
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    token = data["access_token"]

    # Verify password is NOT in plaintext in database
    db = SessionLocal()
    user_in_db = db.query(User).filter(User.email == email).first()
    assert user_in_db is not None
    assert user_in_db.password_hash != "Password@123"
    assert user_in_db.password_hash.startswith("$2")  # bcrypt prefix
    db.close()

def test_user_login():
    email = "testuser1@creditbridge.io"
    res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Vinay Kumar"

def test_auth_me():
    # Login to get token
    login_res = client.post("/api/auth/login", json={
        "email": "testuser1@creditbridge.io",
        "password": "Password@123"
    })
    token = login_res.json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "testuser1@creditbridge.io"

def test_business_creation_and_ownership():
    login_res = client.post("/api/auth/login", json={
        "email": "testuser1@creditbridge.io",
        "password": "Password@123"
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]

    biz_res = client.post(
        "/api/business-profile",
        json={
            "business_name": "Vinay Traders",
            "business_type": "Retail & FMCG",
            "location": "Hyderabad",
            "declared_monthly_revenue": 500000.0
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert biz_res.status_code == 201
    biz_id = biz_res.json()["business_id"]

    # Verify business belongs to user
    db = SessionLocal()
    biz = db.query(Business).filter(Business.id == biz_id).first()
    assert biz is not None
    assert biz.user_id == user_id
    db.close()

    # Verify GET /api/businesses lists it
    list_res = client.get("/api/businesses", headers={"Authorization": f"Bearer {token}"})
    assert list_res.status_code == 200
    businesses = list_res.json()["businesses"]
    biz_ids = [b["id"] for b in businesses]
    assert biz_id in biz_ids

def test_data_isolation_between_users():
    # User 1 creates KFC
    u1_login = client.post("/api/auth/login", json={
        "email": "testuser1@creditbridge.io",
        "password": "Password@123"
    })
    t1 = u1_login.json()["access_token"]

    kfc_res = client.post(
        "/api/business-profile",
        json={"business_name": "KFC Test", "business_type": "Food"},
        headers={"Authorization": f"Bearer {t1}"}
    )
    kfc_id = kfc_res.json()["business_id"]

    # User 2 registers
    u2_email = "testuser2@creditbridge.io"
    db = SessionLocal()
    existing2 = db.query(User).filter(User.email == u2_email).first()
    if existing2:
        db.delete(existing2)
        db.commit()
    db.close()

    u2_reg = client.post("/api/auth/register", json={
        "full_name": "Second User",
        "email": u2_email,
        "password": "Password@456",
        "confirm_password": "Password@456"
    })
    t2 = u2_reg.json()["access_token"]

    # User 2 cannot see User 1's KFC in GET /api/businesses
    u2_biz_res = client.get("/api/businesses", headers={"Authorization": f"Bearer {t2}"})
    u2_biz_ids = [b["id"] for b in u2_biz_res.json()["businesses"]]
    assert kfc_id not in u2_biz_ids

    # User 2 cannot access User 1's business directly -> 403 Forbidden
    forbidden_res = client.get(f"/api/business/{kfc_id}", headers={"Authorization": f"Bearer {t2}"})
    assert forbidden_res.status_code == 403

def test_score_simulator_no_persistence():
    # User 1 runs simulator on KFC
    u1_login = client.post("/api/auth/login", json={
        "email": "testuser1@creditbridge.io",
        "password": "Password@123"
    })
    t1 = u1_login.json()["access_token"]

    # First ensure the business has an analysis run
    client.post("/api/analyze", headers={"Authorization": f"Bearer {t1}"})

    db = SessionLocal()
    initial_analysis_count = db.query(AnalysisResult).count()
    db.close()

    sim_res = client.post(
        "/api/score-simulator",
        json={
            "revenue_change_pct": 15.0,
            "expense_change_pct": -5.0,
            "payment_consistency": 85.0,
            "transaction_consistency": 80.0
        },
        headers={"Authorization": f"Bearer {t1}"}
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "current_score" in sim_data
    assert "projected_score" in sim_data
    assert "what_changed" in sim_data
    assert "Simulation only" in sim_data["disclaimer"]

    # Verify no new AnalysisResult was persisted by simulation
    db = SessionLocal()
    assert db.query(AnalysisResult).count() == initial_analysis_count
    db.close()
