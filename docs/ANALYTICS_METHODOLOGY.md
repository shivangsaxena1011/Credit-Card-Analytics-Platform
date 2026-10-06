# CreditIQ Analytics Methodology

This document details the mathematical and statistical formulations governing CreditIQ Analytics, establishing rigorous standards for reproducible credit card customer analytics, dynamic data cleaning, and cohort targeting.

---

## 1. Dynamic Data Cleaning & Preprocessing

### 1.1 Dynamic Quality Score Formulation
Rather than relying on a static mock score, the Data Quality Score $Q \in [0, 100]$ is computed dynamically from observed defects across Customer, Credit, and Transaction tables:

$$Q = 100 \times \left(1.0 - \min\left(1.0, \frac{\sum_{t \in T} \sum_{d \in D_t} w_d \cdot n_{d,t}}{\sum_{t \in T} N_t \cdot K_t}\right)\right)$$

Where:
- $N_t$: Total record count in table $t \in \{\text{customers}, \text{credit\_profiles}, \text{transactions}\}$
- $K_t$: Number of evaluated schema attributes for table $t$
- $n_{d,t}$: Count of detected defects of category $d$
- $w_d$: Defect severity penalty weight:
  - Critical schema violation (missing primary key, duplicate account): $w_d = 2.0$
  - Range anomaly (negative age, credit score $< 300$ or $> 850$): $w_d = 1.5$
  - Business logic contradiction (debt $>$ credit limit, negative balance): $w_d = 1.5$
  - Missing non-critical attribute (missing income): $w_d = 1.0$

### 1.2 Imputation Rules
- **Income Missingness**: Imputed using occupation-stratified medians $\tilde{y}_{\text{occ}} = \text{median}(Y \mid \text{Occupation} = \text{occ})$. If an occupation stratum is completely empty, the global portfolio median $\tilde{y}_{\text{global}}$ is utilized.
- **Credit Limit Missingness**: Imputed by matching customer credit score to standard FICO tiers (Poor, Fair, Good, Very Good, Exceptional) and taking the bracket median limit.
- **Credit Utilization**: Reported utilization is preserved when available. A derived utilization $\hat{u} = \text{Debt} / \text{Credit Limit} \times 100$ is computed for validation; records where $|\text{Reported} - \hat{u}| > 20\%$ are flagged as inconsistent without blindly overwriting historical reported values.
- **Transaction Amount Anomaly Treatment**: Outliers exceeding $Q_3 + 3 \times \text{IQR}$ are capped at the 99th percentile rather than dropped, preserving aggregate transaction counts and platform cashflow integrity.

---

## 2. Customer, Credit Risk & Transaction Analysis

### 2.1 Pearson Correlation Matrix
For continuous variables $X$ and $Y$ (Income, Age, Credit Score, Credit Limit, Debt, Reported Utilization):

$$r_{XY} = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n} (x_i - \bar{x})^2} \sqrt{\sum_{i=1}^{n} (y_i - \bar{y})^2}}$$

---

## 3. Cohort Segmentation Engine

### 3.1 Age Cohort Binning
Customers are assigned to mutually exclusive life-stage cohorts:
- **Young Adults (18–25)**: Early career, entry-level income, active non-card transaction frequency.
- **Prime Working (26–48)**: Career progression, peak earning and borrowing capacity.
- **Mature (49–65+)**: Established asset base, conservative utilization, prime/super-prime credit scores.

### 3.2 Segment Financial Benchmarks
Across each cohort, 11 comparative dimensions are dynamically calculated:
1. Customer Count & Portfolio Share ($N_s, \%_s$)
2. Average & Median Age ($\bar{A}_s, \tilde{A}_s$)
3. Average & Median Annual Income ($\bar{I}_s, \tilde{I}_s$)
4. Average Credit Score ($\bar{C}_s$)
5. Average Credit Limit ($\bar{L}_s$)
6. Average Revolving Debt ($\bar{D}_s$)
7. Average Credit Utilization Rate ($\bar{U}_s$)
8. Total Transaction Volume ($\sum V_s$)
9. Average Transaction Count per Account ($\bar{T}_s$)
10. Credit-Card Payment Share ($S_{\text{cc}} = N_{\text{cc}} / N_{\text{txns}}$)
11. Top Product Verticals (Electronics, Fashion, Grocery, etc.)

---

## 4. Multi-Criteria Target Segment Recommendation Engine

### 4.1 Scoring Formulation
Candidate segments are evaluated across six strategic dimensions:
1. **Segment Size** ($w_1 = 0.20$): Scale of addressable account holders.
2. **Income Opportunity** ($w_2 = 0.15$): Segment earning capability.
3. **Credit Profile Opportunity** ($w_3 = 0.20$): Credit capacity headroom for prudent line growth:
   $$M_{\text{credit}} = \frac{\bar{C}_s}{\max(1, \bar{L}_s)} \times 1000$$
4. **Transaction Activity** ($w_4 = 0.20$): Purchase frequency per customer account.
5. **Card Usage Gap** ($w_5 = 0.15$): Whitespace for credit card conversion:
   $$M_{\text{gap}} = 1.0 - S_{\text{cc}}$$
   *(Segments with lower existing credit card adoption possess greater upside for new card onboarding.)*
6. **Category Engagement** ($w_6 = 0.10$): Concentration in high-margin merchant verticals (Electronics, Fashion, Beauty, Travel).

### 4.2 Min-Max Normalization
Each raw dimension $x_{i}$ is normalized across candidate segments $k \in K$:
$$u_i(k) = 0.20 + 0.80 \times \left( \frac{x_{i}(k) - \min_j x_{i}(j)}{\max_j x_{i}(j) - \min_j x_{i}(j)} \right)$$

The final composite Opportunity Score is computed as:
$$\text{Opportunity Score}(k) = 100 \times \sum_{i=1}^{6} w_i \cdot u_i(k)$$

The cohort with the highest Opportunity Score is recommended, and an empirical narrative is synthesized directly from calculated metrics.

---

## 5. Commercial Strategy & Risk Directives

1. **Credit Utilization Governance**:
   Early-career cohorts exhibiting high card conversion opportunity must be provisioned with tiered credit limits matched to verified starter salaries to mitigate portfolio non-performing loans (NPL).
2. **Category Merchant Incentives**:
   Cross-tab analyses demonstrate that category-focused cashback (e.g. digital retail and electronics) drives higher activation velocity than generic balance transfer promotions.
3. **Staged Portfolio Rollout**:
   Target segment campaigns should proceed via phased rollouts (e.g. 10–15% portfolio exposure) with continuous monitoring of 30-day delinquency and activation curves.
