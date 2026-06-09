// Seed all tools from data/tools.csv into MongoDB, linking each to its category.
// Run: node --env-file=.env.local scripts/seed-tools.mjs
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

const Category = mongoose.model(
  "Category",
  new mongoose.Schema({ name: String, slug: String, type: String }, { timestamps: true })
);
const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema(
    {
      title: String,
      slug: { type: String, lowercase: true, trim: true },
      type: String,
      description: String,
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      status: { type: String, default: "active" },
      keywords: [String],
    },
    { timestamps: true }
  )
);

await mongoose.connect(uri);

// Map tool-category slug -> _id
const toolCats = await Category.find({ type: "tool" }).select("slug");
const catBySlug = new Map(toolCats.map((c) => [c.slug, c._id]));

const rows = parseCsv("data/tools.csv");
let created = 0, updated = 0, noCat = 0;

for (const r of rows) {
  const catId = catBySlug.get(r.category);
  if (!catId) { noCat++; console.log(`  ! no category for ${r.slug} (${r.category})`); }
  const res = await Tool.updateOne(
    { slug: r.slug },
    {
      $set: {
        title: r.title,
        type: r.type === "tool" ? "tool" : "calculator",
        description: r.description,
        status: "active",
        ...(catId ? { categories: [catId] } : {}),
      },
      $setOnInsert: { slug: r.slug },
    },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
}

console.log(`✓ tools: ${created} created, ${updated} updated, ${rows.length} total${noCat ? `, ${noCat} missing category` : ""}`);
await mongoose.disconnect();
