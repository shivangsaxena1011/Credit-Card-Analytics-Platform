# CreditIQ Analytics Platform

**CreditIQ Analytics** is an interactive, enterprise-grade **Credit Card Customer Analytics, Segmentation & Statistical A/B Testing Platform** inspired by real-world commercial banking workflows.

It answers the core banking business question:

> *"Which customer segment should a bank target for a new credit-card campaign, and did the campaign produce a statistically significant improvement?"*

---

## 1. System Architecture & Tech Stack

CreditIQ Analytics features a **Dual-Engine Architecture**:
1. **Next.js Serverless Engine (Vercel Native)**: Complete analytical algorithms implemented in TypeScript inside Next.js App Router API routes (`/api/...`) enabling 100% serverless, zero-maintenance deployment on Vercel.
2. **Python FastAPI Engine (Local/Enterprise)**: Full data science engine with Pandas, NumPy, SciPy, and Statsmodels for local verification and automated pytest test suites.

```
                   ┌──────────────────────────────────────────────┐
                   │               Next.js Frontend               │
                   │  React 19 • TypeScript • Tailwind v4 • Recharts│
                   │         Interactive Dashboards & Controls     │
                   └──────────────────────┬───────────────────────┘
                                          │
                   ┌──────────────────────┴───────────────────────┐
                   │               Dual-Engine API                │
                   │  Next.js App Router (Vercel Serverless)     │
                   │  OR FastAPI (Python 3.14 + SciPy + Pandas)   │
                   └──────────────────────┬───────────────────────┘
                                          │
                   ┌──────────────────────┴───────────────────────┐
                   │         In-Memory Store & Life-Cycle         │
                   │  Synthetic Data Generator (Controlled Dirty) │
                   │  Deterministic Pipeline (Before/After Audit) │
                   └──────────────────────────────────────────────┘
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend Analytics Engine**: Python 3.14, FastAPI, Pandas, NumPy, SciPy, Statsmodels.
- **TypeScript Analytics Engine**: 1:1 mathematical parity with SciPy and Statsmodels (exact Student's t distributions, normal inverse CDF, Welch's t-test, two-sample Z-test, MCDA scoring).
- **Deployment**: 100% Vercel-ready with zero external database dependencies.

---

## 2. Directory Structure

```
Credit Card Analysis/
├── backend/
│   ├── analytics/
│   │   ├── credit_analysis.py       # Credit score, limits, debt, Pearson correlation matrix
│   │   ├── customer_analysis.py     # Demographics, age, income distributions, scatter points
│   │   ├── data_generator.py        # Generates Customers (~1k), Credit (~1k), Txns (~65k), A/B test
│   │   ├── data_loader.py           # In-memory lifecycle store, filters, CSV exporter
│   │   ├── data_quality.py          # Quality score (0-100%), issue auditing, anomaly detection
│   │   ├── experiment.py            # A/B testing descriptive stats, daily trends, lift calculation
│   │   ├── hypothesis_testing.py    # Two-sample Z-test & t-test, rejection regions, plain-English text
│   │   ├── insights.py              # Automated findings by domain & executive decision panel
│   │   ├── power_analysis.py        # Statsmodels TTestIndPower, sensitivity grid, sample curves
│   │   ├── preprocessing.py         # Deterministic cleaning pipeline with before/after statistics
│   │   ├── report_generator.py      # Structured report compiler & printable HTML document
│   │   ├── segmentation.py          # Configurable age cohort clustering & comparative benchmarking
│   │   └── target_scoring.py        # Multi-criteria weighted scoring engine & dynamic narrative
│   ├── tests/
│   │   └── test_analytics.py        # Pytest test suite verifying statistics against SciPy/Statsmodels
│   ├── main.py                      # FastAPI application with typed schemas and endpoints
│   └── requirements.txt             # Backend dependencies
├── docs/
│   └── ANALYTICS_METHODOLOGY.md     # Detailed statistical & data preprocessing methodology
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                 # Next.js App Router API endpoints for Vercel deployment
│   │   │   │   ├── clean/
│   │   │   │   ├── credit/
│   │   │   │   ├── customers/
│   │   │   │   ├── data-explorer/
│   │   │   │   ├── data-quality/
│   │   │   │   ├── experiment-summary/
│   │   │   │   ├── export-csv/[table]/
│   │   │   │   ├── export-report/
│   │   │   │   ├── health/
│   │   │   │   ├── hypothesis-test/
│   │   │   │   ├── insights/
│   │   │   │   ├── overview/
│   │   │   │   ├── pipeline-status/
│   │   │   │   ├── power-analysis/
│   │   │   │   ├── reset-data/
│   │   │   │   ├── segments/
│   │   │   │   ├── target-segment-analysis/
│   │   │   │   └── transactions/
│   │   │   ├── globals.css          # Tailwind CSS v4 banking theme
│   │   │   ├── layout.tsx           # Inter typography layout
│   │   │   └── page.tsx             # Main client page, state management, and tab router
│   │   ├── components/
│   │   │   ├── Header.tsx           # Pipeline badges, filter trigger, load demo dataset
│   │   │   ├── Sidebar.tsx          # 11 domain navigation sections & dataset health indicator
│   │   │   ├── GlobalFilterModal.tsx# Comprehensive multi-field filter modal
│   │   │   └── views/
│   │   │       ├── DashboardView.tsx          # Executive overview & visual workflow pipeline
│   │   │       ├── DataOverviewView.tsx       # Top KPIs & multi-domain distributions
│   │   │       ├── DataQualityView.tsx        # Quality score & Before/After audit table
│   │   │       ├── CustomerAnalyticsView.tsx  # Demographics, income by occupation, scatter
│   │   │       ├── CreditAnalyticsView.tsx    # Credit score, utilization, Pearson matrix
│   │   │       ├── TransactionAnalyticsView.tsx# Spend trend, category x payment cross-tabs
│   │   │       ├── SegmentationView.tsx       # Configurable age groups & 11-dimension table
│   │   │       ├── TargetSegmentView.tsx      # Weight tuning sliders & dynamic narrative
│   │   │       ├── CampaignExperimentView.tsx # A/B testing stats, lift & daily progression
│   │   │       ├── PowerAnalysisView.tsx      # Dynamic power calculator & sensitivity grid
│   │   │       ├── HypothesisTestingView.tsx  # Z/t-tests with shaded rejection region chart
│   │   │       ├── InsightsView.tsx           # Automated findings & executive decision panel
│   │   │       ├── DataExplorerView.tsx       # Row inspection, search, sorting, pagination
│   │   │       ├── ExportReportView.tsx       # Full report preview, PDF print, CSV downloads
│   │   │       └── SettingsView.tsx           # Seed configuration & dataset reset
│   │   ├── lib/
│   │   │   └── analytics/           # Standalone TypeScript statistical and simulation engine
│   │   ├── services/
│   │   │   └── api.ts               # Universal API client (Next.js serverless or FastAPI)
│   │   └── types/
│   │       └── analytics.ts         # TypeScript interfaces across all data models
│   ├── package.json
│   └── tsconfig.json
├── package.json                     # Monorepo scripts
├── vercel.json                      # Vercel deployment configuration
└── README.md
```

---

## 3. How to Deploy on Vercel

The application is pre-configured to deploy seamlessly to Vercel without requiring an external backend or database.

### Option A: 1-Click Import from GitHub
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import the repository: `https://github.com/shivangsaxena1011/Credit-Card-Analytics-Platform`.
4. Vercel automatically detects Next.js via the root `vercel.json` and `package.json`.
5. Click **Deploy**.

