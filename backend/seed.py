"""
CreditBridge Demo Seed Script
Creates a demo business and loads the sample transaction CSV into SQLite.
Run from backend/ directory: py seed.py
"""
import sys
import os
import csv
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from database import engine, Base, SessionLocal
from models import Business, Transaction, AnalysisResult

def seed():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if demo business already exists
        existing = db.query(Business).filter(Business.id == "biz_demo_shree").first()
        if existing:
            print("Demo business already seeded. Use DELETE from businesses WHERE id='biz_demo_shree' to reset.")
            return

        print("Creating demo business: Shree Retail Traders...")
        demo_biz = Business(
            id="biz_demo_shree",
            business_name="Shree Retail Traders",
            business_type="Retail & FMCG",
            location="Malleshwaram, Bengaluru, Karnataka",
            business_age="3+ years",
            employees="6",
            declared_monthly_revenue=420000.0,
            existing_monthly_emi=25000.0,
            primary_payment_method="UPI, Bank Transfer",
            created_at=datetime.utcnow()
        )
        db.add(demo_biz)
        db.commit()

        # Load sample CSV
        csv_path = os.path.join(os.path.dirname(__file__), "sample_data", "demo_transactions.csv")
        print(f"Loading transactions from: {csv_path}")

        count = 0
        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    amt = float(row.get("amount", 0) or 0)
                    if amt <= 0:
                        continue

                    t_type_raw = str(row.get("transaction_type", "credit")).lower()
                    t_type = "debit" if any(x in t_type_raw for x in ["deb", "exp"]) else "credit"

                    t_id = row.get("transaction_id", "").strip() or f"TXN-SEED-{uuid.uuid4().hex[:8].upper()}"
                    txn = Transaction(
                        id=t_id,
                        business_id="biz_demo_shree",
                        date=row.get("date", "").strip(),
                        amount=amt,
                        transaction_type=t_type,
                        category=row.get("category", "Sales Revenue").strip(),
                        payment_method=row.get("payment_method", "UPI").strip(),
                        description=row.get("description", "Demo transaction").strip(),
                        created_at=datetime.utcnow()
                    )
                    db.add(txn)
                    count += 1
                except Exception as e:
                    print(f"  Skipped row: {e}")

        db.commit()
        print(f"Successfully seeded {count} transactions.")

        # Run initial analysis pipeline
        print("Running initial analysis pipeline...")
        import json
        from services.financial_analysis import calculate_financial_metrics
        from services.transaction_analysis import calculate_transaction_behaviour
        from services.trust_analysis import analyze_data_trust, check_financial_story_consistency, evaluate_cross_signals
        from services.scoring_engine import calculate_creditworthiness_score

        raw_txns = [
            {
                "transaction_id": t.id,
                "date": t.date,
                "amount": t.amount,
                "transaction_type": t.transaction_type,
                "category": t.category,
                "payment_method": t.payment_method,
                "description": t.description
            }
            for t in db.query(Transaction).filter(Transaction.business_id == "biz_demo_shree").all()
        ]

        trust = analyze_data_trust(raw_txns)
        financials = calculate_financial_metrics(raw_txns)
        behaviour = calculate_transaction_behaviour(raw_txns)
        story = check_financial_story_consistency(420000.0, financials.get("avgMonthlyRevenue", 0.0))
        cross_signal = evaluate_cross_signals(financials, behaviour)
        scoring = calculate_creditworthiness_score(financials, behaviour, trust, story, cross_signal)

        result = AnalysisResult(
            id=f"RES-{uuid.uuid4().hex[:8].upper()}",
            business_id="biz_demo_shree",
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
            analysis_json=json.dumps({"scoring": scoring, "financials": financials}),
            created_at=datetime.utcnow()
        )
        db.add(result)
        db.commit()

        print(f"\n[OK] Seed complete!")
        print(f"   Business ID : biz_demo_shree")
        print(f"   Transactions: {count}")
        print(f"   Score       : {scoring['score']}/100")
        print(f"   Risk Level  : {scoring['riskLevel']}")
        print(f"\nStart backend: py -m uvicorn main:app --reload --port 8000")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
