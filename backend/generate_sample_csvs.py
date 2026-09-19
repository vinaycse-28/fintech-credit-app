import csv
import os
from datetime import datetime, timedelta

out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_csvs")
os.makedirs(out_dir, exist_ok=True)

# 1. Shree Retail Traders - Stable (8 months: Jan 2026 - Aug 2026)
shree_rows = []
base_date = datetime(2026, 1, 3)
shree_monthly_inflows = [445000, 432000, 460000, 451000, 468000, 455000, 472000, 485000]
shree_monthly_outflows = [340000, 335000, 352000, 348000, 360000, 350000, 365000, 370000]

txn_counter = 1
for m_idx in range(8):
    m_start = datetime(2026, m_idx + 1, 2)
    # Credits: ~10 transactions per month totaling monthly inflow
    inflow_target = shree_monthly_inflows[m_idx]
    in_chunk = inflow_target // 10
    for i in range(10):
        t_date = m_start + timedelta(days=i*2 + 1)
        shree_rows.append({
            "transaction_id": f"SHREE-{txn_counter:04d}",
            "date": t_date.strftime("%Y-%m-%d"),
            "amount": in_chunk + (i * 850 if i % 2 == 0 else -i * 620),
            "transaction_type": "credit",
            "payment_method": "UPI" if i < 7 else ("Bank Transfer" if i < 9 else "Cash"),
            "category": "Sales Revenue",
            "description": f"Daily store sales and customer collections #{txn_counter}"
        })
        txn_counter += 1

    # Debits: ~5 transactions per month totaling monthly outflow
    outflow_target = shree_monthly_outflows[m_idx]
    out_chunk = outflow_target // 5
    categories = ["Inventory Purchase", "Staff Payroll", "Rent & Utilities", "Supplier Settlement", "Operational Expenses"]
    methods = ["Bank Transfer", "Bank Transfer", "Bank Transfer", "UPI", "Cash"]
    for j in range(5):
        t_date = m_start + timedelta(days=j*5 + 2)
        shree_rows.append({
            "transaction_id": f"SHREE-{txn_counter:04d}",
            "date": t_date.strftime("%Y-%m-%d"),
            "amount": out_chunk + (j * 1200 if j % 2 == 0 else -j * 900),
            "transaction_type": "debit",
            "payment_method": methods[j],
            "category": categories[j],
            "description": f"Operational disbursement: {categories[j]}"
        })
        txn_counter += 1

shree_path = os.path.join(out_dir, "01_shree_retail_stable.csv")
with open(shree_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["transaction_id", "date", "amount", "transaction_type", "payment_method", "category", "description"])
    writer.writeheader()
    writer.writerows(shree_rows)
print(f"Generated {len(shree_rows)} rows -> {shree_path}")

# 2. Urban Foods - High Growth (Accelerating turnover from 280k to 490k, 90%+ UPI)
urban_rows = []
urban_inflows = [280000, 310000, 345000, 390000, 420000, 460000, 490000]
urban_outflows = [200000, 220000, 240000, 275000, 295000, 320000, 345000]

txn_counter = 1
for m_idx in range(7):
    m_start = datetime(2026, m_idx + 1, 1)
    inflow_target = urban_inflows[m_idx]
    in_chunk = inflow_target // 12
    for i in range(12):
        t_date = m_start + timedelta(days=i*2 + 1)
        urban_rows.append({
            "transaction_id": f"URB-{txn_counter:04d}",
            "date": t_date.strftime("%Y-%m-%d"),
            "amount": in_chunk + (i * 600 if i % 2 == 0 else -i * 450),
            "transaction_type": "credit",
            "payment_method": "UPI",
            "category": "Sales Revenue",
            "description": f"Cloud kitchen delivery order payout via aggregator #{txn_counter}"
        })
        txn_counter += 1

    outflow_target = urban_outflows[m_idx]
    out_chunk = outflow_target // 4
    categories = ["Inventory Purchase", "Staff Payroll", "Rent & Utilities", "Operational Expenses"]
    for j in range(4):
        t_date = m_start + timedelta(days=j*6 + 3)
        urban_rows.append({
            "transaction_id": f"URB-{txn_counter:04d}",
            "date": t_date.strftime("%Y-%m-%d"),
            "amount": out_chunk,
            "transaction_type": "debit",
            "payment_method": "Bank Transfer" if j < 2 else "UPI",
            "category": categories[j],
            "description": f"Kitchen operations: {categories[j]}"
        })
        txn_counter += 1

urban_path = os.path.join(out_dir, "02_urban_foods_high_growth.csv")
with open(urban_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["transaction_id", "date", "amount", "transaction_type", "payment_method", "category", "description"])
    writer.writeheader()
    writer.writerows(urban_rows)
print(f"Generated {len(urban_rows)} rows -> {urban_path}")

# 3. Metro Electronics - Elevated Risk (CV > 0.45, Month 4 massive expense spike, 18-day gap in April)
metro_rows = []
metro_inflows = [520000, 290000, 610000, 240000, 480000, 190000]
metro_outflows = [390000, 310000, 420000, 890000, 360000, 280000] # Month 4 inventory spike: 890k!

