export const meta = {
  name: 'build-remaining-calculators',
  description: 'Build the 3-file set (lib + client widget + SEO page) for every remaining finance calculator tool',
  phases: [{ title: 'Build', detail: 'one agent per small batch of tools' }],
}

const TOOLS = [{"slug":"inventory-turnover-calculator","title":"Inventory Turnover Calculator","type":"calculator"},{"slug":"loan-eligibility-calculator","title":"Loan Eligibility Calculator","type":"calculator"},{"slug":"loan-to-value-calculator","title":"Loan to Value Calculator","type":"calculator"},{"slug":"mortgage-affordability-calculator","title":"Mortgage Affordability Calculator","type":"calculator"},{"slug":"mortgage-amortization-calculator","title":"Mortgage Amortization Calculator","type":"calculator"},{"slug":"mortgage-comparison-calculator","title":"Mortgage Comparison Calculator","type":"calculator"},{"slug":"mortgage-overpayment-calculator","title":"Mortgage Overpayment Calculator","type":"calculator"},{"slug":"mortgage-payoff-calculator","title":"Mortgage Payoff Calculator","type":"calculator"},{"slug":"mortgage-points-calculator","title":"Mortgage Points Calculator","type":"calculator"},{"slug":"mortgage-protection-calculator","title":"Mortgage Protection Calculator","type":"calculator"},{"slug":"mortgage-refinance-calculator","title":"Mortgage Refinance Calculator","type":"calculator"},{"slug":"mutual-fund-calculator","title":"Mutual Fund Returns Calculator","type":"calculator"},{"slug":"nps-calculator","title":"NPS Calculator","type":"calculator"},{"slug":"npv-calculator","title":"NPV Calculator","type":"calculator"},{"slug":"net-profit-calculator","title":"Net Profit Calculator","type":"calculator"},{"slug":"net-worth-calculator","title":"Net Worth Calculator","type":"calculator"},{"slug":"options-profit-calculator","title":"Options Profit Calculator","type":"calculator"},{"slug":"overtime-calculator","title":"Overtime Pay Calculator","type":"calculator"},{"slug":"pmi-calculator","title":"PMI Calculator","type":"calculator"},{"slug":"ppf-calculator","title":"PPF Calculator","type":"calculator"},{"slug":"pay-raise-calculator","title":"Pay Raise Calculator","type":"calculator"},{"slug":"payback-period-calculator","title":"Payback Period Calculator","type":"calculator"},{"slug":"paycheck-calculator","title":"Paycheck Calculator","type":"calculator"},{"slug":"payroll-tax-calculator","title":"Payroll Tax Calculator","type":"calculator"},{"slug":"pension-calculator","title":"Pension Calculator","type":"calculator"},{"slug":"percentage-calculator","title":"Percentage Calculator","type":"calculator"},{"slug":"percentage-change-calculator","title":"Percentage Change Calculator","type":"calculator"},{"slug":"personal-loan-calculator","title":"Personal Loan Calculator","type":"calculator"},{"slug":"portfolio-return-calculator","title":"Portfolio Return Calculator","type":"calculator"},{"slug":"present-value-calculator","title":"Present Value Calculator","type":"calculator"},{"slug":"pro-rata-salary-calculator","title":"Pro Rata Salary Calculator","type":"calculator"},{"slug":"profit-margin-calculator","title":"Profit Margin Calculator","type":"calculator"},{"slug":"profit-margin-tax-calculator","title":"Profit Margin With Tax Calculator","type":"calculator"},{"slug":"property-tax-calculator","title":"Property Tax Calculator","type":"calculator"},{"slug":"property-tax-estimator","title":"Property Tax Estimator","type":"calculator"},{"slug":"purchasing-power-calculator","title":"Purchasing Power Calculator","type":"calculator"},{"slug":"rmd-calculator","title":"RMD Calculator","type":"calculator"},{"slug":"roi-calculator","title":"ROI Calculator","type":"calculator"},{"slug":"real-interest-rate-calculator","title":"Real Interest Rate Calculator","type":"calculator"},{"slug":"real-vs-nominal-calculator","title":"Real vs Nominal Return Calculator","type":"calculator"},{"slug":"rd-calculator","title":"Recurring Deposit Calculator","type":"calculator"},{"slug":"rent-affordability-calculator","title":"Rent Affordability Calculator","type":"calculator"},{"slug":"rent-increase-calculator","title":"Rent Increase Calculator","type":"calculator"},{"slug":"rent-split-calculator","title":"Rent Split Calculator","type":"calculator"},{"slug":"rent-vs-buy-calculator","title":"Rent vs Buy Calculator","type":"calculator"},{"slug":"retirement-calculator","title":"Retirement Calculator","type":"calculator"},{"slug":"retirement-corpus-calculator","title":"Retirement Corpus Calculator","type":"calculator"},{"slug":"retirement-savings-calculator","title":"Retirement Savings Calculator","type":"calculator"},{"slug":"retirement-withdrawal-calculator","title":"Retirement Withdrawal Calculator","type":"calculator"},{"slug":"reverse-mortgage-calculator","title":"Reverse Mortgage Calculator","type":"calculator"},{"slug":"risk-reward-calculator","title":"Risk Reward Ratio Calculator","type":"calculator"},{"slug":"roth-ira-calculator","title":"Roth IRA Calculator","type":"calculator"},{"slug":"rule-of-72-calculator","title":"Rule of 72 Calculator","type":"calculator"},{"slug":"stp-calculator","title":"STP Calculator","type":"calculator"},{"slug":"swp-calculator","title":"SWP Calculator","type":"calculator"},{"slug":"salary-calculator","title":"Salary Calculator","type":"calculator"},{"slug":"salary-increment-calculator","title":"Salary Increment Calculator","type":"calculator"},{"slug":"salary-inflation-calculator","title":"Salary Inflation Calculator","type":"calculator"},{"slug":"salary-to-hourly-calculator","title":"Salary to Hourly Calculator","type":"calculator"},{"slug":"sales-revenue-calculator","title":"Sales Revenue Calculator","type":"calculator"},{"slug":"sales-tax-calculator","title":"Sales Tax Calculator","type":"calculator"},{"slug":"savings-calculator","title":"Savings Calculator","type":"calculator"},{"slug":"savings-goal-calculator","title":"Savings Goal Calculator","type":"calculator"},{"slug":"savings-rate-calculator","title":"Savings Rate Calculator","type":"calculator"},{"slug":"scholarship-savings-calculator","title":"Scholarship Savings Calculator","type":"calculator"},{"slug":"second-mortgage-calculator","title":"Second Mortgage Calculator","type":"calculator"},{"slug":"self-employment-tax-calculator","title":"Self Employment Tax Calculator","type":"calculator"},{"slug":"severance-pay-calculator","title":"Severance Pay Calculator","type":"calculator"},{"slug":"sinking-fund-calculator","title":"Sinking Fund Calculator","type":"calculator"},{"slug":"social-security-calculator","title":"Social Security Calculator","type":"calculator"},{"slug":"split-bill-calculator","title":"Split Bill Calculator","type":"calculator"},{"slug":"staking-calculator","title":"Staking Rewards Calculator","type":"calculator"},{"slug":"stamp-duty-calculator","title":"Stamp Duty Calculator","type":"calculator"},{"slug":"stock-average-calculator","title":"Stock Average Calculator","type":"calculator"},{"slug":"stock-profit-calculator","title":"Stock Profit Calculator","type":"calculator"},{"slug":"stock-return-calculator","title":"Stock Return Calculator","type":"calculator"},{"slug":"student-budget-calculator","title":"Student Budget Calculator","type":"calculator"},{"slug":"student-loan-calculator","title":"Student Loan Calculator","type":"calculator"},{"slug":"loan-forgiveness-calculator","title":"Student Loan Forgiveness Calculator","type":"calculator"},{"slug":"student-loan-payoff-calculator","title":"Student Loan Payoff Calculator","type":"calculator"},{"slug":"student-loan-refinance-calculator","title":"Student Loan Refinance Calculator","type":"calculator"},{"slug":"subscription-cost-calculator","title":"Subscription Cost Calculator","type":"calculator"},{"slug":"take-home-pay-calculator","title":"Take Home Pay Calculator","type":"calculator"},{"slug":"tax-bracket-calculator","title":"Tax Bracket Calculator","type":"calculator"},{"slug":"tax-deduction-calculator","title":"Tax Deduction Calculator","type":"calculator"},{"slug":"tax-refund-calculator","title":"Tax Refund Calculator","type":"calculator"},{"slug":"term-insurance-calculator","title":"Term Insurance Calculator","type":"calculator"},{"slug":"term-vs-whole-life-calculator","title":"Term vs Whole Life Calculator","type":"calculator"},{"slug":"time-value-of-money-calculator","title":"Time Value of Money Calculator","type":"calculator"},{"slug":"tip-calculator","title":"Tip Calculator","type":"calculator"},{"slug":"traditional-ira-calculator","title":"Traditional IRA Calculator","type":"calculator"},{"slug":"travel-insurance-calculator","title":"Travel Insurance Calculator","type":"calculator"},{"slug":"tuition-inflation-calculator","title":"Tuition Inflation Calculator","type":"calculator"},{"slug":"two-card-payoff-calculator","title":"Two Card Payoff Calculator","type":"calculator"},{"slug":"vat-calculator","title":"VAT Calculator","type":"calculator"},{"slug":"vacation-savings-calculator","title":"Vacation Savings Calculator","type":"calculator"},{"slug":"wedding-budget-calculator","title":"Wedding Budget Calculator","type":"calculator"},{"slug":"whole-life-insurance-calculator","title":"Whole Life Insurance Calculator","type":"calculator"},{"slug":"withholding-tax-calculator","title":"Withholding Tax Calculator","type":"calculator"},{"slug":"working-capital-calculator","title":"Working Capital Calculator","type":"calculator"},{"slug":"xirr-calculator","title":"XIRR Calculator","type":"calculator"},{"slug":"zero-based-budget-calculator","title":"Zero Based Budget Calculator","type":"calculator"}]

