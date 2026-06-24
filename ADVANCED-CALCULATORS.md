# Advanced Calculator Upgrade — Build Roadmap

> Goal: move every calculator past "two fields" so it can compete with Bankrate /
> NerdWallet / Omnicalculator. Tiered so we don't bloat simple tools.

## Reusable toolkit (built — reuse everywhere)
- `lib/calc-url.ts` — encode/decode inputs ↔ URL query string
- `app/components/calc/useCalcState.ts` — shareable URL state hook (hydrate from URL, sync on change, reset, `shareUrl()`)
- `app/components/calc/exportCsv.ts` — client-side CSV download
- `app/components/calc/ScenarioGrid.tsx` — generic "what-if" table + CSV
- `app/components/calc/AmortizationTable.tsx` — yearly→monthly schedule + CSV (any loan tool)

## The three tiers
- **Tier 1 (ALL):** shareable URL + copy-link, a result explainer, a what-if `ScenarioGrid`, chart where output is over time.
- **Tier 2 (high-value, listed below):** type-specific depth — amortization schedules, multi-item input, A/B compare, advanced inputs.
- **Tier 3 (trivial long tail):** keep simple, Tier-1 only. (tip, bill-split, split-bill, rent-split, discount, percentage, percentage-change, allowance, cost-per-use, subscription-cost, latte-factor, bitcoin-halving-countdown, money-doubling, rule-of-72)

## Adoption pattern (per Tier-2 calculator)
1. Swap `useState(form)` → `useCalcState(DEFAULTS)` (shareable links + reset).
2. Make results live with `useMemo` (so shared links render correctly).
3. Add the type-specific feature (schedule / compare / scenario grid).
4. Verify: page renders 200 and the feature strings appear in HTML.

---

## Build checklist (🥇 = first wave)

### 🏠 Mortgage & Home — ✅ CLUSTER DONE (22 tools, build green)
mortgage-calculator hand-built (full amortization template); 21 more via workflow
(all what-if grid; 20 shareable URL + copy-link).
- [x] **mortgage-calculator** — extra payments + amortization + what-if grid + share (template)
- [x] mortgage-payoff / mortgage-amortization — share + what-if
- [x] home-affordability / mortgage-affordability — share + what-if
- [x] rent-vs-buy / rent-affordability / rent-increase — share + what-if
- [x] mortgage-overpayment (UK) / stamp-duty (UK) — share + what-if
- [x] biweekly-mortgage — share + what-if
- [x] mortgage-refinance / mortgage-comparison — what-if (compare-style)
- [x] heloc / reverse / second mortgage — share + what-if  (bridge/balloon/interest-only done in Loans)
- [x] closing-cost / pmi / mortgage-points / mortgage-protection / down-payment / down-payment-savings — share + what-if
- [ ] **follow-up (hand work):** true P/I amortization tables (extend the mortgage sub-libs), A/B compare UI for refinance/comparison

### 💳 Loans & Debt — ✅ CLUSTER DONE (47 tools, build green)
All got the what-if ScenarioGrid; 42 got shareable URL + copy-link; 3 got the full
amortization table (libs with P/I split). 5 multi-debt/compare tools got grid only.
- [x] loan-calculator / loan-emi / loan-payoff / loan-interest — share + what-if (+ extra-payment grids)
- [x] debt-snowball / debt-avalanche — what-if grid (multi-debt UI kept; URL-state skipped — array inputs)
- [x] credit-card-payoff / credit-card-interest / credit-card-comparison — share + what-if
- [x] amortization-calculator — share + what-if (+ table)
- [x] auto-loan-payoff / car-loan / car-loan-refinance — share + what-if
- [x] student-loan / -payoff / -refinance / education-loan / gold-loan / credit-builder-loan — share + what-if
- [x] debt-consolidation / debt-payoff / debt-to-income — share + what-if
- [x] loan-comparison / balance-transfer / two-card-payoff — what-if (compare-style)
- [x] extra-payment / loan-prepayment — share + what-if grid
- [x] personal / business / home-loan-emi / balloon / bridge / interest-only / line-of-credit — share + what-if
- [x] loan-affordability / -eligibility / -forgiveness / -late-payment / -tenure / -to-value — share + what-if
- [x] credit-limit / credit-utilization / minimum-payment / cash-advance / flat-vs-reducing / apr — share + what-if
- [ ] **follow-up (hand work):** array-aware URL state for the 5 multi-debt tools; true P/I amortization tables where libs only expose balance (extend lib math)

