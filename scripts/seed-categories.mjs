// Seed all tool + blog categories from data/*.csv into MongoDB.
// Run: node --env-file=.env.local scripts/seed-categories.mjs
import mongoose from "mongoose";
import { readFileSync } from "node:fs";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

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

const schema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, lowercase: true, trim: true },
    thumbnail: String,
    status: { type: String, default: "active" },
    type: String,
  },
  { timestamps: true }
);
schema.index({ type: 1, slug: 1 }, { unique: true });
const Category = mongoose.model("Category", schema);

await mongoose.connect(uri);

// Drop the stale global-unique slug index if it exists.
try {
  const idx = await Category.collection.indexes();
  if (idx.find((i) => i.name === "slug_1")) {
    await Category.collection.dropIndex("slug_1");
    console.log("• dropped stale slug_1 index");
  }
} catch {
  /* ignore */
}

const tool = parseCsv("data/tool-categories.csv").map((r) => ({ name: r.name, slug: r.slug, type: "tool" }));
const blog = parseCsv("data/blog-categories.csv").map((r) => ({ name: r.name, slug: r.slug, type: "blog" }));
const all = [...tool, ...blog];

let created = 0;
let updated = 0;
for (const c of all) {
  const res = await Category.updateOne(
    { type: c.type, slug: c.slug },
    { $set: { name: c.name, status: "active" }, $setOnInsert: { type: c.type, slug: c.slug } },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
}

console.log(`✓ categories: ${created} created, ${updated} updated (${tool.length} tool + ${blog.length} blog)`);
await mongoose.disconnect();