txn_counter = 1
for m_idx in range(6):
    m_start = datetime(2026, m_idx + 1, 1)
    
    # In Month 4 (April), we intentionally create an 18-day gap between April 4 and April 23
    if m_idx == 3: # Month 4
        # Early month transaction
        metro_rows.append({
            "transaction_id": f"METRO-{txn_counter:04d}",
            "date": "2026-04-03",
            "amount": 110000,
            "transaction_type": "credit",
            "payment_method": "Cash",
            "category": "Sales Revenue",
            "description": "Counter component retail repair batch"
        })
        txn_counter += 1
        # Massive expense spike on April 4
        metro_rows.append({
            "transaction_id": f"METRO-{txn_counter:04d}",
            "date": "2026-04-04",
            "amount": 780000,
            "transaction_type": "debit",
            "payment_method": "Bank Transfer",
            "category": "Inventory Purchase",
            "description": "Emergency bulk display panel & chip import inventory"
        })
        txn_counter += 1
        
        # 18-DAY DORMANCY GAP: Next txn is on April 23
        metro_rows.append({
            "transaction_id": f"METRO-{txn_counter:04d}",
            "date": "2026-04-23",
            "amount": 130000,
            "transaction_type": "credit",
            "payment_method": "UPI",
            "category": "Sales Revenue",
            "description": "Resumed shop sales post disruption"
        })
        txn_counter += 1
        metro_rows.append({
            "transaction_id": f"METRO-{txn_counter:04d}",
            "date": "2026-04-26",
            "amount": 110000,
            "transaction_type": "debit",
            "payment_method": "Cash",
            "category": "Staff Payroll",
            "description": "Staff delayed compensation"
        })
        txn_counter += 1
        continue

    # Other months: irregular chunks with high cash mix
    inflow_target = metro_inflows[m_idx]
    in_chunk = inflow_target // 5
    for i in range(5):
        t_date = m_start + timedelta(days=i*5 + 2)
        metro_rows.append({
            "transaction_id": f"METRO-{txn_counter:04d}",
            "date": t_date.strftime("%Y-%m-%d"),
            "amount": in_chunk + (i * 5000 if i % 2 == 0 else -i * 4000),
            "transaction_type": "credit",
            "payment_method": "Cash" if i < 3 else "UPI",
            "category": "Sales Revenue",
            "description": f"Customer hardware repair and accessory sale #{txn_counter}"
        })
        txn_counter += 1

    outflow_target = metro_outflows[m_idx]
    out_chunk = outflow_target // 3
    for j in range(3):
        t_date = m_start + timedelta(days=j*8 + 4)
        metro_rows.append({
            "transaction_id": f"METRO-{txn_counter:04d}",
            "date": t_date.strftime("%Y-%m-%d"),
            "amount": out_chunk,
            "transaction_type": "debit",
            "payment_method": "Bank Transfer" if j == 0 else "Cash",
            "category": "Inventory Purchase" if j == 0 else "Operational Expenses",
            "description": f"Vendor settlement: spare parts & overheads"
        })
        txn_counter += 1

metro_path = os.path.join(out_dir, "03_metro_electronics_elevated_risk.csv")
with open(metro_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["transaction_id", "date", "amount", "transaction_type", "payment_method", "category", "description"])
    writer.writeheader()
    writer.writerows(metro_rows)
print(f"Generated {len(metro_rows)} rows -> {metro_path}")

# 4. Data Trust Anomaly / Synthetic Integrity Test (Duplicates + Repeated Cluster + Future Date)
anomaly_rows = [
    {"transaction_id": "TAMPER-001", "date": "2026-02-01", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Customer purchase"},
    {"transaction_id": "TAMPER-002", "date": "2026-02-03", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Suspicious identical sum #1"},
    {"transaction_id": "TAMPER-003", "date": "2026-02-05", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Suspicious identical sum #2"},
    {"transaction_id": "TAMPER-004", "date": "2026-02-08", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Suspicious identical sum #3"},
    {"transaction_id": "TAMPER-005", "date": "2026-02-10", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Suspicious identical sum #4"},
    # Duplicate ID and Row
    {"transaction_id": "TAMPER-001", "date": "2026-02-01", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Customer purchase"},
    # Future timestamp
    {"transaction_id": "TAMPER-006", "date": "2030-05-15", "amount": 75000, "transaction_type": "credit", "payment_method": "Bank Transfer", "category": "Sales Revenue", "description": "Impossible future date txn"},
    {"transaction_id": "TAMPER-007", "date": "2026-02-12", "amount": 18000, "transaction_type": "debit", "payment_method": "Cash", "category": "Rent & Utilities", "description": "Shop rent payment"},
    {"transaction_id": "TAMPER-008", "date": "2026-02-18", "amount": 22000, "transaction_type": "debit", "payment_method": "Bank Transfer", "category": "Supplier Settlement", "description": "Vendor bill settlement"},
    {"transaction_id": "TAMPER-009", "date": "2026-02-24", "amount": 50000, "transaction_type": "credit", "payment_method": "UPI", "category": "Sales Revenue", "description": "Suspicious identical sum #5"}
]
anomaly_path = os.path.join(out_dir, "04_data_trust_anomaly_flagged.csv")
with open(anomaly_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["transaction_id", "date", "amount", "transaction_type", "payment_method", "category", "description"])
    writer.writeheader()
    writer.writerows(anomaly_rows)
print(f"Generated {len(anomaly_rows)} rows -> {anomaly_path}")
