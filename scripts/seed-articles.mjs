// Seed blog article stubs from data/blog-content-plan.csv into MongoDB.
// Run: node --env-file=.env.local scripts/seed-articles.mjs
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

const Category = mongoose.model("Category", new mongoose.Schema({ slug: String, type: String }, { timestamps: true }));
const User = mongoose.model("User", new mongoose.Schema({ email: String }, { timestamps: true }));
const Article = mongoose.model(
  "Article",
  new mongoose.Schema(
    {
      title: String,
      slug: { type: String, lowercase: true, trim: true },
      focusKeyword: String,
      excerpt: String,
      content: String,
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, default: "draft" },
      keywords: [String],
    },
    { timestamps: true }
  )
);

await mongoose.connect(uri);

const author = await User.findOne().select("_id");
if (!author) { console.error("No admin user found. Seed an admin first."); process.exit(1); }

const blogCats = await Category.find({ type: "blog" }).select("slug");
const catBySlug = new Map(blogCats.map((c) => [c.slug, c._id]));

const rows = parseCsv("data/blog-content-plan.csv");
let created = 0, updated = 0, noCat = 0;

for (const r of rows) {
  const catId = catBySlug.get(r.category);
  if (!catId) { noCat++; console.log(`  ! no blog category for ${r.slug} (${r.category})`); }
  const res = await Article.updateOne(
    { slug: r.slug },
    {
      $set: {
        title: r.title,
        focusKeyword: r.focus_keyword,
        status: "draft",
        author: author._id,
        ...(catId ? { categories: [catId] } : {}),
      },
      $setOnInsert: { slug: r.slug },
    },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
}

console.log(`✓ articles: ${created} created, ${updated} updated, ${rows.length} total${noCat ? `, ${noCat} missing category` : ""}`);
await mongoose.disconnect();
