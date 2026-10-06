# CreditIQ Analytics Platform

<div align="center">

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/shivangsaxena1011/Credit-Card-Analytics-Platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <strong>Enterprise-Grade Credit Card Customer Analytics, Financial Segmentation, Card Intelligence & Portfolio Strategy Engine</strong>
</p>

<p align="center">
  <em>An end-to-end full-stack banking intelligence platform that answers commercial lending queries, audits and cleans data deterministically, ranks customer cohorts, and empowers consumers with real-time BIN & utilization intelligence.</em>
</p>

</div>

---

## 📌 Executive Summary

**CreditIQ Analytics** is a comprehensive, production-grade credit card portfolio analytics and customer intelligence platform engineered to simulate real-world commercial banking and consumer card workflows.

The system addresses the primary operational question faced by credit risk officers and card product managers:

> **"Which customer segment should a bank prioritize for new credit card issuance and limit expansion, and how do spending profiles, credit risks, and delinquency patterns vary across cohorts?"**

Simultaneously, CreditIQ incorporates a consumer-facing **Card Intelligence Engine** that enables cardholders to inspect card BINs, gauge utilization health against the safe 30% threshold, benchmark limit-increase readiness, and receive personalized debt-reduction recommendations.

---

## 🚀 Key Modules & Capabilities

### 1. 💳 Card Intelligence & Optimization Engine
* **Real-time BIN Inspector**: Instant Bank Identification Number lookup supporting major networks (Visa, Mastercard, RuPay, American Express, Diners Club) with issuer identification, card tiers, and preset selectors.
* **Credit Utilization & Safe 30% Threshold Monitor**: Visual gauge tracking current balances against credit limits, highlighting available credit and calculating the exact dollar amount needed to return to optimal credit bureau utilization (<30%).
* **Card Health Score Model**: Proprietary composite scoring algorithm (0–100) combining utilization impact, repayment habits, account vintage, and spend volatility.
* **Credit Limit Increase Readiness**: Multi-parameter qualification model analyzing tenure, utilization discipline, and payment track records to deliver an actionable eligibility score and next-step roadmap.
* **Personalized Financial Recommendations**: Actionable strategies categorized by Emergency, Optimization, and Rewards, featuring an interactive debt payoff simulator.

### 2. 🛡️ Data Quality & Deterministic Cleaning Pipeline
* **Dynamic Health Scoring (0–100%)**: Quantitative audit inspecting raw datasets for missing demographics, out-of-range ages, duplicate accounts, and limit violations.
* **Deterministic Preprocessing**:
  - Occupation-wise median imputation for missing incomes.
  - Credit score bracket imputation for missing limits.
  - Hard capping on debt exceeding established credit lines.
  - Context-aware median spend imputation for missing transaction values.
* **Before / After Audit Telemetry**: Side-by-side verification table tracking resolved issues and data drift across pipeline iterations.

### 3. 👥 Customer Profiling & Demographic Analytics
* **Income & Age Distributions**: Interactive demographic profiling broken down across gender, marital status, and geography (City, Suburb, Rural).
* **Occupation Benchmarking**: Income spreads across technical, consulting, freelance, and executive occupations.
* **Interactive Scatter Plot**: Correlation visualizer mapping age against annual income with multi-cohort filtering.

### 4. 📈 Credit Risk & Pearson Correlation Matrix
* **Credit Score Tiering**: Distribution across Fair, Good, Very Good, and Exceptional score buckets.
* **Debt & Utilization Exposure**: Portfolio-wide debt distributions and utilization metrics.
* **Pearson Correlation Heatmap**: High-precision statistical correlation matrix measuring interactions between Age, Annual Income, Credit Score, Credit Limit, and Total Debt.

### 5. 🧾 Transaction Velocity & Multi-Dimensional Cross-Tabs
* **Spending Velocity**: Monthly volume trends and category breakdowns across Electronics, Fashion, Travel, Groceries, and Entertainment.
* **Payment Method Cross-Tabulation**: Multi-dimensional matrix mapping transaction categories against payment channels (Credit Card, Debit Card, UPI, PhonePe, Net Banking, Cash).

### 6. 🎯 Cohort Segmentation & Target Strategy Engine
* **Dynamic Age Clustering**: Configurable cohorts (Young Adults 18–25, Prime Working 26–48, Mature 49–65+) evaluated across 11 financial and behavioral dimensions.
* **Weighted Multi-Criteria Target Ranking**: Interactive weight tuning sliders (Income, Credit Score, Spend, Low Debt) recalculating target scores in real time with dynamic business narratives and executive summaries.

### 7. 💡 Automated Insights & Executive Reporting
* **Domain Findings Panel**: Automated observations generated across portfolio health, risk exposure, and growth opportunities.
* **Data Explorer**: Paginated inspector with search, sorting, and raw/cleaned dataset toggles.
* **Export & Reporting Center**: Generate executive portfolio reports with printable HTML document layouts and one-click CSV data exports.

---

## 🏗️ Architecture & Technology Stack

