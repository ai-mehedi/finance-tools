# TopicDrill SEO & Content Playbook

> **Purpose:** A complete, implementable plan to fix the real problem — *270 calculators that don't rank because the content is generic and templated.* This document is the work guide. Read it top to bottom once, then execute the phased roadmap at the end.
>
> **Markets (in priority order):** 🇺🇸 United States → 🇬🇧 United Kingdom → 🌐 Global English.
> **Stack note:** This is a Next.js 16 / React 19 site. Pages live in `app/calculators/<slug>/page.tsx`, calculation logic in `lib/calculators/*.ts`, content is stored on the `Tool` model (`content`, `faq`, `metaTitle`, `metaDescription`, `keywords`) and rendered server-side. SEO helpers are in `lib/seo.ts`. The AI content writer is `app/api/generate-tool-content/route.ts`.

---

## 0. TL;DR — the one thing to internalize

You are competing in **YMYL (Your Money or Your Life)**, the single hardest category in Google. On YMYL, Google demands the highest possible **E-E-A-T** and ruthlessly suppresses thin, templated, "AI-default" content. Right now every one of your 270 pages looks like the same machine wrote it with the calculator name swapped in. Google sees a **pattern of low-effort pages** and trusts none of them.

**You cannot win head terms** like `mortgage calculator` (DR 90+ incumbents: Bankrate, NerdWallet, Calculator.net, Omnicalculator). **You can win** by doing what one-calculator competitors *can't*: build **topical authority across clusters**, dominate **long-tail + scenario keywords**, and cross-link 270 tools into a single authoritative money-tools entity.

Three levers, in order of impact:
1. **E-E-A-T foundations** (author, methodology, citations, trust pages) — without this, nothing else ranks in YMYL.
2. **Keyword-driven, genuinely-unique content** per page (not the same template) — this fixes "too generic."
3. **Topical clustering + internal linking** — this is your structural advantage over single-calculator sites.

---

## 1. Diagnosis — *why* the current content is too generic

Look at any current page (e.g. `app/calculators/loan-payoff-calculator/page.tsx`). The scaffolding is excellent technically. The **content** is the problem:

| Symptom | Why Google penalizes it (YMYL) |
|---|---|
| Every page follows the identical "what it is / how it works / worked example / tips / FAQ" skeleton | Reads as a **template farm** → "scaled content abuse" signal (March 2024 core + spam updates target exactly this) |
| AI-written 1000 words with no unique data, no real author, no first-hand experience | Fails the **Experience** in E-E-A-T — the newest, heaviest YMYL signal |
| FAQs are generic ("How does X work?") not pulled from real *People Also Ask* | Misses the actual queries; no PAA / featured-snippet capture |
| `keywords` field is 8–12 guessed phrases, not researched clusters | Pages target nothing specific → rank for nothing |
| Outbound links only to `.gov` homepages | Weak — real authority comes from citing *specific* data/methodology pages |
| No author, no "reviewed by", no methodology disclosure, no last-updated | Zero **Trust** signals → fatal in YMYL |
| 270 near-duplicate page shells | **Keyword cannibalization** + crawl-budget dilution; Google indexes a fraction |

**The fix is not "more words." It is *differentiated value per page* + *trust signals* + *targeting real keywords*.**

---

## 2. The opportunity — your unfair advantage

