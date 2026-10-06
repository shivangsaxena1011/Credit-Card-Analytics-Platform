# CreditIQ Analytics Platform

**CreditIQ Analytics** is an interactive, enterprise-grade **Credit Card Customer Analytics, Segmentation & Portfolio Insights Platform** inspired by real-world commercial banking workflows.

It answers the core banking business question:

> *"Which customer segment should a bank target for a new credit-card campaign, and how do customer behaviors, credit risks, and spending profiles differ across cohorts?"*

---

## 1. System Architecture & Tech Stack

CreditIQ Analytics employs a unified **Single-Project Vercel Services Architecture**:
1. **Python FastAPI Analytics Engine (Authoritative Source of Truth)**: Authoritative calculation engine powered by Pandas, NumPy, SciPy, and Statsmodels. Governs all data generation, dynamic quality auditing, deterministic preprocessing, customer profiling, credit risk analysis, transaction analytics, cohort segmentation, multi-criteria target ranking, automated insights, and executive reports.
2. **Next.js Frontend & Route Proxies**: Next.js 16 App Router interface communicating with the authoritative analytics engine through Vercel internal service bindings and edge rewrites, ensuring 100% calculation consistency and sub-second UI responsiveness.
3. **Unified Single-Project Vercel Deployment**: Frontend and backend are collocated in the same GitHub repository and deploy together in one Vercel project using Vercel Services (`vercel.json`), completely eliminating the need for external backend hosts like Render.

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend Analytics Engine**: Python 3.11+, FastAPI, Pandas, NumPy, SciPy, Statsmodels.
- **Data Lifecycle**: Fully in-memory, deterministic pseudo-random seed generation, relational consistency checks, and dynamic data cleaning.
- **Deployment**: Single Vercel Project via Vercel Services (`vercel.json`).

---

## 2. Directory Structure

```
Credit Card Analysis/
├── backend/
│   ├── analytics/
│   │   ├── credit_analysis.py       # Credit score, limits, debt, Pearson correlation matrix
│   │   ├── customer_analysis.py     # Demographics, age, income distributions, scatter points
│   │   ├── data_generator.py        # Generates Customers (~1k), Credit (~1k), Txns (~65k)
│   │   ├── data_loader.py           # In-memory lifecycle store, filters, CSV exporter
│   │   ├── data_quality.py          # Quality score (0-100%), issue auditing, anomaly detection
│   │   ├── insights.py              # Automated findings by domain & executive decision panel
│   │   ├── preprocessing.py         # Deterministic cleaning pipeline with before/after statistics
│   │   ├── report_generator.py      # Structured report compiler & printable HTML document
│   │   ├── segmentation.py          # Configurable age cohort clustering & comparative benchmarking
│   │   └── target_scoring.py        # Multi-criteria weighted scoring engine & dynamic narrative
│   ├── tests/
│   │   └── test_analytics.py        # Pytest test suite asserting cleaning, scores & segmentation
│   ├── main.py                      # FastAPI application with typed schemas, dual-mounted endpoints
│   └── requirements.txt             # Backend Python dependencies
├── docs/
│   └── ANALYTICS_METHODOLOGY.md     # Detailed statistical & data preprocessing methodology
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                 # Next.js App Router API route handlers
│   │   │   │   ├── clean/
│   │   │   │   ├── credit/
│   │   │   │   ├── customers/
│   │   │   │   ├── data-explorer/
│   │   │   │   ├── data-quality/
│   │   │   │   ├── export-csv/[table]/
│   │   │   │   ├── export-report/
│   │   │   │   ├── health/
│   │   │   │   ├── insights/
│   │   │   │   ├── overview/
│   │   │   │   ├── pipeline-status/
│   │   │   │   ├── reset-data/
│   │   │   │   ├── segments/
│   │   │   │   ├── target-segment-analysis/
│   │   │   │   └── transactions/
│   │   │   ├── globals.css          # Tailwind CSS v4 banking theme
│   │   │   ├── layout.tsx           # Typography & layout wrapper
│   │   │   └── page.tsx             # Main client page, state management, and tab router
│   │   ├── components/
│   │   │   ├── Header.tsx           # Pipeline badges, filter trigger, load demo dataset
│   │   │   ├── Sidebar.tsx          # Domain navigation sections & dataset health indicator
│   │   │   ├── GlobalFilterModal.tsx# Comprehensive multi-field filter modal
│   │   │   └── views/
│   │   │       ├── DashboardView.tsx          # Executive overview & visual workflow pipeline
│   │   │       ├── DataOverviewView.tsx       # Top KPIs & multi-domain distributions
│   │   │       ├── DataQualityView.tsx        # Dynamic quality score & Before/After audit table
│   │   │       ├── CustomerAnalyticsView.tsx  # Demographics, income by occupation, scatter
│   │   │       ├── CreditAnalyticsView.tsx    # Credit score, utilization, Pearson matrix
│   │   │       ├── TransactionAnalyticsView.tsx# Spend trend, category x payment cross-tabs
│   │   │       ├── SegmentationView.tsx       # Configurable age groups & 11-dimension table
│   │   │       ├── TargetSegmentView.tsx      # Weight tuning sliders & dynamic narrative
│   │   │       ├── InsightsView.tsx           # Automated findings & executive decision panel
│   │   │       ├── DataExplorerView.tsx       # Row inspection, search, sorting, pagination
│   │   │       ├── ExportReportView.tsx       # Full report preview, PDF print, CSV downloads
│   │   │       └── SettingsView.tsx           # Seed configuration & dataset reset
│   │   ├── lib/
│   │   │   └── backendProxy.ts      # Vercel service binding & internal proxy resolver
│   │   ├── services/
│   │   │   └── api.ts               # Universal client API service
│   │   └── types/
│   │       └── analytics.ts         # TypeScript interfaces across all data models
│   ├── package.json
│   └── tsconfig.json
├── package.json                     # Root monorepo scripts
├── requirements.txt                 # Root Python requirements for Vercel
├── vercel.json                      # Single-project Vercel Services configuration
└── README.md
```

