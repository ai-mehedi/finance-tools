import Link from "next/link";
import { ChevronDown } from "lucide-react";
import JsonLd from "./JsonLd";
import { faqSchema } from "@/lib/seo";

// Per-category editorial content turns each hub from a bare tool grid into a
// real topical-authority page: a unique intro, an H2 lead-in, and FAQs (with
// schema). Keyed by category slug. Keep copy specific and genuinely useful.
type Block = { intro: string; body: string; faq: { question: string; answer: string }[] };

const CONTENT: Record<string, Block> = {
  "loans-debt": {
    intro:
      "Whether you are taking on a new loan or trying to clear an existing balance, these calculators show the real cost of borrowing and the fastest route out of debt. Work out monthly payments, total interest, and how much an extra payment each month can save you.",
    body: "Use the EMI and payment calculators before you borrow so the monthly commitment is no surprise, then switch to the payoff, snowball and avalanche tools to build a plan for clearing what you already owe. Comparing two offers? Line them up side by side to see which is genuinely cheaper over the full term.",
    faq: [
      { question: "What is the difference between the debt snowball and avalanche methods?", answer: "The snowball clears your smallest balance first for quick wins and motivation, while the avalanche targets the highest interest rate first to save the most money. The avalanche is mathematically cheaper; the snowball is easier to stick with. Our calculators show both so you can compare." },
      { question: "Does paying extra each month really save much?", answer: "Yes. Every extra dollar goes straight to the principal, so less interest builds the following month. Even a modest regular overpayment can cut months or years off a loan and save a meaningful amount of interest, which the payoff calculator shows in numbers." },
      { question: "How is a monthly loan payment (EMI) calculated?", answer: "It uses the loan amount, the interest rate divided by 12, and the number of months, in the standard amortization formula. Early payments are mostly interest and later ones mostly principal. The EMI calculator does the maths and shows the full breakdown." },
    ],
  },
  "mortgage-home": {
    intro:
      "Buying or refinancing a home is the biggest number most people ever calculate. These tools cover affordability, monthly repayments, refinancing, overpayments and the true cost of a mortgage over its full life.",
    body: "Start with affordability to set a sensible budget, use the repayment and amortization tools to see where your money goes each month, and model overpayments or a refinance to find out how much interest you could avoid. UK buyers can factor in stamp duty and overpayment limits; US buyers can account for PMI and points.",
    faq: [
      { question: "How much house can I afford?", answer: "A common guide is to keep your total housing costs near 28% of gross income and all debts under 36%, but the right number depends on your deposit, rate, other debts and how secure your income is. The affordability calculator turns those inputs into a realistic price range." },
      { question: "Is it worth overpaying my mortgage?", answer: "Overpaying reduces the balance interest is charged on, so it can save a large amount over the term and shorten it. Check your lender allows penalty-free overpayments, and weigh it against higher-rate debt or savings that earn more. The overpayment calculator shows the interest and time saved." },
      { question: "When does refinancing make sense?", answer: "Refinancing usually pays off when the new rate is meaningfully lower and you will stay long enough to recover the closing costs. The refinance calculator compares your current loan with a new one and shows your break-even point in months." },
    ],
  },
  investing: {
    intro:
      "Compounding is the engine behind long-term wealth, and these calculators make it visible. Project how regular contributions, dividends and reinvestment grow over years and decades, and compare strategies before you commit real money.",
    body: "Use the compound interest and SIP tools to see how time and consistency build a portfolio, the dividend and DRIP tools to model income and reinvestment, and the return calculators (CAGR, IRR, annualized) to measure how an investment actually performed. Small assumptions about rate and time make a big difference, so test a few scenarios.",
    faq: [
      { question: "How does compound interest grow my money?", answer: "You earn returns not just on your original money but on the returns it has already earned, so growth accelerates over time. The longer the horizon and the more often it compounds, the larger the effect. The compound interest calculator plots this curve for your figures." },
      { question: "What is dollar-cost averaging?", answer: "It means investing a fixed amount on a regular schedule regardless of price, so you buy more units when prices are low and fewer when high. It removes the pressure of timing the market and smooths your average cost, which the DCA calculator illustrates." },
      { question: "What return rate should I assume?", answer: "Long-run stock market averages have historically been around 7% to 10% before inflation, but returns vary widely year to year and the past does not guarantee the future. Run a conservative and an optimistic scenario rather than relying on a single number." },
    ],
  },
  retirement: {
    intro:
      "Retirement planning is about knowing whether today's saving will be enough for tomorrow. These calculators project your retirement pot, employer matches, pensions and how early you could reach financial independence.",
    body: "Model your 401(k) or pension contributions and employer match to avoid leaving free money on the table, project your retirement corpus against the income you will need, and use the FIRE and Coast FIRE tools to see how close you are to financial independence. Required minimum distributions and Roth conversions are covered too.",
    faq: [
      { question: "How much do I need to retire?", answer: "A common rule of thumb is 25 times your expected annual spending, which supports roughly a 4% withdrawal rate. Your real number depends on lifestyle, other income like a pension or Social Security, and how long the money must last. The retirement calculators turn this into a target." },
      { question: "Should I always get the full employer match?", answer: "Almost always, yes. An employer match is an immediate, guaranteed return on your contribution, which is hard to beat anywhere else. The 401(k) match calculator shows exactly how much you would forfeit by contributing below the match threshold." },
      { question: "What is FIRE and Coast FIRE?", answer: "FIRE is Financial Independence, Retire Early: saving enough that investment returns can cover your living costs. Coast FIRE means you have invested enough early that, without adding another cent, it will grow to fund retirement at a normal age. Both calculators show your timeline." },
    ],
  },
  "savings-deposits": {
    intro:
      "Reaching a savings goal is easier when you can see the path. These calculators show how regular deposits, interest and time combine to grow your balance, whether you are building an emergency fund or saving for a specific target.",
    body: "Use the goal and high-yield savings tools to find out how much to put away each month to hit a target by a date, and the fixed and recurring deposit calculators to project guaranteed-rate growth. Comparing accounts? A small difference in rate compounds into a real gap over a few years.",
    faq: [
      { question: "How much should I save each month?", answer: "Work backwards from your goal: divide the target by the months available, then let interest reduce the amount you need to contribute. The goal savings calculator does this for you and shows how a higher rate or longer timeline lowers the monthly figure." },
      { question: "What is a high-yield savings account?", answer: "It is a savings account paying a much higher interest rate than a standard one, often from online banks. Over time the extra rate compounds into noticeably more money. The high-yield calculator shows the difference against a typical low-rate account." },
      { question: "How big should my emergency fund be?", answer: "A common target is three to six months of essential expenses, more if your income is irregular. Start with a smaller milestone like one month and build from there. The emergency fund calculator sizes the target from your monthly costs." },
    ],
  },
  taxes: {
    intro:
      "Tax can quietly take a large slice of income and gains, so it pays to estimate it in advance. These calculators help you work out income tax, take-home pay, capital gains and sales tax so there are no surprises.",
    body: "Estimate your income tax and effective rate, see your real take-home pay after deductions, and model capital gains before you sell so you can plan the timing. Sales tax, dividend tax and marginal-rate tools round out the set for both US and UK rules where relevant.",
    faq: [
      { question: "What is the difference between marginal and effective tax rate?", answer: "Your marginal rate is the tax on your next dollar of income, the top bracket you reach. Your effective rate is the average across all your income, which is lower because earlier brackets are taxed less. The calculators show both so you do not overestimate your bill." },
      { question: "How is capital gains tax calculated?", answer: "It applies to the profit when you sell an asset for more than you paid, with the rate often depending on how long you held it. Holding longer can mean a lower long-term rate. The capital gains calculator estimates the tax from your buy and sell figures." },
      { question: "Why is my take-home pay lower than my salary?", answer: "Gross salary is reduced by income tax, social security or national insurance, and any pension or benefit deductions. What lands in your account is the net figure. The take-home and paycheck calculators break down every deduction." },
    ],
  },
  budgeting: {
    intro:
      "A budget only works when the numbers are honest, and these tools make them easy to see. Plan where your money goes each month, track spending against income, and measure your overall financial position.",
    body: "Use the monthly budget and 50/30/20 tools to split income between needs, wants and savings, the cash flow calculator to spot whether more is coming in than going out, and the net worth tool to track the bigger picture over time. Small leaks add up, so reviewing categories regularly is where the savings come from.",
    faq: [
      { question: "What is the 50/30/20 budget rule?", answer: "It splits after-tax income into 50% for needs, 30% for wants and 20% for savings and debt repayment. It is a simple starting framework you can adjust to your situation. The 50/30/20 calculator divides your income into the three buckets instantly." },
      { question: "How do I work out my net worth?", answer: "Add up everything you own, such as cash, investments and property, then subtract everything you owe, like loans and credit card balances. The result is your net worth, and tracking it over time shows real progress. The net worth calculator does the maths." },
      { question: "How can I stop living paycheck to paycheck?", answer: "Start by tracking every expense for a month to see where money actually goes, then build a budget that assigns each dollar a job and carves out even a small automatic saving. The budgeting tools make those numbers concrete and easy to adjust." },
    ],
  },
  "salary-income": {
    intro:
      "Knowing what you really earn, after tax and across different pay structures, helps with everything from job offers to budgeting. These calculators convert between hourly, salary and take-home figures.",
    body: "Convert an hourly rate to an annual salary or back again, work out overtime and bonus pay, and see your true take-home after deductions. Weighing a raise or a new offer? Compare the net difference, not just the headline number, so you know what actually changes in your pocket.",
    faq: [
      { question: "How do I convert an hourly wage to an annual salary?", answer: "Multiply your hourly rate by the hours you work per week, then by the weeks you work per year (often 52). The hourly-to-salary calculator does this and can account for unpaid time off so the figure is realistic." },
      { question: "How is overtime pay calculated?", answer: "Overtime is usually paid at a premium, commonly 1.5 times your normal hourly rate for hours beyond a threshold. The overtime calculator works out your total pay from regular and overtime hours at the right multiplier." },
      { question: "How much will a pay raise actually add?", answer: "A raise is taxed, so your take-home increase is smaller than the gross figure, and a higher salary can push part of your income into a higher bracket. The pay raise calculator shows the net monthly difference, not just the gross." },
    ],
  },
  "credit-cards": {
    intro:
      "Credit card interest is some of the most expensive debt there is, so seeing the numbers clearly matters. These calculators show how long a balance will take to clear, what interest costs, and how to pay it off faster.",
    body: "Use the payoff and minimum-payment tools to see how long minimum payments really take and how much faster a fixed monthly amount clears the balance. The interest and utilization calculators show what a balance costs and how your usage affects your credit score, while balance-transfer tools weigh up a 0% offer.",
    faq: [
      { question: "Why does paying only the minimum take so long?", answer: "The minimum payment is set low, often barely above the monthly interest, so very little reduces the principal. A balance can take years and cost more in interest than the original amount. The payoff calculator shows the dramatic difference a fixed payment makes." },
      { question: "What is a good credit utilization ratio?", answer: "Utilization is the share of your available credit you are using, and keeping it under about 30%, ideally lower, is better for your credit score. The utilization calculator shows your ratio and how paying down a balance improves it." },
      { question: "Is a balance transfer worth it?", answer: "A 0% balance transfer can save significant interest if you clear the balance before the promotional period ends, but factor in the transfer fee. The balance transfer calculator compares the cost against staying on your current rate." },
    ],
  },
  insurance: {
    intro:
      "Insurance is about covering the gap your income or savings could not. These calculators help you estimate how much life, health or income protection cover you actually need, rather than guessing.",
    body: "Use the life insurance and human-life-value tools to size cover around your debts, income and dependents, and the income protection and disability calculators to work out how much your earnings are worth protecting. The goal is enough cover to protect the people who rely on you, without paying for more than you need.",
    faq: [
      { question: "How much life insurance do I need?", answer: "A common approach covers your outstanding debts, several years of income for your dependents, and future costs like education, minus existing savings and cover. The life insurance calculator turns those inputs into a coverage figure tailored to your situation." },
      { question: "What is income protection insurance?", answer: "It replaces part of your income if illness or injury stops you working, usually paying a monthly benefit until you recover or retire. The income protection calculator estimates the benefit you would need to cover essential outgoings." },
      { question: "How is human life value calculated?", answer: "It estimates the financial value of your future earnings to your family, based on income, years to retirement and a discount rate. It is one way to size life cover. The human life value calculator does the projection for you." },
    ],
  },
  "business-freelance": {
    intro:
      "Running a business or freelancing means pricing work and watching margins closely. These calculators cover profit, break-even, rates and the core finance numbers that keep a venture healthy.",
    body: "Use the margin, markup and profit tools to price products and services so they actually make money, the break-even calculator to find the sales you need to cover costs, and the freelance and billing-rate tools to set a rate that covers your time, taxes and overheads. Knowing these numbers is the difference between busy and profitable.",
    faq: [
      { question: "What is the difference between margin and markup?", answer: "Markup is the amount added to your cost as a percentage of the cost, while margin is your profit as a percentage of the selling price. They are easy to confuse and give different prices. The margin and markup calculators keep them straight." },
      { question: "How do I calculate my break-even point?", answer: "Divide your fixed costs by the contribution each sale makes after variable costs. The result is how many units, or how much revenue, you need to cover everything before you profit. The break-even calculator works it out from your cost figures." },
      { question: "How should a freelancer set an hourly rate?", answer: "Start from the annual income you want, add taxes and business costs, then divide by the billable hours you can realistically work, which is far fewer than total hours. The freelance rate calculator builds the rate up from those numbers." },
    ],
  },
  crypto: {
    intro:
      "Crypto moves fast and the maths can get complex, so these calculators help you measure profit, plan entries and understand the costs. Work out gains, dollar-cost averaging, fees and portfolio value across coins.",
    body: "Use the profit and ROI tools to measure gains and losses including fees, the DCA and average-cost calculators to plan steady buying, and the gas-fee and impermanent-loss tools to understand the costs of transacting and providing liquidity. Crypto is volatile, so model a few price scenarios rather than a single outcome.",
    faq: [
      { question: "How do I calculate crypto profit?", answer: "Subtract your total buy cost, including fees, from the value at the price you sell, then compare it with what you invested to get the percentage return. The crypto profit calculator handles the buy price, sell price, amount and fees for you." },
      { question: "What is dollar-cost averaging in crypto?", answer: "It means buying a fixed amount on a regular schedule rather than all at once, so your average price smooths out the volatility. It removes the stress of timing a notoriously unpredictable market, and the DCA calculator shows the resulting average cost." },
      { question: "What is impermanent loss?", answer: "It is the difference in value between holding tokens in a liquidity pool versus simply holding them in your wallet, caused by price divergence between the paired assets. The impermanent loss calculator estimates it for a given price change." },
    ],
  },
  "currency-forex": {
    intro:
      "Whether you are travelling, trading or sending money abroad, currency maths matters. These calculators convert currencies and work out forex profit, pip value and margin for traders.",
    body: "Use the converter for quick exchange-rate maths, and the forex profit, pip and margin tools to size positions and measure trades precisely. For active trading, knowing pip value and required margin before you enter a position is essential risk management, not an afterthought.",
    faq: [
      { question: "How is a pip value calculated?", answer: "A pip is the smallest standard price move in a currency pair, and its value depends on the pair, the trade size and your account currency. The pip calculator works out exactly what one pip is worth for your position so you can size risk correctly." },
      { question: "What is margin in forex trading?", answer: "Margin is the deposit your broker requires to open a leveraged position, expressed as a fraction of the full trade size. Higher leverage means less margin but more risk. The forex margin calculator shows the margin needed for a given trade." },
      { question: "How do exchange rates affect conversions?", answer: "The rate sets how much of one currency you get for another, and it moves constantly, while providers often add a margin or fee on top. The currency converter gives the raw conversion so you can spot how much a provider is charging." },
    ],
  },
  "education-student": {
    intro:
      "Education is a major investment, and planning the cost early makes it manageable. These calculators cover student loan repayments, college costs and saving ahead for education.",
    body: "Use the student loan tools to project repayments and payoff timelines, the college cost calculator to estimate the full price including inflation, and the education savings and 529 tools to plan how much to put away now. Starting to save early, even modestly, dramatically reduces what you need to borrow later.",
    faq: [
      { question: "How much should I save for college?", answer: "Estimate the future cost using today's fees plus expected inflation, then work backwards to a monthly saving amount over the years available. The college savings and 529 calculators do this and show how investment growth reduces the amount you need to contribute." },
      { question: "How are student loan repayments calculated?", answer: "They depend on the balance, the interest rate and the repayment term or, for income-driven plans, a share of your income. The student loan calculator projects your monthly payment and how long the balance will take to clear." },
      { question: "Is it better to save or borrow for education?", answer: "Saving ahead avoids interest entirely, so every dollar saved early is worth more than a dollar borrowed later. Most families do both. The calculators let you compare the cost of saving now against the cost of borrowing later." },
    ],
  },
  "inflation-economy": {
    intro:
      "Inflation quietly erodes the value of money over time, and these calculators make that effect visible. See how purchasing power changes, what a future sum is worth today, and how prices grow over the years.",
    body: "Use the inflation and purchasing-power tools to see what your money will really be worth in future, and the present and future value calculators to compare sums across time on a like-for-like basis. Planning for a goal years away? Adjusting for inflation is the difference between a target that works and one that falls short.",
    faq: [
      { question: "How does inflation affect my savings?", answer: "If your savings grow more slowly than prices rise, their real value falls even as the balance goes up. That is why a low-interest account can lose purchasing power. The inflation calculator shows what a sum will be worth in real terms over time." },
      { question: "What is the time value of money?", answer: "It is the idea that a sum today is worth more than the same sum in the future, because today's money can be invested and grow. The present and future value calculators convert between the two so you can compare amounts fairly across time." },
      { question: "How do I adjust a future goal for inflation?", answer: "Increase the target by expected inflation for each year until you need it, so you save toward the real future cost rather than today's price. The future cost calculator does this projection from a current amount and an inflation rate." },
    ],
  },
  "auto-vehicle": {
    intro:
      "A vehicle is a big purchase with costs well beyond the sticker price. These calculators cover car loans, leasing, fuel and the total cost of ownership so you can compare options honestly.",
    body: "Use the car loan and affordability tools to set a sensible budget and monthly payment, the lease-versus-buy calculator to compare the two routes, and the fuel, depreciation and ownership-cost tools to see the real long-term price. The cheapest monthly payment is not always the cheapest car once running costs are included.",
    faq: [
      { question: "Should I lease or buy a car?", answer: "Leasing usually means lower monthly payments but no ownership at the end, while buying costs more monthly but builds equity and is cheaper if you keep the car for years. The lease-versus-buy calculator compares the total cost of each over your time frame." },
      { question: "How much car can I afford?", answer: "A common guide keeps total vehicle costs, including the loan, insurance and running costs, within about 15% to 20% of take-home pay. The car affordability calculator turns your budget and loan terms into a realistic price." },
      { question: "What is the total cost of owning a car?", answer: "It includes the purchase or loan, fuel, insurance, maintenance, tax and depreciation, which is often the largest hidden cost. The ownership cost calculator adds these up so you can compare vehicles on the true price, not just the payment." },
    ],
  },
  "everyday-finance": {
    intro:
      "Some money maths comes up again and again in daily life, and these quick calculators handle it instantly. Work out tips, discounts, percentages and splits without reaching for a spreadsheet.",
    body: "Use the tip and bill-split tools at the restaurant, the discount and percentage calculators while shopping, and the everyday money tools for quick sums whenever they come up. They are simple by design, fast and accurate, so the small decisions take seconds.",
    faq: [
      { question: "How do I calculate a tip quickly?", answer: "Multiply the bill by the tip percentage, for example 0.18 for 18%, and add it to the total, or use the tip calculator to do it instantly and split the result across several people." },
      { question: "How do I work out a discount?", answer: "Multiply the original price by the discount percentage to get the saving, then subtract it from the price to get what you pay. The discount calculator shows both the amount saved and the final price." },
      { question: "How do I calculate a percentage of a number?", answer: "Divide the percentage by 100 and multiply by the number, so 20% of 150 is 0.2 times 150, which is 30. The percentage calculator handles this and percentage-change questions too." },
    ],
  },
};

export default function CategoryContent({ slug, name }: { slug: string; name: string }) {
  const block = CONTENT[slug];
  if (!block) return null;

  return (
    <section className="mx-auto container px-6 pb-14">
      <JsonLd data={faqSchema(block.faq)} />
      <div className="max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          About {name} calculators
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-zinc-600">{block.intro}</p>
        <p className="mt-3 text-[15px] leading-7 text-zinc-600">{block.body}</p>

        <h2 className="mt-10 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          {name} calculators: frequently asked questions
        </h2>
        <div className="mt-5 space-y-3">
          {block.faq.map((f) => (
            <details key={f.question} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-colors open:border-orange-200 open:bg-orange-50/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-zinc-900 [&::-webkit-details-marker]:hidden">
                {f.question}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-open:bg-orange-500 group-open:text-white">
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-7 text-zinc-600">{f.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/calculators" className="font-semibold text-orange-600 hover:text-orange-700">All calculators →</Link>
          <Link href="/blog" className="font-semibold text-orange-600 hover:text-orange-700">Read the money guides →</Link>
        </div>
      </div>
    </section>
  );
}