const BATCH = 3
const batches = []
for (let i = 0; i < TOOLS.length; i += BATCH) batches.push(TOOLS.slice(i, i + BATCH))

const SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          ok: { type: 'boolean' },
          note: { type: 'string' },
        },
        required: ['slug', 'ok'],
      },
    },
  },
  required: ['results'],
}

function buildPrompt(batch) {
  const list = batch.map((t) => `- slug: "${t.slug}"  | title: "${t.title}" | type: ${t.type}`).join('\n')
  return `You are building finance calculator tools for a Next.js (App Router, TypeScript, Tailwind) project at D:\\finance-tools. Build EACH tool below as a complete 3-file set, matching the project's established pattern EXACTLY.

## STEP 1 — Read these reference files first to learn exact imports, structure, styling and conventions. You MUST mirror them closely:
- D:\\finance-tools\\app\\calculators\\future-value-calculator\\page.tsx
- D:\\finance-tools\\app\\calculators\\future-value-calculator\\FutureValueCalculator.tsx
- D:\\finance-tools\\lib\\calculators\\future-value.ts

## NAMING RULES (derive mechanically from each slug)
- libBase = slug with a trailing "-calculator" removed (if present). Otherwise the full slug. Examples: "mortgage-payoff-calculator" -> "mortgage-payoff"; "roi-calculator" -> "roi".
- ComponentName = PascalCase of the FULL slug (split on "-", capitalize each segment, join). Examples: "mortgage-payoff-calculator" -> "MortgagePayoffCalculator"; "roi-calculator" -> "RoiCalculator". (None of these slugs start with a digit.)
- Files to create per tool:
  1. D:\\finance-tools\\lib\\calculators\\<libBase>.ts
  2. D:\\finance-tools\\app\\calculators\\<slug>\\<ComponentName>.tsx
  3. D:\\finance-tools\\app\\calculators\\<slug>\\page.tsx
- The default export of file 2 is the React component named <ComponentName>, and page.tsx imports it as: import <ComponentName> from "./<ComponentName>";

## IMPORTANT — some of these folders already contain a half-built lib + component from a previous interrupted run. OVERWRITE all three files for every tool so the lib, the component, and page.tsx are mutually consistent (same ComponentName, matching types). Do not leave stale files. If an old component file with a DIFFERENT name exists in the folder, delete it (write your standard ComponentName file and ensure page.tsx imports that one).

## FILE 1 — lib/calculators/<libBase>.ts (pure logic, no React)
- Correct, real finance math specific to THIS tool. Export typed input/result interfaces and a compute function returning the result (or null on invalid input), like computeFutureValue does.
- Where a chart is useful, return a per-period schedule array for plotting.
- Copy these deterministic formatters EXACTLY (fixed locale prevents hydration mismatch):
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
  plus a formatCompact(n) helper like the reference ($1.2M / $3.4k / $123).
  (For inherently non-USD tools — GST, PPF, EPF, NPS, stamp-duty, gold-loan, HRA, CTC, RD, STP, SWP, lumpsum — you MAY use "en-IN" + currency "INR" and the ₹ symbol instead, but keep the locale fixed/deterministic.)

## FILE 2 — <ComponentName>.tsx ("use client")
- Begin with "use client". Interactive widget with labeled inputs (use Input, Label, Select from "@/components/ui/input" and Button from "@/components/ui/button"; icons from "lucide-react" e.g. Calculator, RotateCcw).
- A "Calculate" submit button (compute on submit, NOT auto on every keystroke) and a "Reset" button. Seed an initial result from sensible DEFAULTS like the reference. Include an error state for invalid input.
- A results panel (gradient card) showing the headline number plus a breakdown.
- Where useful, an inline, dependency-free SVG chart/graph (bar, line, area, or donut — choose what fits the tool), styled like the reference GrowthChart (orange theme: #f97316 / #fb923c, zinc grid).
- Use formatUSD / formatCompact from the lib file. No Math.random()/Date.now() during render.

## FILE 3 — page.tsx (server component, mirror the reference structure precisely)
- import type { Metadata } from "next"; Link from "next/link"; { ChevronDown } from "lucide-react"; StaticPage, { H2, P } from "../../components/StaticPage"; JsonLd from "../../components/JsonLd"; { AdSlot } from "../../components/AdSlot"; ShareButtons from "../../components/ShareButtons"; <ComponentName> from "./<ComponentName>"; { getTools, getArticles, getToolBySlug } from "@/lib/queries"; { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo".
- export const revalidate = 3600;
- const PATH = "/calculators/<slug>"; const SELF_SLUG = "<slug>"; a unique DESC string.
- export const metadata: Metadata with unique title (the tool's title), description=DESC, 4-5 keywords, alternates.canonical=PATH, openGraph + twitter (title "<Title> | TopicDrill").
- A FAQ array of 4 UNIQUE, tool-specific Q&A pairs (plain text answers, no special chars that break JSON-LD; spell out symbols like "times"/"divided by" as the reference does).
- Default async page component: const [{ data: tools }, { data: articles }, self] = await Promise.all([ getTools({ type: "calculator", limit: 7 }), getArticles({ limit: 4 }), getToolBySlug(SELF_SLUG) ]); const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6); icon from self?.thumbnail (img) else an appropriate emoji.
- webApp JSON-LD object + breadcrumbSchema([Home, Calculators, <Title>]) + faqSchema(FAQ) inside <JsonLd data={[...]} />.
- <StaticPage title intro active="Calculators" icon wide> ... </StaticPage> containing: the Share row, a grid lg:grid-cols-3 with main col (the widget, an AdSlot, UNIQUE content sections using <H2>/<P> — how it works, an example, things to keep in mind with at least one relevant outbound link and one internal /calculators/... link, then the FAQ <details> block), the Related guides block (articles), a second AdSlot, and the aside (Related calculators sidebar linking to /tools/<slug>, an AdSlot slot="8843302220", and the "Explore more tools" promo). Copy the exact JSX/classNames from the reference but write ORIGINAL prose for this tool.

## QUALITY RULES
- All prose/FAQ/examples must be ORIGINAL and specific to each tool — never reuse future-value's wording.
- The math must be correct. Avoid TypeScript errors: type every prop and state; the component's props/state types must line up with the lib exports.
- Keep import paths exactly as in the reference (page.tsx uses "../../components/..." and "@/lib/...").
- Do not edit any shared/component files; only create the 3 files per tool.

## TOOLS IN THIS BATCH
${list}

Build all of them now. Then return JSON: { "results": [ { "slug", "ok": true/false, "note": short status or error } ] }.`
}

phase('Build')
const out = await parallel(
  batches.map((batch) => () =>
    agent(buildPrompt(batch), {
      label: `build:${batch.map((b) => b.slug).join(',')}`,
      phase: 'Build',
      schema: SCHEMA,
    }).then((r) => (r && r.results) || batch.map((b) => ({ slug: b.slug, ok: false, note: 'agent returned nothing' })))
  )
)

const flat = out.filter(Boolean).flat()
const ok = flat.filter((r) => r.ok)
const failed = flat.filter((r) => !r.ok)
log(`Built ${ok.length}/${flat.length} tools; ${failed.length} reported problems`)
return { built: ok.length, total: flat.length, failed }
