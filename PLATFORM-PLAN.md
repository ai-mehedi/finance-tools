# TopicDrill — Platform Vision & Roadmap

> How to turn a 280-calculator site into the best free finance-tools platform.
> Pairs with `SEO.md` (content/ranking playbook) and `ADVANCED-CALCULATORS.md`
> (per-tool feature checklist). This file is the **strategy + sequencing**.
>
> Site: topicdrill.com · Markets: US → UK → Global English · Model: free, fast,
> ad + affiliate supported, SEO-driven.

---

## 0. The core principle

The site's strength is **anonymous, fast, SEO-driven tools**: a user lands from
Google on one calculator, gets the answer, and leaves. Every decision should
protect that flow. Add value **without adding friction**. This single principle
decides most of the questions below (including login).

---

## 1. Verdict on Dashboard / Login / Accounts

**Do NOT build login or a dashboard now.** Reasons, specific to this site:

- Traffic is one-and-done from search. A login wall fights the exact behaviour
  that ranks and converts.
- Accounts add real cost with little SEO upside: auth security, GDPR/privacy,
  password resets, support, more attack surface.
- You can get ~90% of "personalization" with **zero login**:
  - ✅ **Shareable URLs** — a saved scenario *is* a link (already shipped).
  - ✅ **Recently used** — already in `localStorage` (`CalcActions`).
  - ➕ **Saved calculations + favourites** — also `localStorage`, no account.

**When a dashboard becomes justified:** only as a later pivot (Phase 5+), *if*
analytics show meaningful return visits and you choose to become a Mint-style
personal-finance manager (net worth + debts + goals in one view). That is a
different, bigger product. Build it on evidence, behind **optional** login,
never as a wall.

---

## 2. Phased roadmap (priority order)

### Phase 1 — Make the tools world-class *(in progress)*
- Tier-2 advanced features per `ADVANCED-CALCULATORS.md` (amortization schedules,
  A/B compare, multi-debt input, withdrawal charts, advanced inputs).
- Tier-1 universal layer (shareable URL, what-if `ScenarioGrid`, copy-link) where
  it adds value — **not** on trivial Tier-3 tools.
- localStorage "Saved calculations" + favourites (no login).
- **Reusable toolkit already built:** `lib/calc-url.ts`,
  `app/components/calc/{useCalcState,ScenarioGrid,exportCsv,AmortizationTable}`.
- **Flagships done:** `compound-interest-calculator`, `mortgage-calculator`.

### Phase 2 — Win the new search (AEO / GEO / LLM)  ← highest leverage, not yet done
- Add `HowTo`, `Speakable`, and `Dataset` schema to calculator pages.
- "Answer-first" block: a 40–60 word extractable answer at the top of each page.
- Publish `llms.txt` so AI engines know what to cite.
- Fix the E-E-A-T gaps: hardcoded `dateModified`, empty `reviewer` and
  `Organization.sameAs` in `lib/seo.ts`.
- Goal: be **cited in AI Overviews / ChatGPT / Perplexity**, not skipped.

### Phase 3 — Authority & content moat
- Turn category hubs (`/categories/<slug>`) into real authority pages, not bare grids.
- Pillar guides + comparison guides + glossary, each cross-linked to the relevant
  calculators with keyword-rich anchors (the journey single-tool sites can't build).

### Phase 4 — Revenue beyond ads  ← the real money in finance
- **Affiliate / lead-gen** on relevant tools: refinance, credit cards, personal
  loans, insurance quotes. Finance RPMs are the highest online — this dwarfs
  display ads. Place contextual, clearly-labelled offers.
- **Embeddable widgets** — the embed code already exists in `CalcActions`; promote
  it. Other sites embedding your calculators = backlinks + reach.
- Optional **premium**: ad-free + PDF/Excel export + saved dashboards.

### Phase 5 — Engagement & retention
- **PWA / installable**, offline-capable, instant.
- Email digests, rate-change alerts (mortgage/savings), "your saved scenarios."
- This is where **optional** accounts could finally earn their keep.

### Always-on — Performance & trust
- Keep the tool itself instant (protect LCP); lazy-load ads and below-fold content.
- Core Web Vitals green on every template.
- Author/reviewer bylines, "how we calculate" methodology boxes, specific
  authoritative citations (IRS/HMRC/Fed/BoE pages, not homepages).

---

## 3. Feature ideas bank (pull from these per tool/page)

**Per-calculator (advanced mode)**
- Shareable URL state · live results · copy-link
- What-if scenario grid · A/B compare · sensitivity sliders
- Amortization / year-by-year schedule · CSV + PDF + print export
- Result explainer ("what this means for you") · presets/examples · inline tooltips
- Advanced-input toggle (taxes, inflation, fees, extra payments)
- Chart for any over-time output

**Cross-tool / platform**
- Saved calculations + favourites (localStorage) · recently used (done)
- "Related calculators" made cluster-aware (true siblings, not random)
- Money-journey linking (loan payoff → refinance → DTI → debt avalanche)
- Global search with autocomplete (exists — keep sharp)

**Discovery / SEO / AEO**
- Answer-first blocks · FAQ from real People-Also-Ask · HowTo/Speakable/Dataset schema
- llms.txt · segmented sitemaps · breadcrumbs · hreflang for US/UK variants

**Trust (YMYL)**
- Author + reviewer entities · methodology pages · last-updated dates
- Specific citations · disclaimer (keep) · editorial policy (have)

**Monetization**
- Contextual affiliate/lead-gen (loans, cards, insurance) · embeddable widgets
- Display ads (keep top of page clean) · optional premium tier

**Retention**
- PWA install · email digests · rate alerts · saved-scenario reminders

---

## 4. What NOT to build (decided)
- **Login wall / required accounts** — fights the SEO model. Optional only, later.
- **Live market data** (crypto/currency/today's rates) — needs a paid API + upkeep;
  only the converter tools truly need it. Everything else is pure math.
- **Personalized financial advice** — regulated YMYL risk.
- **Heavy PFM dashboard** — only as an evidence-based Phase 5+ pivot.

---

## 5. Recommended next moves
1. Re-scope the calculator work to the **Tier-2 list** (real advanced features),
   cluster by cluster — start with **Loans & Debt** (amortization engine is built).
2. Then **Phase 2 (AEO/GEO/LLM)** — biggest untapped traffic lever.
3. Then **Phase 4 affiliate hooks** — biggest untapped revenue lever.
4. Revisit accounts/dashboard only when return-visit data justifies it.

*Revisit quarterly. Traffic + revenue levers (AEO, affiliate) beat features no one
asked for (dashboards). Build on evidence.*