Most finance-calculator competitors are **single-purpose** (one bank's mortgage calc, one tax tool). You have **270 tools spanning 17 categories in one system.** That lets you do three things they structurally cannot:

1. **Topical authority.** Google rewards sites that comprehensively cover a topic. A bank with one calculator can't. You can own *the entire "loans & debt" topic* — every calculator + every supporting guide + every comparison — and become the entity Google associates with that topic.
2. **Scenario & cross-tool linking.** "Loan payoff" → "extra payment" → "refinance" → "debt avalanche" → "debt-to-income." Single tools dead-end. You can build a **journey** and keep users (and link equity) on-site. This is your moat.
3. **Programmatic scale done *right*.** 270 pages is only a liability if they're thin. With researched keywords + unique data per page, it's 270 ranking assets feeding each other.

> **Strategic framing:** Don't try to be Bankrate on `mortgage calculator`. Be the place that owns **`mortgage overpayment calculator uk`**, **`biweekly mortgage payoff calculator`**, **`how much does 1 extra mortgage payment a year save`**, and 50 other long-tail mortgage queries — then let those rank, earn links, and lift the head terms over 12–18 months.

---

## 3. Keyword research — the repeatable process

> ⚠️ **Ahrefs API note:** Your Ahrefs MCP/API tier returns *"Insufficient plan"* — API access is a paid add-on separate from your normal subscription. So run this process **in the Ahrefs web app** (Keywords Explorer), where your seats work. The process below is tool-agnostic; it also works in Semrush, Ubersuggest, or Google Keyword Planner + GSC. **All volume/KD numbers in §5 are estimates — validate them before committing.**

### 3.1 The funnel (run this per category)

```
SEED (your calculator name)
   │
   ├─►  Matching terms        → every query containing the seed phrase
   ├─►  Related terms          → "also rank for" / "also talk about"
   ├─►  Search suggestions     → autocomplete-style long tail
   └─►  Parent Topic           → is there a broader page that captures this?
         │
         ▼
   CLUSTER by SERP overlap (keywords with the same top-10 = same page)
         │
         ▼
   SCORE & PRIORITIZE (formula in 3.4)
         │
         ▼
   MAP one cluster → one page (calculator or blog guide)
```

### 3.2 Ahrefs Keywords Explorer — exact steps

1. **Seed list:** paste your calculator titles from `data/tools.csv` in batches (e.g. all `mortgage-home` slugs as plain phrases: "mortgage calculator", "mortgage refinance calculator", …).
2. Set **country = US** (repeat for **UK**; use **"Global"** volume column for the global view).
3. Open **Matching terms** → apply filters:
   - **KD ≤ 25** (you're a low-DR site; ignore KD 40+ for now)
   - **Volume ≥ 50** (US) / **≥ 30** (UK)
   - **Word count ≥ 3** (long-tail = winnable)
   - Exclude branded terms (bankrate, nerdwallet, etc.)
4. Open **Related terms → "Also rank for"** for each head calculator — these are the *secondary keywords* to weave into one page.
5. Note the **Parent Topic** column. If your `car-loan-calculator` parent topic is `auto loan calculator`, your page should target the parent, not the child.
6. Export to CSV. Build a **keyword map spreadsheet** (template in 3.5).

### 3.3 Find the *real* questions (kills "generic FAQ")

The FAQ on each page must come from real searches, not guesses:
- **Ahrefs:** Matching terms → filter "Questions" toggle, or filter by terms `how, what, why, is, can, does, should, how much, how long`.
- **Google:** type the calculator topic → scrape the **People Also Ask** box and **autocomplete**.
- **AnswerThePublic / AlsoAsked** (free tiers) for question fan-out.
- **Google Search Console** (once you have impressions): *Performance → Queries* shows exactly what you already appear for but rank #11–30. **These are your fastest wins** — improve those pages first.

> Replace the generic FAQ generator with these real questions. A page about `mortgage overpayment calculator` should answer the actual PAA: *"Is it better to overpay mortgage or save?"*, *"What happens if I pay an extra £100 a month on my mortgage?"*, *"Is there a limit on mortgage overpayments?"*

### 3.4 Prioritization score (put this in your spreadsheet)

For each keyword/cluster compute an **Opportunity Score**:

```
Opportunity = (Volume × CTR_by_intent × RPM_weight) / (KD + 1)
```

- **CTR_by_intent:** transactional/tool intent ≈ 0.35; informational ≈ 0.25 (calculators get clicked because the tool *is* the answer).
- **RPM_weight:** US = 1.0, UK = 0.9, Global = 0.5 (reflects ad revenue per visit — finance US RPM is highest).
- Sort descending. **Build the top of the list first.**

**Quick triage tiers:**
- 🟢 **Build now:** KD ≤ 15, Vol ≥ 100, clear tool/transactional intent.
- 🟡 **Build soon:** KD 16–25, or Vol 50–100, or strong RPM.
- 🔴 **Park:** KD > 30 head terms (`mortgage calculator`) — earn these later via authority, don't target directly yet.

### 3.5 Keyword-map spreadsheet template

| page_slug | market | primary_kw | volume | KD | intent | parent_topic | secondary_kws (3–6) | paa_questions (4–6) | unique_angle | status |
|---|---|---|---|---|---|---|---|---|---|---|
| mortgage-overpayment-calculator | UK | mortgage overpayment calculator | 8k | 12 | transactional | mortgage overpayment | overpay mortgage calculator, lump sum overpayment, monthly overpayment | "is it worth overpaying?", "limit on overpayments?" | Show interest saved + years saved + ERC warning | 🟢 |

> **This spreadsheet is the single source of truth.** Every page rewrite/build pulls its `primary_kw`, `secondary_kws`, `paa_questions`, and `unique_angle` from a row. No more guessing.

---

## 4. Search intent → page type (don't build the wrong page)

| Intent | Example query | Right page | Notes |
|---|---|---|---|
| **Tool / transactional** | "mortgage payoff calculator" | **Calculator page** (`app/calculators/...`) | The tool *is* the content. Keep it above the fold, fast, no login. |
| **Commercial investigation** | "debt snowball vs avalanche" | **Comparison guide** (blog) that *embeds/links* the relevant calculators | High conversion; link to both calculators |
| **Informational** | "what is compound interest" | **Blog guide** (`app/blog/...`) linking to the calculator | Feeds authority + internal links to the tool |
| **Definition** | "APR meaning" | **Glossary entry** (`app/glossary`) | Cheap to scale, builds topical breadth |

**Rule:** never force a calculator page to rank for a pure informational query, or vice-versa. Match the page format to what already ranks (look at the current top 10 — if they're all articles, you need an article).

---

## 5. Keyword landscape by category (estimates — validate in Ahrefs)

> Volumes are **US monthly, approximate** unless marked. KD = est. keyword difficulty. ⭐ = priority to build/rewrite first. These are starting seeds, not the full list — expand each via the §3 funnel.

### 🏠 Mortgage & Home (your `mortgage-home` — 22 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| mortgage payoff calculator ⭐ | 30k | 30 | US | head — earn via authority |
| biweekly mortgage calculator ⭐ | 12k | 18 | US | winnable long-tail |
| mortgage overpayment calculator ⭐ | 9k | 12 | **UK** | low KD, your edge |
| extra mortgage payment calculator | 8k | 20 | US | scenario tool |
| mortgage refinance calculator | 20k | 35 | US | park |
| how much house can i afford | 60k | 45 | US | target via affordability tool + guide |
| stamp duty calculator | 100k+ | 40 | **UK** | huge UK term; consider building |
| pmi calculator | 8k | 22 | US | you have it |

### 💳 Loans & Debt (`loans-debt` — 24 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| loan payoff calculator ⭐ | 10k | 22 | US | you have it |
| debt snowball calculator ⭐ | 9k | 16 | US | low KD ⭐ |
| debt avalanche calculator | 4k | 14 | US | pair w/ snowball |
| extra payment calculator | 6k | 18 | US | |
| personal loan calculator | 25k | 38 | US | park |
| debt to income calculator ⭐ | 12k | 20 | US | |
| debt consolidation calculator | 8k | 28 | US | |

### 📈 Investing (`investing` — 32 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| compound interest calculator | 200k+ | 55 | Global | park head; win modifiers |
| daily compound interest calculator ⭐ | 15k | 20 | US | modifier win |
| investment calculator | 70k | 50 | US | park |
| dividend calculator ⭐ | 18k | 25 | US | |
| sip calculator | 200k+ | 40 | India* | *low RPM, deprioritized per your markets |
| dca calculator / dollar cost averaging ⭐ | 6k | 15 | US | low KD |
| coast fire calculator ⭐ | 4k | 10 | US | niche, very winnable ⭐ |

### 🧓 Retirement (`retirement` — 18 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| 401k calculator | 50k | 45 | US | park |
| 401k match calculator ⭐ | 8k | 18 | US | winnable |
| roth ira calculator | 30k | 40 | US | |
| coast fire / fire calculator ⭐ | 12k | 16 | US | community-driven, linkable ⭐ |
| rmd calculator | 25k | 35 | US | seasonal (Dec) |
| pension calculator | 40k | 38 | **UK** | strong UK |

### 💰 Taxes (`taxes` — 20 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| paycheck calculator | 100k+ | 50 | US | park head |
| capital gains tax calculator ⭐ | 20k | 30 | US/UK | |
| marginal tax rate calculator ⭐ | 6k | 18 | US | |
| effective tax rate calculator | 5k | 16 | US | ⭐ low KD |
| dividend tax calculator | 8k | 22 | **UK** | strong UK |
| gift tax / estate tax calculator | 6k | 25 | US | seasonal |

### 💵 Salary & Income (`salary-income` — 16 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| hourly to salary calculator ⭐ | 20k | 18 | US | ⭐ |
| salary to hourly | 25k | 22 | US | |
| take home pay calculator | 30k | 40 | **UK** | UK "PAYE" angle |
| overtime calculator ⭐ | 12k | 18 | US | |
| pay raise calculator ⭐ | 8k | 14 | US | ⭐ low KD |

### 🪙 Crypto (`crypto` — 12 tools)
| Keyword | ~Vol | KD | Market | Note |
|---|---|---|---|---|
| crypto profit calculator ⭐ | 15k | 20 | Global | |
| bitcoin profit calculator | 12k | 22 | Global | |
| crypto tax calculator | 25k | 45 | US | park (Koinly etc. dominate) |
| impermanent loss calculator ⭐ | 5k | 12 | Global | niche ⭐ |
| dca crypto calculator ⭐ | 6k | 14 | Global | ⭐ |

> **Pattern to exploit everywhere:** the **head term** (KD 40–55) is parked; the **modifier/scenario/geo variants** (KD 10–25) are your 🟢 build list. Modifiers that consistently lower KD: `biweekly`, `extra payment`, `overpayment`, `daily`, `monthly`, `vs`, `by state`, `uk`, `with extra`, `payoff`, `early`, `2026`.

---

## 6. E-E-A-T for YMYL — the trust foundation (do this FIRST)

**This is non-negotiable and gates everything.** Finance content without trust signals does not rank in 2026, no matter how good the copy. Build these once, apply site-wide.

### 6.1 Author & reviewer system (highest priority)
- Create **real author entities** with bios, photo, credentials, and a dedicated `/author/<name>` page. Even one named editor with a credible finance bio beats anonymous content.
- Add **"Written by X · Reviewed by Y"** to every tool and article. Your `Article` model already supports `author` — extend `Tool` content rendering to show an author/reviewer byline.
- Add `author` (Person, with `url` to the author page and `sameAs` LinkedIn) and a `reviewedBy` field to your schema (see 6.4).
- Link author `sameAs` to LinkedIn / professional profiles → real entity in Google's Knowledge Graph.

### 6.2 Trust pages (build/upgrade these)
- **About** — who runs TopicDrill, why, real org info. You have `app/about`; make it specific and credible.
- **Editorial policy / How we review** — state your fact-checking and update process. Massive YMYL signal.
- **Methodology page per calculator type** — "How we calculate" (the formula, assumptions, sources). You already have pure logic in `lib/calculators/*` — *expose it as a methodology box on the page.* This is a unique trust asset competitors lack.
- **Contact** with real details (you have `app/contact`).
- **Disclaimer** — "not financial advice" (you have `app/disclaimer`) — keep, it's a trust signal not a negative.

### 6.3 On-page trust signals (every calculator)
- **"Last updated: <date>"** visible on page + `dateModified` in schema. Refresh quarterly.
- **"How we calculate this"** collapsible box with the actual formula and assumptions (pull from the `lib/calculators` doc comments — they're already well-written!).
- **Cite specific authoritative sources** — not `irs.gov` homepage, but the *specific* IRS topic page, CFPB methodology, Bank of England base rate page, etc.
- **Show your working** — display the formula and a worked example with real numbers (you partly do this; make it data-specific per page).

### 6.4 Upgrade your schema (`lib/seo.ts`)
Your schema is good. Add:
- On calculator pages, also emit **`SoftwareApplication`** or keep `WebApplication` but add `aggregateRating` *only if you genuinely collect ratings* (don't fake it — Google penalizes fake review markup).
- Add **`author` / `reviewedBy` (Person)** and **`dateModified`** to calculator pages, not just articles.
- Add **`HowTo`** schema for "how to use this calculator" where genuinely step-based.
- Populate `Organization.sameAs` (currently `[]`) with your real social/brand profiles — it's empty, which weakens the entity.
- Keep `FAQPage` schema **only** for FAQs that are genuinely Q&A and visible on page (Google restricts FAQ rich results, but the markup still aids understanding).

---

## 7. The page blueprint — what a *non-generic* calculator page contains

Replace the one-size template with this. Every section must be **specific to that calculator's topic and keyword cluster** — that's the entire fix for "too generic."

```
┌─ ABOVE THE FOLD ─────────────────────────────────────────┐
│ H1 = primary keyword (exact)                              │
│ 1-line value prop tied to the actual query intent         │
│ THE CALCULATOR (interactive, fast, no scroll to find)     │
│ Last updated: <date> · Written by <author> · Reviewed by  │
└──────────────────────────────────────────────────────────┘
│ Result explainer — interpret THIS user's output, not generic
│ "How we calculate" box — the real formula + assumptions (from lib/calculators)
│ Worked example — REAL numbers specific to this tool (not "say you owe $25k" boilerplate reused everywhere)
│ Topic-specific deep content — the part that must be UNIQUE:
│   • factors that change the result (specific to this calc)
│   • market/regional nuance (US vs UK rules where relevant)
│   • common mistakes specific to THIS scenario
│   • when to use this vs a related tool (link them)
│ Comparison table or data — give something competitors don't (benchmarks, rate ranges, scenario grid)
│ FAQ — from real PAA (§3.3), answered in 40–60 words (snippet-optimized)
│ Related calculators (cluster links) + related guides (blog)
│ Cited sources (specific .gov / authoritative pages)
```

**Uniqueness test before publishing:** *"Could I paste this paragraph onto a different calculator page and have it still make sense?"* If yes → it's generic, rewrite it. Every page needs **≥40% content that only applies to that one tool.**

### What makes it unique (concrete tactics)
- **Real data per topic:** current rate ranges, contribution limits, tax brackets, typical values — with a cited source and a last-updated date.
- **Scenario grids:** e.g. payoff page shows a small table of "extra $50 / $100 / $200 → years & interest saved." Generated from your *own* `lib/calculators` logic — no competitor has your exact numbers.
- **Geo-specific sections:** US (IRS/401k/FICO) vs UK (HMRC/ISA/PAYE) where the calculator applies to both.
- **First-hand framing:** "In practice, the mistake we see most is…" — the *Experience* signal.

---

## 8. Rewrite the AI content generator (fixes generic at scale)

Your generator (`app/api/generate-tool-content/route.ts`) is the *source* of the generic problem: it gets only `title + type + description` and produces the same skeleton every time. **Feed it the keyword research and force uniqueness.**

### 8.1 Pass research into the prompt
Extend the request body (and the admin "generate" UI) to include, per tool, from your keyword-map spreadsheet (§3.5):
- `primaryKeyword`, `secondaryKeywords[]`, `paaQuestions[]`, `uniqueAngle`, `market` (us/uk/global), and any `dataPoints` (rate ranges, limits) you want cited.

### 8.2 Improved system prompt (drop-in replacement for `SYSTEM`)
```
You are a credentialed personal-finance editor writing YMYL content that must pass Google's
highest E-E-A-T bar. You write from first-hand experience: you reference concrete numbers,
realistic scenarios, and the specific rules of the stated market (US or UK).

Hard rules:
- NO generic, swappable sentences. Every paragraph must be specific to THIS calculator and its
  keyword. If a sentence could appear on a different calculator's page, rewrite it.
- Demonstrate Experience: include at least one "in practice / a common mistake" observation.
- Be accurate and current for the stated market. Use the provided data points; never invent
  statistics, limits, or rates.
- Cite 2–4 SPECIFIC authoritative pages (not homepages): the exact IRS topic, CFPB guide, HMRC
  page, gov.uk page, Investor.gov article, or Federal Reserve data relevant to the topic.
- Plain language, varied sentence length, second person where natural.
- Never use em dashes. Never use AI cliches (delve, unlock, leverage, navigate the landscape,
  in today's fast-paced world, robust, seamless).
```

### 8.3 Improved user prompt (key additions)
```
Calculator: "${title}" (${kind}) · Market: ${market}
PRIMARY KEYWORD (use in H1 sense, first 100 words, and naturally 3–5x): ${primaryKeyword}
SECONDARY KEYWORDS (weave in naturally, do not stuff): ${secondaryKeywords.join(", ")}
UNIQUE ANGLE (this must shape the whole article): ${uniqueAngle}
VERIFIED DATA POINTS you may cite (do not invent others): ${dataPoints}

Answer these EXACT questions as the FAQ (these are real searches), 40–60 words each:
${paaQuestions.map((q,i)=>`${i+1}. ${q}`).join("\n")}

Content requirements:
- Open with a 2–3 sentence intro that uses the primary keyword and states who this calculator is
  for and what decision it helps with — specific to ${primaryKeyword}, not generic.
- Include a "How this is calculated" section stating the actual formula in words + a worked
  example using realistic ${market} numbers.
- Include one section unique to this topic per the UNIQUE ANGLE.
- Include a short comparison or scenario table relevant to the topic.
- 900–1300 words. Semantic HTML only (h2,h3,p,ul,ol,li,strong,em,a,blockquote,table,...).
- metaTitle <=60 chars including "${primaryKeyword}". metaDescription <=155 chars, benefit-led,
  including the primary keyword.
```

### 8.4 Model & quality
- Consider switching `MODEL` from `gpt-4o`. For YMYL accuracy, a stronger reasoning model produces fewer hallucinated numbers. **Whichever model you use, a human must fact-check every numeric claim** — wrong finance numbers destroy trust and rankings.
- **Always human-edit** before publish. AI draft → editor adds the real first-hand line, verifies numbers, tightens. Pure-AI-published YMYL is the highest-risk content there is.
- Generate in **batches by cluster**, not alphabetically, so related pages cross-reference correctly.

---

## 9. Topical clustering & internal linking (your structural moat)

Single-calculator competitors can't do this. You can. Build **hub → spoke** structures:

```
CATEGORY HUB  (app/categories/<slug>)  e.g. "Loans & Debt"
  ├─ pillar guide (blog): "How to Pay Off Debt Faster"
  ├─ calculator: loan payoff
  ├─ calculator: debt snowball  ──┐
  ├─ calculator: debt avalanche ──┤ cross-link these as "compare"
  ├─ calculator: debt-to-income   │
  └─ comparison guide: "snowball vs avalanche" ──┘ links both calcs
```

**Internal linking rules:**
1. Every calculator links to **3–6 sibling calculators** in the same cluster (you already render "Related calculators" — make it *cluster-aware*, not random `limit: 7`).
2. Every calculator links **up** to its category hub and to **1–2 supporting blog guides**.
3. Every blog guide links **down** to the relevant calculator(s) with descriptive anchor text (the `primary_kw` of the target).
4. Category hubs are **real pages with intro content**, not bare grids — they target the category head term (`loan calculators`, `retirement calculators`).
5. Use **descriptive anchor text = target's primary keyword**, never "click here."

> **Action:** add a `cluster` or `relatedSlugs` field to the `Tool` model (or derive clusters from `categories` + the keyword map) so "Related calculators" shows true siblings, not random tools. This single change compounds ranking across the whole category.

---

## 10. Supporting blog content (feeds the calculators)

You already have `data/blog-content-plan.csv` (55 informational topics) — good. Align it to clusters:
- Each blog guide must **link to ≥1 calculator** with keyword-rich anchor text.
- Target **informational** intent (the "what is / how to / vs" queries calculators can't rank for).
- Blog earns links and topical breadth → lifts the whole domain → lifts calculators.
- Prioritize guides that map to your 🟢 calculator clusters first (debt, mortgage overpayment, FIRE, compound interest).

**Content cadence suggestion:** for every cluster you build/rewrite, publish 1 pillar guide + 1–2 comparison guides. That's the link-and-authority engine.

---

## 11. Technical SEO checklist

Mostly in good shape (Next 16, ISR `revalidate`, schema, sitemap, robots). Verify/add:

- [ ] **Don't mass-submit thin pages.** Index in waves as you upgrade them. Submitting 270 generic pages at once invites a "thin content" pattern flag. Improve → then request indexing.
- [ ] **Canonical** correct on every page (you set `alternates.canonical` — verify no `/tools/<slug>` vs `/calculators/<slug>` duplication; you have *both* route patterns — pick the canonical one and 301 the other, or canonical-tag it). **This duplicate-URL issue is likely splitting your ranking signals — fix early.**
- [ ] **One URL per calculator.** Right now a tool may be reachable at `/calculators/<slug>` *and* `/tools/<slug>`. Choose one, redirect the other.
- [ ] **Core Web Vitals:** calculator is client JS — ensure it's not blocking LCP; lazy-load below-fold ads (`AdSlot`), keep the tool itself instant.
- [ ] **Ads vs content balance:** you have 3+ `AdSlot`s per page. Too many ads above/within content hurts page-experience signals in YMYL. Keep the top of page clean (tool first, ads lower).
- [ ] **Sitemap segmentation:** split sitemaps (calculators, blog, categories) so GSC coverage is diagnosable per type.
- [ ] **Breadcrumbs** (you have `breadcrumbSchema`) — ensure visible breadcrumbs too, not just markup.
- [ ] **AI Overviews / AEO:** structure answers as concise, citable, question-led blocks (your FAQ + "how it works" with clear definitions). Being cited in AI Overviews increasingly drives YMYL visibility.
- [ ] **Hreflang** if you publish distinct US vs UK versions of the same calculator (e.g. tax tools) — otherwise they cannibalize. If one page serves both, segment with on-page sections instead.
- [ ] **`Organization.sameAs`** populated (currently empty in `lib/seo.ts`).

---

## 12. Programmatic-SEO guardrails (avoid the penalty)

You're doing programmatic SEO. Google allows it *if pages have genuine unique value*; it penalizes **doorway/scaled-content abuse**. Stay on the right side:

- ✅ Each page solves a distinct user query with unique data → **good** programmatic (like Zillow per-address, NerdWallet per-tool).
- ❌ Same template, swapped nouns, no unique value → **doorway pages** → de-indexed.
- **The 40% uniqueness rule** (§7) is your guardrail.
- Don't generate pages for keywords with **no search demand** — a calculator nobody searches for is just crawl-budget waste. Prune tools with zero validated volume, or `noindex` them.
- **Quality > quantity of indexed pages.** 120 genuinely-useful indexed calculators beat 270 thin ones. Be willing to consolidate or noindex the weakest.

---

## 13. Measurement & iteration

- **Google Search Console is your compass.** Track per page: impressions → clicks → avg position.
- **Striking-distance report:** queries ranking #8–20. Improving these (better title, more specific content, internal links) is the **fastest traffic win** — do this weekly.
- **Content decay / refresh:** update `dateModified`, refresh numbers quarterly (especially tax/limit-based tools annually when brackets change).
- **Track by cluster,** not just by page — is the whole "loans" topic gaining authority?
- **Leading indicators (months 1–3):** indexation rate, impressions growth. **Lagging (months 4–12):** clicks, rankings, links.
- Set realistic expectations: **YMYL + new/low-authority domain = 6–12 months** to meaningful traffic. The foundation work (E-E-A-T) shows up as a step-change, not day one.

---

## 14. Phased roadmap (the work guide)

### Phase 0 — Foundations (Week 1–2) · *gates everything, do first*
1. Build the **author/reviewer system** (real bio, `/author` page, byline rendering, schema). → `models/`, `lib/seo.ts`, page templates.
2. Build/upgrade **About, Editorial Policy, Methodology** trust pages.
3. Add **last-updated date + "how we calculate" box** to the calculator template (pull formula from `lib/calculators/*` doc comments).
4. **Fix the duplicate URL issue** (`/tools/<slug>` vs `/calculators/<slug>`) — pick canonical, redirect the other.
5. Populate `Organization.sameAs`, add `author`/`dateModified` to calculator schema.

### Phase 1 — Pilot cluster (Week 3–4) · *prove the model on ONE category*
6. Pick **one high-opportunity cluster** (recommend **Loans & Debt** or **Mortgage-UK overpayment** — low KD, clear intent).
7. Run the **§3 keyword research** for that cluster; fill the keyword-map spreadsheet.
8. **Rewrite every calculator in the cluster** using the §7 blueprint + §8 upgraded generator (with research fed in) + human editing.
9. Make "Related calculators" **cluster-aware** (§9).
10. Write **1 pillar guide + 1–2 comparison guides** for the cluster (§10), interlinked.
11. Request indexing for the upgraded cluster only. Measure for 3–4 weeks.

### Phase 2 — Scale the pattern (Month 2–4)
12. Roll the proven pattern cluster-by-cluster, **priority order by Opportunity Score** (§3.4): likely Mortgage → Retirement (FIRE/401k-match) → Salary → Taxes → Crypto.
13. Batch-regenerate content per cluster with the improved generator; human-edit; index in waves.
14. Build category hubs into real authority pages as you go.
15. **Prune/noindex** zero-demand tools.

### Phase 3 — Authority & links (Month 3+, ongoing)
16. Publish supporting blog guides continuously (link to calculators).
17. Earn links: data studies from your own calculator aggregates ("average X across scenarios"), free-tool embeds, HARO/digital-PR for finance journalists, partnerships.
18. Weekly **striking-distance** optimization from GSC.
19. Quarterly content refresh + annual tax/limit updates.

---

## 15. First 30 days — concrete action list

1. ☐ Stand up the **author + reviewer** system and bylines (Phase 0.1).
2. ☐ Add **"How we calculate" + last-updated** to the calculator template.
3. ☐ Resolve the **`/tools` vs `/calculators` duplicate URLs** (canonical + 301).
4. ☐ Create the **keyword-map spreadsheet** and research **one pilot cluster** in the Ahrefs web app.
5. ☐ Pull **real PAA questions** for the pilot cluster (replace generic FAQs).
6. ☐ Upgrade `generate-tool-content` to accept `primaryKeyword / secondaryKeywords / paaQuestions / uniqueAngle / market` and use the §8 prompts.
7. ☐ **Rewrite + human-edit** the pilot cluster's calculators to the §7 blueprint (apply the 40% uniqueness test).
8. ☐ Make "Related calculators" cluster-aware.
9. ☐ Publish 1 pillar + 1 comparison guide for the pilot cluster, fully interlinked.
10. ☐ Set up **GSC**, segment sitemaps, request indexing for the upgraded cluster only, and start the weekly striking-distance habit.

---

## Appendix A — Modifier cheat sheet (lowers KD, finds long-tail)

Append these to any head calculator to find winnable variants:
`biweekly · extra payment · overpayment · early payoff · daily · monthly · weekly · with extra · vs · 2026 · by state · uk · how much · how long · lump sum · refinance · payoff · early · simple · reverse`

## Appendix B — Authoritative sources to cite (specific, not homepages)
- **US:** IRS topic pages (brackets, contribution limits), CFPB guides, Investor.gov, SEC.gov, Federal Reserve (FRED data), SSA.gov, Bureau of Labor Statistics.
- **UK:** GOV.UK (stamp duty, tax bands), HMRC, Bank of England (base rate), Money Helper, FCA.
- **Use the *specific* page** (e.g. the exact "401(k) contribution limits" IRS page), cite it with the figure, and add a last-updated date.

## Appendix C — Pre-publish checklist (per page)
- ☐ Primary keyword in H1, first 100 words, title, meta description
- ☐ ≥40% content unique to this tool (uniqueness test passed)
- ☐ "How we calculate" formula + market-specific worked example
- ☐ FAQ from real PAA, 40–60 word answers
- ☐ Author + reviewer byline + last-updated date
- ☐ 2–4 specific authoritative citations
- ☐ 3–6 cluster sibling links + 1–2 blog guide links + category hub link
- ☐ No AI cliches, no em dashes, numbers fact-checked by a human
- ☐ Schema: WebApplication + author + dateModified (+ FAQ if visible)

---

---

## Appendix D — Competitor teardown: Omnicalculator (and what to copy)

Omnicalculator is the clearest model for an all-in-one calculator portal. What makes it work, and where it leaves a gap you can exploit:

**Their strengths (copy these):**
1. **Category hubs with live counts.** 14 categories, each showing its calculator count (Finance alone = 600+). The count signals depth/authority and invites the click. → *Done on our homepage: category grid now shows `{n} tools` per category.*
2. **Popular-calculators block with 1–2 sentence descriptions.** Each card explains what the tool does, not just its name. → We have `FinancialTools`; make sure each has a real one-line description.
3. **Dense internal linking.** ~35+ internal links on the homepage alone — many paths into the catalogue for users and crawlers. → *Improved: homepage HomeContent adds a 17-category link grid + trust/FAQ links.*
4. **"Featured in" press strip** (Guardian, NYT, Forbes, CNN…). This is their single strongest authority asset. → **Gap for us — pursue media mentions / digital PR and add a logo strip once earned.**
5. **Plain-language, problem-framed value prop** ("Should I rent or buy?") rather than feature lists.
6. **Editorial-policies link** in the footer (content governance). → *Done: we now have `/editorial-policy`.*

**Their gap (your opening):** Omni shows **no author/reviewer bylines** on its finance calculators — a YMYL weakness. We now have per-page bylines + reviewer + dateModified + a methodology box. Lean into genuine E-E-A-T; it's where a smaller site can out-signal them on *Your-Money* topics.

### Issues found & fixed in this pass
| Issue | Fix shipped |
|---|---|
| `/tools` and `/calculators` listed near-identical sets (self-cannibalization) | `/tools` listing now `canonical → /calculators`; removed `/tools` from sitemap |
| Sitemap contained `/blog?category=` query URLs (non-canonical, low value) | Removed from sitemap (they already canonical to `/blog`) |
| Thin homepage (mostly interactive components, little indexable text) | Added `HomeContent`: intro copy, category hub w/ counts + descriptions, E-E-A-T trust text, FAQ + FAQ schema |
| `/about` and `/editorial-policy` missing from sitemap | Added |

### Still open (next)
- **Category hub pages** (`/categories/<slug>`) should become real authority pages: intro copy + the cluster's calculators + links to the cluster's blog guides (today they're mostly grids). This is the biggest remaining on-site lever and pairs with the §9 clustering plan.
- **Press / "featured in"** trust strip — requires earning mentions first (digital PR).
- **Pagination canonicals** on `/calculators?page=N` self-reference page 1; deep pages are still discoverable via the sitemap, so low priority, but worth making self-referential later.
- **Per-calculator one-line descriptions** audited for uniqueness (feeds both cards and meta descriptions).

---

*Built for TopicDrill. Markets: US › UK › Global English. Revisit this playbook each quarter and update the keyword map as GSC data comes in.*
