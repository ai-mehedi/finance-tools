// Seed header + footer navigation into MongoDB.
// Run: node --env-file=.env.local scripts/seed-nav.mjs
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const schema = new mongoose.Schema(
  {
    title: String,
    url: { type: String, default: "#" },
    location: { type: String, default: "header" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "NavMenu", default: null },
    order: { type: Number, default: 0 },
    target: { type: String, default: "_self" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);
const NavMenu = mongoose.model("NavMenu", schema);

const HEADER = [
  { title: "Tools", url: "/tools" },
  { title: "Calculators", url: "/calculators" },
  { title: "Categories", url: "/categories" },
  { title: "Blog", url: "/blog" },
  { title: "Guides", url: "/guides" },
  { title: "Resources", url: "/resources" },
];

const FOOTER = [
  {
    heading: "Top Categories",
    links: [
      { title: "Budgeting Tools", url: "/categories/budgeting" },
      { title: "Investing Tools", url: "/categories/investing" },
      { title: "Loan Calculators", url: "/categories/loans-debt" },
      { title: "Retirement Planning", url: "/categories/retirement" },
      { title: "Tax Calculators", url: "/categories/taxes" },
      { title: "Saving Calculators", url: "/categories/savings-deposits" },
    ],
  },
  {
    heading: "Popular Tools",
    links: [
      { title: "EMI Calculator", url: "/tools/loan-emi-calculator" },
      { title: "Loan Calculator", url: "/tools/personal-loan-calculator" },
      { title: "SIP Calculator", url: "/tools/sip-calculator" },
      { title: "FD Calculator", url: "/tools/fd-calculator" },
      { title: "PPF Calculator", url: "/tools/ppf-calculator" },
      { title: "Compound Interest", url: "/tools/compound-interest-calculator" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { title: "Blog", url: "/blog" },
      { title: "Guides", url: "/guides" },
      { title: "FAQs", url: "/faqs" },
      { title: "Glossary", url: "/glossary" },
      { title: "Tools A-Z", url: "/tools" },
      { title: "Sitemap", url: "/sitemap.xml" },
    ],
  },
  {
    heading: "Company",
    links: [
      { title: "About Us", url: "/about" },
      { title: "Contact Us", url: "/contact" },
      { title: "Privacy Policy", url: "/privacy-policy" },
      { title: "Terms of Use", url: "/terms" },
      { title: "Disclaimer", url: "/disclaimer" },
    ],
  },
];

await mongoose.connect(uri);

let created = 0;
let updated = 0;

async function upsert(doc) {
  const res = await NavMenu.updateOne(
    { location: doc.location, title: doc.title, parent: doc.parent ?? null },
    { $set: { url: doc.url, order: doc.order, status: "active" }, $setOnInsert: { location: doc.location, title: doc.title, parent: doc.parent ?? null } },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
  return res.upsertedId?._id;
}

// Header
for (let i = 0; i < HEADER.length; i++) {
  await upsert({ ...HEADER[i], location: "header", parent: null, order: i + 1 });
}

// Footer columns + children
for (let c = 0; c < FOOTER.length; c++) {
  const col = FOOTER[c];
  await upsert({ title: col.heading, url: "#", location: "footer", parent: null, order: c + 1 });
  // need the heading id (whether just created or already existing)
  const headingDoc = await NavMenu.findOne({ location: "footer", title: col.heading, parent: null });
  for (let i = 0; i < col.links.length; i++) {
    await upsert({ ...col.links[i], location: "footer", parent: headingDoc._id, order: i + 1 });
  }
}

console.log(`✓ nav menu: ${created} created, ${updated} updated`);
await mongoose.disconnect();