### 📈 Investing — ✅ CLUSTER DONE (30 tools, build green)
compound-interest hand-built (template); 29 more via workflow (what-if grid + share).
- [x] **compound-interest** — what-if grid + share (template)
- [x] dividend / drip / dividend-yield — share + what-if
- [x] coast-fire / fire — share + what-if
- [x] sip / lumpsum / swp / stp — share + what-if
- [x] future-value / present-value / investment-goal / time-value-of-money — share + what-if
- [x] cagr / annualized-return / xirr / irr / npv — share + what-if
- [x] roi / stock-profit / stock-return / stock-average / brokerage — share + what-if
- [x] bond-price / bond-yield / expense-ratio / mutual-fund / portfolio-return / millionaire — share + what-if
- [ ] **follow-up (hand work):** inflation toggle, multi-cashflow input for xirr/irr, fees/multi-lot for stock tools

### 🧓 Retirement — ✅ CLUSTER DONE (18 tools, build green)
All via workflow (what-if grid + share).
- [x] 401k / 401k-match — share + what-if
- [x] retirement / -corpus / -savings / -withdrawal — share + what-if
- [x] roth-ira / traditional-ira — share + what-if
- [x] social-security / pension / rmd / annuity / annuity-payout — share + what-if
- [x] nps / ppf / epf / fd / rd — share + what-if
- [ ] **follow-up (hand work):** Roth-vs-Traditional A/B compare, withdrawal depletion chart, claiming-age compare

### 💰 Taxes  *(need year + jurisdiction data — ongoing maintenance)*
- [ ] 🥇 income-tax / paycheck / take-home-pay — brackets, state + filing status, breakdown
- [ ] 🥇 tax-bracket / marginal-tax-rate / effective-tax-rate — bracket visualization
- [ ] 🥇 capital-gains-tax / capital-gains — short vs long, brackets
- [ ] self-employment-tax / payroll-tax / withholding — breakdown
- [ ] sales-tax / vat / gst / property-tax — by region
- [ ] dividend-tax (UK) / estate / gift / refund / deduction — bands / breakdown

### 💵 Salary & Income — ✅ CLUSTER DONE (22 tools, build green)
All via workflow (what-if grid + share).
- [x] salary / take-home-pay / paycheck / annual-income — share + what-if
- [x] hourly-to-salary / salary-to-hourly / hourly-rate — share + what-if
- [x] pay-raise / salary-increment / salary-inflation — share + what-if
- [x] overtime / bonus / commission / gross-to-net / ctc / pro-rata — share + what-if
- [x] minimum-wage / severance-pay / freelance-rate / billing-rate / hra-exemption / discretionary-income — share + what-if
- [ ] **follow-up (hand work):** real tax brackets + state/filing-status deduction breakdowns

### 🪙 Crypto & Trading
- [ ] 🥇 crypto-profit / bitcoin-profit — fees, multi-buy, compare
- [ ] 🥇 impermanent-loss — scenario grid
- [ ] crypto-dca / -average / -portfolio — schedule, allocation
- [ ] forex-profit / -margin / -compounding / pip / lot-size / position-size — risk calc
- [ ] options-profit / risk-reward — payoff diagram
- [ ] ⚠️ crypto-converter / currency-converter / exchange-rate / gas-fee — NEED live price API (not pure math)

### 💸 Savings & Budgeting
- [ ] 🥇 net-worth — asset/liability breakdown, track over time
- [ ] 🥇 50-30-20 / budget / zero-based / envelope — multi-category input, charts
- [ ] savings-goal / goal-savings / savings — timeline chart + scenario
- [ ] cd / high-yield-savings / money-market / compound-savings — APY compare, schedule
- [ ] emergency-fund / sinking-fund / 52-week / daily-savings — timeline

### 🏢 Business
- [ ] 🥇 break-even — chart, scenario
- [ ] 🥇 npv / irr / payback-period — cashflow table
- [ ] 🥇 profit-margin / gross-profit / net-profit / markup — breakdown, compare
- [ ] ebitda / working-capital / burn-rate / cash-flow / cac / clv / inventory-turnover — charts + grids

### 🛡️ Insurance
- [ ] 🥇 life / term-life / whole-life / term-vs-whole — needs analysis, term vs whole compare
- [ ] 🥇 human-life-value / insurance-needs — needs calc
- [ ] health / home / car / disability / travel / critical-illness — estimate breakdown

---

## Not feasible / not worth it (decided)
- **Live market data** (crypto/currency/today's rates): needs a paid API + upkeep. Only the converter tools truly need it; everything else is pure math.
- **Personalized advice:** regulated YMYL risk — don't.
- **Accounts / saved portfolios / login:** big build, little SEO payoff — shareable URLs cover 80%.
