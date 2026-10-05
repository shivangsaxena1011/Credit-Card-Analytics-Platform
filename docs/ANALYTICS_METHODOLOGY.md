# CreditIQ Analytics — Methodology & Statistical Framework

This document outlines the statistical theory, data preprocessing protocols, mathematical formulations, and operational limitations embedded within **CreditIQ Analytics**.

---

## 1. Preprocessing & Data Cleaning Decisions

### 1.1 Non-Destructive Transformation Architecture
In accordance with modern data engineering standards, raw ingested datasets are never mutated or permanently overwritten. Instead:
- An immutable `raw_data` dictionary stores the ingested states.
- The preprocessing pipeline generates a separate `cleaned_data` structure.
- Before-and-after audit statistics are computed across every affected dimension to guarantee traceability.

### 1.2 Imputation & Correction Strategies
1. **Customer Annual Income**:
   - *Issue*: Missing values in continuous income (~4.8% of cohort).
   - *Rationale*: Mean imputation introduces severe bias when income distributions are right-skewed. Dropping records introduces attrition bias.
   - *Strategy*: Occupation-wise median imputation:
     $$\hat{Y}_{i} = \text{Median}(Y_{\text{occupation}(i)})$$
2. **Customer Age Boundary Corrections**:
   - *Issue*: Sensor or data-entry errors resulting in impossible ages ($< 15$ or $> 80$, e.g., 1, 2, 110, 120).
   - *Strategy*: Invalid records are replaced using occupation-wise median age.
3. **Credit Profile Deduplication**:
   - *Issue*: Duplicate `cust_id` records due to multi-source ingestion.
   - *Strategy*: Deterministic resolution retaining the most creditworthy/informative record: sorted descending by `credit_limit` and `credit_score` with `keep='first'`.
4. **Credit Limit Imputation**:
   - *Issue*: Missing limits on active credit files (~2.8%).
   - *Strategy*: FICO bracket median imputation across standard credit score bands ($<580$, $580-669$, $670-739$, $740-799$, $800+$).
5. **Debt Ceiling Business Rule**:
   - *Issue*: Incurred balances exceeding total authorized credit limit (`outstanding_debt > credit_limit`).
   - *Strategy*: Explicit business rule cap:
     $$\text{debt}_{i} = \min(\text{debt}_{i}, \text{limit}_{i})$$
6. **Transaction Platform & Zero-Amount Treatment**:
   - *Issue*: Missing platforms (~1.5%) and $0.00 transaction amounts (~0.5%).
   - *Strategy*: Platform mode imputation ('Amazon'). Zero amounts are contextually imputed using the product category's non-zero median transaction value rather than blindly dropped.
7. **Extreme Outlier Capping (IQR)**:
   - *Issue*: Extreme transaction values ($35,000 to $85,000) that distort standard error calculations.
   - *Strategy*: Upper fence detection via $Q_3 + 5.0 \times \text{IQR}$ and winsorization cap at the 99.5th percentile.

---

## 2. Customer Segmentation Methodology

Customers are partitioned into life-cycle cohorts:
- **18–25 (Young Adult / Early Career)**: Early credit history, digital native, high mobile checkout frequency, lower established limits.
- **26–48 (Prime Earning / Family Building)**: Peak earning window, highest average credit limits and diversified card utilization.
- **49–65+ (Mature / Wealth Accumulation)**: Conservative revolving leverage, high credit scores, substantial average ticket sizes.

For each cohort, 11 primary financial and transactional dimensions are dynamically calculated:
1. Customer count ($N_s$)
2. Customer percentage share ($P_s = N_s / N_{\text{total}}$)
3. Average annual income ($\bar{I}_s$)
4. Median annual income ($\tilde{I}_s$)
5. Average credit score ($\bar{C}_s$)
6. Average credit limit ($\bar{L}_s$)
7. Average credit utilization ratio ($\bar{U}_s$)
8. Average outstanding debt ($\bar{D}_s$)
9. Average transaction amount ($\bar{T}_s$)
10. Credit-card payment share ($S_{\text{cc}} = N_{\text{cc}} / N_{\text{txns}}$)
11. Top merchant product categories

---

## 3. Multi-Criteria Target Segment Recommendation Engine

### 3.1 Scoring Formulation
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

### 3.2 Min-Max Normalization
Each raw dimension $x_{i}$ is normalized across candidate segments $k \in K$:
$$u_i(k) = 0.20 + 0.80 \times \left( \frac{x_{i}(k) - \min_j x_{i}(j)}{\max_j x_{i}(j) - \min_j x_{i}(j)} \right)$$