*(Optional: If importing without root `vercel.json`, simply set **Root Directory** to `frontend` in Project Settings).*

---

## 4. How to Run Locally

### Option 1: Standalone Next.js Serverless (No Python Required)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. All analytics, cleaning, segmentation, A/B testing, and exports run immediately in Next.js!

### Option 2: Full Dual-Stack (Next.js + Python FastAPI Backend)
1. **Start the FastAPI backend**:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

2. **Start the Frontend with backend proxy**:
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

3. **Run Statistical Test Suite**:
```bash
python -m pytest backend/tests/test_analytics.py -v
```
All 8 statistical and pipeline tests will assert against exact SciPy / Statsmodels formulas.

---

## 5. Analytical Pipeline Stages

The platform tracks and presents an end-to-end 7-stage banking analytics pipeline:
1. **RAW DATA**: Ingestion of customer demographics (~1,000), credit profiles (~1,000 + duplicates), transactions (~65,000), and randomized trial records (~2,800).
2. **VALIDATED**: Controlled data quality audit identifying missing income, out-of-range ages, duplicate credit accounts, debt-limit violations, zero transactions, and IQR extreme anomalies.
3. **CLEANED**: Deterministic cleaning preserving raw records while generating pristine transformed datasets (occupation-wise median imputation, credit score bracket limit filling, ceiling debt capping, and context-aware median transaction imputation).
4. **ANALYZED**: Multi-domain calculations (Customer demographics, credit risk, Pearson correlation matrix, transaction cross-tabs).
5. **SEGMENTED**: User-configurable clustering (18–25, 26–48, 49–65+) calculating 11 comparative financial benchmarks.
6. **EXPERIMENT READY**: Pre-experiment power sizing and A/B test partitioning.
7. **TESTED**: Formal hypothesis testing (Z-test / Welch's t-test), critical region visualization, confidence intervals, and dynamic plain-English interpretations.

---

## 6. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and dataset counts |
| `GET` | `/api/pipeline-status` | Operational status of all 7 pipeline stages |
| `GET` | `/api/data-quality` | Data quality score, issue inventory, and breakdown |
| `POST` | `/api/clean` | Executes cleaning pipeline and returns before/after stats |
| `POST` | `/api/overview` | Filterable portfolio overview KPIs and distribution charts |
| `POST` | `/api/customers` | Demographic profiling and income distributions |
| `POST` | `/api/credit` | Credit score tiers, limit exposure, and Pearson correlation matrix |
| `POST` | `/api/transactions` | Transaction volume trends, category shares, and payment cross-tabs |
| `POST` | `/api/segments` | Configurable age cohort clustering and comparative metrics |
| `POST` | `/api/target-segment-analysis` | Multi-criteria weighted scoring engine and dynamic narrative |
| `POST` | `/api/experiment-summary` | Descriptive A/B test statistics and spend lift |
| `POST` | `/api/power-analysis` | Statistical power and required sample size calculation |
| `POST` | `/api/hypothesis-test` | Two-sample Z-test and t-test with rejection region curve |
| `POST` | `/api/insights` | Automated domain findings and executive decision panel |
| `POST` | `/api/export-report` | Full executive report assembly and printable HTML format |
| `POST` | `/api/data-explorer` | Paginated row inspection with search and sorting |
| `GET` | `/api/export-csv/{table}` | Downloadable CSV file for any raw or cleaned dataset |
| `POST` | `/api/reset-data` | Re-initializes synthetic dataset with a configurable seed |

---

## 7. License
MIT License. Developed for Commercial Banking Customer Analytics & Statistical Experimentation.