---

## 3. How to Deploy to Vercel (Single Project)

Deploying CreditIQ Analytics requires **only one Vercel deployment** with zero external backend services:

1. Import the repository `https://github.com/shivangsaxena1011/Credit-Card-Analytics-Platform` on [Vercel](https://vercel.com).
2. Leave the **Root Directory** as `./` (the root of the repository).
3. Vercel automatically detects the `vercel.json` configuration:
   - The `frontend` service builds the Next.js application from `frontend/`.
   - The `backend` service runs the FastAPI analytics engine from `backend/main.py`.
   - Vercel injects the internal `BACKEND_URL` service binding directly into the frontend.
   - Public requests to `/api/*` are seamlessly routed to the FastAPI backend.
4. Click **Deploy**.

No Render account, separate server, or manual environment variable configuration is required!

---

## 4. How to Run Locally

### 1. Start the FastAPI Backend:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Swagger documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Start the Next.js Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. In local development, the Next.js proxy forwards requests directly to `http://127.0.0.1:8000`.

### 3. Run Backend Test Suite:
```bash
python -m pytest backend/tests/test_analytics.py -v
```
All data generation, dynamic quality scoring, credit utilization consistency checks, and segmentation tests will execute and pass.

---

## 5. Analytical Pipeline Stages

The platform tracks and presents an end-to-end 5-stage banking analytics pipeline:
1. **RAW DATA**: Ingestion of customer demographics (~1,000), credit profiles (~1,000 + duplicates), and transactions (~65,000).
2. **VALIDATED**: Controlled data quality audit identifying missing income, out-of-range ages, duplicate credit accounts, debt-limit violations, and anomalies.
3. **CLEANED**: Deterministic cleaning preserving raw records while generating transformed datasets (occupation-wise median imputation, credit score bracket limit filling, ceiling debt capping, and context-aware median transaction imputation).
4. **ANALYZED**: Multi-domain calculations (Customer demographics, credit risk, Pearson correlation matrix, transaction cross-tabs).
5. **SEGMENTED**: User-configurable clustering (Young Adults 18–25, Prime Working 26–48, Mature 49–65+) calculating 11 comparative financial benchmarks and multi-criteria target rankings.

---

## 6. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, engine identifier, and dataset counts |
| `GET` | `/api/pipeline-status` | Operational status of all pipeline stages |
| `GET` | `/api/data-quality` | Dynamic data quality score, issue inventory, and breakdown |
| `POST` | `/api/clean` | Executes cleaning pipeline and returns before/after stats |
| `POST` | `/api/overview` | Filterable portfolio overview KPIs and distribution charts |
| `POST` | `/api/customers` | Demographic profiling and income distributions |
| `POST` | `/api/credit` | Credit score tiers, limit exposure, and Pearson correlation matrix |
| `POST` | `/api/transactions` | Transaction volume trends, category shares, and payment cross-tabs |
| `POST` | `/api/segments` | Configurable age cohort clustering and comparative metrics |
| `POST` | `/api/target-segment-analysis` | Multi-criteria weighted scoring engine and dynamic narrative |
| `POST` | `/api/insights` | Automated domain findings and executive decision panel |
| `POST` | `/api/export-report` | Full executive report assembly and printable HTML format |
| `POST` | `/api/data-explorer` | Paginated row inspection with search and sorting |
| `GET` | `/api/export-csv/{table}` | Downloadable CSV file for any raw or cleaned dataset |
| `POST` | `/api/reset-data` | Re-initializes synthetic dataset with a configurable seed |

---

## 7. License
MIT License. Developed for Commercial Banking Customer Analytics & Segmentation.