CreditIQ Analytics is designed as a unified single-repository system combining modern frontend architecture with an authoritative Python analytics backend.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                HTTP / HTTPS Requests (Port 3000)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                    │
│    (React 19 • TypeScript • Tailwind CSS v4 • Recharts)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Rewrites via next.config.ts
         /api/*  ──>  Development: http://127.0.0.1:8000
                 ──>  Production:  /api/index (Serverless)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Analytics Engine                    │
│   (Python 3.12 • Pandas • NumPy • SciPy • Pydantic v2)      │
├─────────────────────────────────────────────────────────────┤
│  • In-Memory Deterministic Store   • Quality Auditor        │
│  • Preprocessing & Imputation      • Segment & Scoring      │
└─────────────────────────────────────────────────────────────┘
```

### Stack Breakdown

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Recharts 3](https://recharts.org/), [Lucide React](https://lucide.dev/) |
| **Backend Engine** | [Python 3.12](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/), [SciPy](https://scipy.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **Testing & CI** | [Pytest](https://pytest.org/), GitHub Actions CI Workflow |
| **Deployment** | Single-Project [Vercel](https://vercel.com) Deployment (`@vercel/python` Serverless Functions + Next.js build) |

---

## 📁 Repository Directory Structure

```
Credit Card Analysis/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI (pytest + npm build)
├── api/
│   └── index.py                 # Vercel Serverless Function entry point for FastAPI
├── backend/
│   ├── analytics/
│   │   ├── credit_analysis.py       # Credit score distribution, debt ratios, Pearson correlation
│   │   ├── customer_analysis.py     # Demographics, age, income distributions, scatter matrices
│   │   ├── data_generator.py        # Generates Customers (~1k), Credit (~1k), Txns (~65k)
│   │   ├── data_loader.py           # In-memory lifecycle store, filters, CSV exporter
│   │   ├── data_quality.py          # Quality score (0-100%), issue auditing, anomaly detection
│   │   ├── insights.py              # Automated findings by domain & executive decision panel
│   │   ├── preprocessing.py         # Deterministic cleaning pipeline with before/after audit
│   │   ├── report_generator.py      # Structured report compiler & printable HTML document
│   │   ├── segmentation.py          # Configurable age cohort clustering & 11-metric benchmarking
│   │   ├── target_scoring.py        # Multi-criteria weighted scoring engine & dynamic narrative
│   │   └── transaction_analysis.py  # Spend velocity, category shares, payment method cross-tabs
│   ├── tests/
│   │   └── test_analytics.py        # Pytest test suite asserting cleaning, scores & segmentation
│   └── main.py                      # FastAPI application with typed schemas & dual-mounted routes
├── docs/
│   └── ANALYTICS_METHODOLOGY.md     # Mathematical & statistical methodology documentation
├── public/                          # Static icons and assets
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind CSS v4 styling & theme configuration
│   │   ├── layout.tsx               # App layout & root fonts
│   │   └── page.tsx                 # Master view router & active tab coordinator
│   ├── components/
│   │   ├── Header.tsx               # Status badges, global filters trigger, dataset toggle
│   │   ├── Sidebar.tsx              # Domain navigation & dataset health indicators
│   │   ├── GlobalFilterModal.tsx    # Multi-field customer demographic filter modal
│   │   └── views/
│   │       ├── CardIntelligenceView.tsx   # BIN lookup, utilization gauge, health score, AI recs
│   │       ├── CreditAnalyticsView.tsx    # Credit score, utilization, Pearson matrix
│   │       ├── CustomerAnalyticsView.tsx  # Demographics, income by occupation, scatter plots
│   │       ├── DashboardView.tsx          # Executive overview & visual workflow pipeline
│   │       ├── DataExplorerView.tsx       # Tabular row inspection, search, sorting, pagination
│   │       ├── DataOverviewView.tsx       # Core portfolio KPIs & distribution graphs
│   │       ├── DataQualityView.tsx        # Dynamic quality score & Before/After audit table
│   │       ├── ExportReportView.tsx       # Report preview, printable PDF format, CSV exports
│   │       ├── InsightsView.tsx           # Automated domain findings & decision panel
│   │       ├── SegmentationView.tsx       # Configurable age cohorts & 11-dimension benchmarks
│   │       ├── TargetSegmentView.tsx      # Multi-criteria scoring sliders & dynamic narrative
│   │       └── TransactionAnalyticsView.tsx# Spend trend, category x payment cross-tabs
│   ├── services/
│   │   ├── api.ts                   # Type-safe Axios/Fetch API client for FastAPI endpoints
│   │   └── cardIntelligenceData.ts  # BIN database, health models, and financial recommendation logic
│   └── types/
│       └── analytics.ts             # TypeScript interfaces for API schemas & domain models
├── .python-version                  # Python runtime specification (3.12)
├── next.config.ts                   # Next.js configuration with development & serverless rewrites
├── package.json                     # NPM packages, dependencies, and build scripts
├── requirements.txt                 # Python dependencies for backend & Vercel deployment
└── tsconfig.json                    # TypeScript compiler options
```

---

## ⚡ Quickstart & Local Development

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Python**: `3.11` or `3.12`
* **Package Managers**: `npm` and `pip`

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/shivangsaxena1011/Credit-Card-Analytics-Platform.git
cd Credit-Card-Analytics-Platform
```

---

### Step 2: Set Up and Start Backend
Open a terminal for the FastAPI backend:

```bash
# Optional: Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt pytest

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

* Backend Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Step 3: Set Up and Start Frontend
Open a second terminal for the Next.js frontend:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Next.js automatically rewrites requests to `/api/*` to `http://127.0.0.1:8000/api/*`.

---

### Step 4: Run Analytics & Statistical Tests
To execute the automated Python verification suite:

```bash
python -m pytest backend/tests/test_analytics.py -v
```

This tests data synthesis, dirty data injection, audit scoring, deterministic imputation fallbacks, credit utilization consistency, and API endpoint availability.

---

## 🌐 Seamless Deployment (Single-Project Vercel)

The platform is engineered to deploy in **one single Vercel project** without requiring external hosting services (like Render, AWS, or Railway):

1. **Import Repository**: Connect `Credit-Card-Analytics-Platform` in your [Vercel Dashboard](https://vercel.com).
2. **Root Directory**: Leave as `./` (repository root).
3. **Build & Functions**:
   - Vercel builds the Next.js frontend at the root.
   - Vercel automatically detects `api/index.py` and deploys it as a Python Serverless Function using `requirements.txt`.
   - `next.config.ts` directs `/api/:path*` traffic to the serverless function seamlessly.
4. **Deploy**: Click **Deploy**. Both the frontend UI and the analytics backend are live instantly on your Vercel URL.

---

## 📡 REST API Reference

All requests and responses use typed JSON payloads.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, calculation engine identifier, and loaded record counts |
| `GET` | `/api/pipeline-status` | Operational status of all pipeline stages (`RAW`, `VALIDATED`, `CLEANED`, `ANALYZED`, `SEGMENTED`) |
| `GET` | `/api/data-quality` | Dynamic quality score (0–100%), issue inventory, and metric-level audit results |
| `POST` | `/api/clean` | Triggers the deterministic cleaning pipeline; returns before vs. after statistics |
| `POST` | `/api/overview` | Portfolio KPIs, key summary metrics, and multi-domain distributions |
| `POST` | `/api/customers` | Filterable demographic profiling, income bands, and scatter plot points |
| `POST` | `/api/credit` | Credit score bands, limit exposure, utilization, and Pearson correlation matrix |
| `POST` | `/api/transactions` | Transaction volume trends, category breakdown, and payment cross-tabs |
| `POST` | `/api/segments` | Age-cohort clustering (18–25, 26–48, 49–65+) across 11 comparative metrics |
| `POST` | `/api/target-segment-analysis` | Multi-criteria weighted scoring engine with dynamic narrative generation |
| `POST` | `/api/insights` | Automated domain findings and executive decision panel |
| `POST` | `/api/data-explorer` | Paginated row browser with search and sorting for customers, credit, and transactions |
| `POST` | `/api/export-report` | Full executive portfolio report payload with printable HTML document |
| `GET` | `/api/export-csv/{table}` | Downloadable CSV stream for raw or cleaned datasets (`customers`, `credit`, `transactions`) |
| `POST` | `/api/reset-data` | Re-initializes synthetic datasets with custom pseudo-random seed |

---

## 🔬 Analytical & Scoring Methodology

### 1. Pearson Correlation Matrix
Linear dependence between financial variables is calculated as:
$$r_{xy} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$
Evaluated across Age, Income, Credit Score, Credit Limit, and Total Debt.

### 2. Multi-Criteria Target Segment Score
Cohort prioritization computes a weighted composite index normalized on a 0–100 scale:
$$\text{Target Score} = w_{\text{inc}} \cdot \tilde{I} + w_{\text{score}} \cdot \tilde{S} + w_{\text{spend}} \cdot \tilde{V} + w_{\text{debt}} \cdot (1 - \tilde{D})$$
Where:
- $\tilde{I}, \tilde{S}, \tilde{V}, \tilde{D}$ represent min-max normalized values of Income, Credit Score, Transaction Volume, and Debt Ratio.
- $w_{\text{inc}} + w_{\text{score}} + w_{\text{spend}} + w_{\text{debt}} = 1.0$.

### 3. Card Health Index
The consumer card health score incorporates four distinct credit risk components:
$$\text{Health Score} = S_{\text{util}} \times 0.45 + S_{\text{payment}} \times 0.35 + S_{\text{vintage}} \times 0.10 + S_{\text{volatility}} \times 0.10$$
With utilization score decaying non-linearly when revolving utilization exceeds the optimal 30% ceiling.

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for details.

* **Author**: [Shivang Saxena](https://github.com/shivangsaxena1011)
* **Project**: CreditIQ Analytics Platform
* **Repository**: [shivangsaxena1011/Credit-Card-Analytics-Platform](https://github.com/shivangsaxena1011/Credit-Card-Analytics-Platform)