The final composite Opportunity Score is computed as:
$$\text{Opportunity Score}(k) = 100 \times \sum_{i=1}^{6} w_i \cdot u_i(k)$$

The cohort with the highest Opportunity Score is recommended, and an empirical narrative is synthesized directly from calculated metrics.

---

## 4. Statistical Power & Sample Size Architecture

To prevent underpowered experiments where true campaign lift is erroneously dismissed (Type II error, $\beta$), required sample size is computed prior to experiment execution using `statsmodels.stats.power.TTestIndPower` and normal large-sample approximations.

For a two-sample test comparing means with standard deviation $\sigma$ and effect size Cohen's $d = \frac{|\mu_2 - \mu_1|}{\sigma_{\text{pooled}}}$:

$$N_{\text{group}} \approx 2 \times \left( \frac{Z_{1 - \alpha/2} + Z_{1 - \beta}}{d} \right)^2$$

Where:
- $\alpha = 0.05$ (Significance level, Type I error rate)
- $1 - \beta = 0.80$ (Target statistical power)
- $d = 0.20$ (Small effect size benchmark according to Cohen)

Sensitivity grids evaluate sample requirements across $d \in \{0.10, 0.20, 0.30, 0.40, 0.50, 0.70, 1.00\}$.

---

## 5. Statistical Hypothesis Testing Framework

### 5.1 Hypotheses Definition
When evaluating whether promotional incentives increase Average Transaction Value (ATV):
- **Null Hypothesis ($H_0$)**: $\mu_{\text{test}} \le \mu_{\text{control}}$ (The campaign does not produce incremental spend).
- **Alternative Hypothesis ($H_1$)**: $\mu_{\text{test}} > \mu_{\text{control}}$ (The campaign produces a statistically significant positive spend uplift).

*(Bidirectional tests $\mu_{\text{test}} \ne \mu_{\text{control}}$ are also supported via UI configuration.)*

### 5.2 Test Statistics
Both Two-Sample Z-Test and Welch's t-Test are implemented with unrounded internal precision:

1. **Standard Error of the Difference**:
   $$\text{SE} = \sqrt{\frac{s_{\text{ctrl}}^2}{n_{\text{ctrl}}} + \frac{s_{\text{test}}^2}{n_{\text{test}}}}$$

2. **Test Statistic**:
   $$Z \text{ or } t = \frac{\bar{x}_{\text{test}} - \bar{x}_{\text{ctrl}}}{\text{SE}}$$

3. **Welch-Satterthwaite Degrees of Freedom** (for t-test):
   $$\nu \approx \frac{\left( \frac{s_1^2}{n_1} + \frac{s_2^2}{n_2} \right)^2}{\frac{(s_1^2 / n_1)^2}{n_1 - 1} + \frac{(s_2^2 / n_2)^2}{n_2 - 1}}$$

4. **P-Value & Decision Rule**:
   - Right-tailed: $p = 1 - \Phi(Z)$
   - Decision:
     - If $p < \alpha \implies \mathbf{Reject\ H_0}$
     - If $p \ge \alpha \implies \mathbf{Fail\ to\ Reject\ H_0}$
     - *(The term "Accept $H_0$" is strictly avoided as it is statistically erroneous.)*

5. **Percentage Lift Formula**:
   $$\text{Lift (\%)} = \left( \frac{\bar{x}_{\text{test}} - \bar{x}_{\text{ctrl}}}{\bar{x}_{\text{ctrl}}} \right) \times 100$$

---

## 6. Analytical Assumptions & Limitations

1. **Correlation vs. Causation**:
   Pearson correlation coefficients confirm linear association between balance metrics and limits, but do not imply causality. Causal attribution is solely derived from the randomized A/B experiment.
2. **Statistical Significance vs. Commercial Profitability**:
   A statistically significant lift ($p < 0.05$) confirms that observed spend increases did not arise from random chance. However, it does not guarantee bank profitability until customer acquisition costs (CAC), cashback rewards liabilities, and merchant discount rates (MDR) are accounted for.
3. **Novelty & Satiation Bias**:
   Observed 30-day experimental lift may reflect initial promotional novelty. Long-term customer cohorts must be monitored for spend decay.
4. **Staged Deployment Directive**:
   Full portfolio rollout should be preceded by a staged Phase-2 rollout (e.g., 15% account exposure) to verify unit economics and 30-day credit delinquency stability.
