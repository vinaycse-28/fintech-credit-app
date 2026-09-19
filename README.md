# CreditBridge — Explainable MSME Credit Intelligence

> Hackathon Edition · Decision Support Only · Human-in-the-Loop

CreditBridge analyzes small-business transaction data and produces a deterministic, explainable **Creditworthiness Signal** from 0–100. Built as a full-stack prototype with a React/Vite frontend and a Python FastAPI backend.

---

## Architecture

```
React/Vite Frontend (Port 5173)
         ↓ HTTP REST
Python FastAPI Backend (Port 8000)
         ↓
Financial Analysis Engine (Python Services)
         ↓
SQLAlchemy ORM → SQLite (local) / PostgreSQL (production)
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Optional: seed demo data
py seed.py
# Start the server
py -m uvicorn main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
# From project root
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 3. Environment Variables

**Frontend** (`.env` in project root):
```
VITE_BACKEND_URL=http://localhost:8000
```

**Backend** (`.env` in `backend/` — optional):
```
DATABASE_URL=sqlite:///./creditbridge.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/business-profile` | Create/update business profile |
| `GET`  | `/api/business-profile/{id}` | Fetch business profile |
| `POST` | `/api/upload-transactions` | Upload CSV or JSON transaction data |
| `POST` | `/api/transactions` | Add single manual transaction |
| `GET`  | `/api/transactions/{id}` | Filterable, paginated transaction list |
| `POST` | `/api/analyze` | Run full analysis pipeline |
| `GET`  | `/api/dashboard/{id}` | Dashboard overview data |
| `GET`  | `/api/financial-analysis/{id}` | Monthly revenue, expenses, cash flow |
| `GET`  | `/api/transaction-behaviour/{id}` | Frequency, gaps, payment mix |
| `GET`  | `/api/trust-analysis/{id}` | Data trust & story consistency |
| `GET`  | `/api/score-explanation/{id}` | Explainable 100-point score breakdown |
| `GET`  | `/api/credit-report/{id}` | Full credit assessment memorandum |

---

## Scoring Model (Prototype)

The 100-point Creditworthiness Signal is computed deterministically from:

| Category | Max Points | Formula Basis |
|----------|-----------|---------------|
| Revenue Stability | 20 | Coefficient of Variation (CV) + growth momentum |
| Cash Flow Strength | 20 | Positive month ratio + net margin |
| Payment Behaviour | 15 | Digital channel adoption % (UPI + Bank Transfer) |
| Transaction Behaviour | 15 | Dormancy gap penalty + activity frequency |
| Financial Consistency | 15 | Declared vs observed revenue variance |
| Data Trust | 15 | Duplicate/invalid ledger checks |

### Risk Categories (Prototype)

| Score Range | Risk Level |
|------------|------------|
| 80–100 | Low Risk |
| 65–79 | Moderate Risk |
| 40–64 | Moderate-High Risk |
| 0–39 | High Risk |

> ⚠️ This is a **CreditBridge prototype classification**, NOT an official CIBIL/bank credit bureau score.

---

## Running Tests

```bash
cd backend
py -m pytest tests/test_backend.py -v
```

27 tests covering:
- Business profile creation
- Transaction CRUD & CSV validation
- Duplicate detection
- Revenue, expense & cash flow calculation
- Scoring engine (determinism, risk categorization, pillar explanations)
- API endpoint integration

---

## CSV Format

Upload transactions via CSV:

```csv
date,amount,transaction_type,category,payment_method,description
2024-01-05,45200,credit,Sales Revenue,UPI,Retail sales
2024-01-08,12000,debit,Inventory Purchase,Bank Transfer,Stock replenishment
```

- `transaction_type`: `credit` / `income` or `debit` / `expense`
- `payment_method`: `UPI`, `Bank Transfer`, `Cash`, or any string
- Minimum required columns: `date`, `amount`

Sample file: `backend/sample_data/demo_transactions.csv`

---

## Database Migration (SQLite → PostgreSQL)

Change `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL=postgresql://user:password@host:5432/creditbridge
```

No code changes required — SQLAlchemy abstracts the difference.

---

## Project Structure

```
hack/
├── src/                        # React/Vite Frontend (PRESERVED - not modified)
│   ├── components/
│   ├── services/
│   │   ├── api.js              # Modified: routes to FastAPI backend
│   │   ├── engine.js           # Kept: local fallback scoring engine
│   │   └── mockData.js         # Kept: demo business profiles
│   └── App.jsx
├── backend/                    # NEW: Python FastAPI Backend
│   ├── main.py                 # FastAPI app + CORS + router mounting
│   ├── database.py             # SQLAlchemy engine + session + Base
│   ├── models.py               # Business, Transaction, AnalysisResult ORM models
│   ├── schemas.py              # Pydantic request/response models
│   ├── seed.py                 # Demo data seeder
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Backend env template
│   ├── routes/
│   │   ├── business.py         # POST/GET /api/business-profile
│   │   ├── transactions.py     # POST/GET /api/transactions, /api/upload-transactions
│   │   ├── analysis.py         # POST /api/analyze + all GET analysis endpoints
│   │   └── reports.py          # GET /api/credit-report
│   ├── services/
│   │   ├── financial_analysis.py   # Revenue, expenses, cash flow, spikes, CV
│   │   ├── transaction_analysis.py # Frequency, gaps, payment mix, seasonality
│   │   ├── trust_analysis.py       # Data trust, story consistency, cross-signals
│   │   ├── scoring_engine.py       # 100-pt deterministic scoring + explanations
│   │   └── report_service.py       # Credit report memorandum generation
│   ├── sample_data/
│   │   └── demo_transactions.csv   # 66 synthetic transactions (6 months)
│   └── tests/
│       └── test_backend.py         # 27 pytest tests
├── .env                        # VITE_BACKEND_URL=http://localhost:8000
├── .env.example                # Frontend env template
└── README.md
```
