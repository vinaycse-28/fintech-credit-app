import os
import sys
import io
import csv
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from database import SessionLocal
from models import User, Business, Transaction, AnalysisResult

client = TestClient(app)

def test_complete_17_requirements():
    print("\n--- Starting Full 17-Test Acceptance Suite ---")

    # Clean up test users from any previous runs
    db = SessionLocal()
    for e in ["vinay_test@creditbridge.io", "other_test@creditbridge.io"]:
        u = db.query(User).filter(User.email == e).first()
        if u:
            db.delete(u)
    db.commit()
    db.close()

    # TEST 1: Register a new user
    print("TEST 1: Register a new user...")
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Vinay",
        "email": "vinay_test@creditbridge.io",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    })
    assert reg_res.status_code == 201, reg_res.text
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    token1 = reg_data["access_token"]
    user1_id = reg_data["user"]["id"]
    h1 = {"Authorization": f"Bearer {token1}"}

    # Verify password hash in SQLite
    db = SessionLocal()
    u1_db = db.query(User).filter(User.id == user1_id).first()
    assert u1_db is not None
    assert u1_db.password_hash != "SecurePassword123!"
    assert u1_db.password_hash.startswith("$2")
    db.close()
    print("[PASS] TEST 1: User registered with bcrypt hash.")

    # TEST 2: Login
    print("TEST 2: Login...")
    login_res = client.post("/api/auth/login", json={
        "email": "vinay_test@creditbridge.io",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    print("[PASS] TEST 2: Login returns JWT.")

    # TEST 3: Create KFC business
    print("TEST 3: Create KFC business...")
    kfc_create = client.post("/api/business-profile", json={
        "business_name": "KFC",
        "business_type": "Food & Restaurant",
        "location": "Hyderabad",
        "declared_monthly_revenue": 450000.0,
        "existing_monthly_emi": 15000.0
    }, headers=h1)
    assert kfc_create.status_code == 201
    kfc_id = kfc_create.json()["business_id"]

    db = SessionLocal()
    kfc_db = db.query(Business).filter(Business.id == kfc_id).first()
    assert kfc_db is not None
    assert kfc_db.user_id == user1_id
    assert kfc_db.business_name == "KFC"
    db.close()
    print("[PASS] TEST 3: KFC business created and owned by user1.")

    # TEST 4: Upload synthetic transaction CSV
    print("TEST 4: Upload synthetic transaction CSV...")
    csv_rows = [
        "date,amount,transaction_type,category,payment_method,description\n",
        "2026-01-05,25000,credit,Sales,UPI,Daily sales\n",
        "2026-01-10,12000,debit,Supplies,Bank Transfer,Ingredients\n",
        "2026-01-15,30000,credit,Sales,UPI,Weekend sales\n",
        "2026-01-20,8000,debit,Utilities,UPI,Electricity\n",
        "2026-02-05,28000,credit,Sales,UPI,Daily sales\n",
        "2026-02-12,14000,debit,Supplies,Bank Transfer,Packaging\n",
        "2026-02-18,32000,credit,Sales,UPI,Weekend sales\n",
        "2026-02-25,9000,debit,Rent,Bank Transfer,Shop rent\n"
    ]
    csv_file = io.BytesIO("".join(csv_rows).encode("utf-8"))
    upload_res = client.post(
        "/api/upload-transactions",
        files={"file": ("test_txns.csv", csv_file, "text/csv")},
        data={"business_id": kfc_id},
        headers=h1
    )
    assert upload_res.status_code == 200, upload_res.text
    upload_data = upload_res.json()
    assert upload_data["valid_rows"] == 8
    assert upload_data["transactions_saved"] == 8
    print(f"[PASS] TEST 4: Uploaded {upload_data['transactions_saved']} valid transactions.")

    # TEST 5: Analyze
    print("TEST 5: Analyze...")
    analyze_res = client.post(f"/api/analyze?business_id={kfc_id}", headers=h1)
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    print("[PASS] TEST 5: Analysis executed successfully.")

    # TEST 6: Verify score
    print("TEST 6: Verify score...")
    score = analysis["scoring"]["score"]
    assert 0 <= score <= 100
    assert "breakdown" in analysis["scoring"]
    bd = analysis["scoring"]["breakdown"]
    assert "revenue_stability" in bd
    assert "cash_flow_strength" in bd
    assert "payment_behaviour" in bd
    assert "transaction_behaviour" in bd
    assert "financial_consistency" in bd
    assert "data_trust" in bd
    print(f"[PASS] TEST 6: Explainable score verified: {score}/100.")

    # TEST 7: Refresh browser (Call GET /api/auth/me, GET /api/businesses, GET /api/dashboard)
    print("TEST 7: Restore session (simulate refresh)...")
    me_res = client.get("/api/auth/me", headers=h1)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "vinay_test@creditbridge.io"

    biz_res = client.get("/api/businesses", headers=h1)
    assert biz_res.status_code == 200
    biz_ids = [b["id"] for b in biz_res.json()["businesses"]]
    assert kfc_id in biz_ids

    dash_res = client.get(f"/api/dashboard/{kfc_id}", headers=h1)
    assert dash_res.status_code == 200
    assert dash_res.json()["creditworthiness_score"] == score
    print("[PASS] TEST 7: Same user, same business, same analysis restored.")

    # TEST 8: Restart FastAPI simulation (check SQLite direct read)
    print("TEST 8: Direct SQLite check (restart simulation)...")
    db = SessionLocal()
    kfc_check = db.query(Business).filter(Business.id == kfc_id).first()
    assert kfc_check is not None
    assert len(kfc_check.transactions) == 8
    assert len(kfc_check.analysis_results) >= 1
    db.close()
    print("[PASS] TEST 8: Data persists in SQLite.")

    # TEST 9: Logout (unauthenticated request)
    print("TEST 9: Logout & unauthenticated check...")
    unauth_res = client.get("/api/businesses")
    assert unauth_res.status_code == 401
    print("[PASS] TEST 9: Unauthenticated requests rejected with 401.")

    # TEST 10: Login again
    print("TEST 10: Login again...")
    relogin_res = client.post("/api/auth/login", json={
        "email": "vinay_test@creditbridge.io",
        "password": "SecurePassword123!"
    })
    assert relogin_res.status_code == 200
    h1 = {"Authorization": f"Bearer {relogin_res.json()['access_token']}"}
    biz_res = client.get("/api/businesses", headers=h1)
    assert kfc_id in [b["id"] for b in biz_res.json()["businesses"]]
    print("[PASS] TEST 10: Re-login successful; KFC still exists.")

    # TEST 11: Create second business
    print("TEST 11: Create Vinay Traders (second business)...")
    vt_res = client.post("/api/business-profile", json={
        "business_name": "Vinay Traders",
        "business_type": "Retail",
        "location": "Hyderabad",
        "declared_monthly_revenue": 600000.0
    }, headers=h1)
    assert vt_res.status_code == 201
    vt_id = vt_res.json()["business_id"]

    both_biz_res = client.get("/api/businesses", headers=h1)
    both_ids = [b["id"] for b in both_biz_res.json()["businesses"]]
    assert kfc_id in both_ids
    assert vt_id in both_ids
    print(f"[PASS] TEST 11: Both businesses visible under My Businesses ({len(both_ids)} total).")

    # TEST 12: Switch between businesses
    print("TEST 12: Switch between businesses...")
    kfc_dash = client.get(f"/api/dashboard/{kfc_id}", headers=h1).json()
    vt_dash = client.get(f"/api/dashboard/{vt_id}", headers=h1).json()
    assert kfc_dash["profile"]["name"] == "KFC"
    assert vt_dash["profile"]["name"] == "Vinay Traders"
    print("[PASS] TEST 12: Correct isolated dashboard for each business.")

    # TEST 13: Create second user & verify data isolation
    print("TEST 13: Second user data isolation...")
    u2_reg = client.post("/api/auth/register", json={
        "full_name": "Other User",
        "email": "other_test@creditbridge.io",
        "password": "AnotherPassword456!",
        "confirm_password": "AnotherPassword456!"
    })
    assert u2_reg.status_code == 201
    h2 = {"Authorization": f"Bearer {u2_reg.json()['access_token']}"}

    u2_businesses = client.get("/api/businesses", headers=h2).json()["businesses"]
    u2_biz_ids = [b["id"] for b in u2_businesses]
    assert kfc_id not in u2_biz_ids
    assert vt_id not in u2_biz_ids

    # User 2 attempts to access KFC directly -> 403 Forbidden
    kfc_forbidden = client.get(f"/api/business/{kfc_id}", headers=h2)
    assert kfc_forbidden.status_code == 403
    print("[PASS] TEST 13: Second user cannot see or access first user's businesses (403 Forbidden).")

    # TEST 14: Upload same CSV twice -> duplicate detection
    print("TEST 14: Upload same CSV twice...")
    csv_file2 = io.BytesIO("".join(csv_rows).encode("utf-8"))
    upload_dups = client.post(
        "/api/upload-transactions",
        files={"file": ("test_txns.csv", csv_file2, "text/csv")},
        data={"business_id": kfc_id},
        headers=h1
    )
    assert upload_dups.status_code == 200
    dup_data = upload_dups.json()
    assert dup_data["duplicate_rows"] == 8
    assert dup_data["transactions_saved"] == 0
    print("[PASS] TEST 14: Duplicate transactions detected and rejected (0 inserted).")

    # TEST 15: Run score simulator
    print("TEST 15: Run score simulator...")
    sim_res = client.post("/api/score-simulator", json={
        "business_id": kfc_id,
        "revenue_change_pct": 20.0,
        "expense_change_pct": -10.0,
        "payment_consistency": 90.0,
        "transaction_consistency": 85.0
    }, headers=h1)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "current_score" in sim_data
    assert "projected_score" in sim_data
    assert "what_changed" in sim_data

    # Verify real score in DB is unchanged
    kfc_dash_after_sim = client.get(f"/api/dashboard/{kfc_id}", headers=h1).json()
    assert kfc_dash_after_sim["creditworthiness_score"] == score
    print("[PASS] TEST 15: Simulator works without modifying real score or data.")

    # TEST 16: Open Credit Report
    print("TEST 16: Open Credit Report...")
    report_res = client.get(f"/api/credit-report/{kfc_id}", headers=h1)
    assert report_res.status_code == 200
    rep = report_res.json()
    assert rep["profile"]["name"] == "KFC"
    assert "financialStory" in rep
    assert "anomalies" in rep
    assert "loanReadiness" in rep
    print("[PASS] TEST 16: Credit Report contains all extended fields.")

    # TEST 17: Refresh Credit Report URL
    print("TEST 17: Refresh Credit Report URL...")
    rep_refresh = client.get(f"/api/credit-report/{kfc_id}", headers=h1)
    assert rep_refresh.status_code == 200
    assert rep_refresh.json()["profile"]["name"] == "KFC"
    print("[PASS] TEST 17: Credit Report reloads consistently.")

    print("\n========================================================")
    print(" ALL 17 ACCEPTANCE TESTS SUCCESSFULLY PASSED!")
    print("========================================================\n")

if __name__ == "__main__":
    test_complete_17_requirements()
