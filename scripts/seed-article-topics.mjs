// Seed the ArticleTopic queue from data/blog-content-plan.csv.
// The daily cron and the dashboard "Generate 5 drafts" button pull from this queue.
// Run: node --env-file=.env.local scripts/seed-article-topics.mjs
import mongoose from "mongoose";
import { readFileSync } from "node:fs";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI is not set."); process.exit(1); }

function parseCsv(path) {
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
    return obj;
  });
}

const ArticleTopic = mongoose.model(
  "ArticleTopic",
  new mongoose.Schema(
    {
      title: String,
      slug: { type: String, lowercase: true, trim: true },
      categorySlug: String,
      focusKeyword: String,
      secondaryKeywords: [String],
      paaQuestions: [String],
      uniqueAngle: String,
      market: { type: String, default: "US" },
      intent: String,
      status: { type: String, default: "pending" },
      order: { type: Number, default: 0 },
      articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
      error: String,
    },
    { timestamps: true }
  )
);

await mongoose.connect(uri);

const rows = parseCsv("data/blog-content-plan.csv");
let created = 0, updated = 0;

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const res = await ArticleTopic.updateOne(
    { slug: r.slug },
    {
      // Only set planning fields; never reset status/articleId on re-seed so
      // already-generated topics are not re-queued.
      $set: {
        title: r.title,
        categorySlug: r.category,
        focusKeyword: r.focus_keyword,
        intent: r.search_intent,
        order: i,
      },
      $setOnInsert: { slug: r.slug, status: "pending", market: "US" },
    },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
}

const pending = await ArticleTopic.countDocuments({ status: "pending" });
console.log(`✓ topics: ${created} created, ${updated} updated, ${rows.length} total — ${pending} pending`);
await mongoose.disconnect();
