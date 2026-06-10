// Unset tool.url for any app/calculators/<slug> folder that is missing page.tsx
// (incomplete build), so links don't redirect visitors to a 404.
// Run: node --env-file=.env.local scripts/unset-incomplete-urls.mjs
import mongoose from "mongoose";
import { readdirSync, statSync, existsSync } from "node:fs";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }

const dir = "app/calculators";
const slugs = readdirSync(dir).filter(
  (n) => !n.startsWith("_") && !n.startsWith(".") && statSync(`${dir}/${n}`).isDirectory()
);
const incomplete = slugs.filter((s) => !existsSync(`${dir}/${s}/page.tsx`));

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ slug: String, url: String }, { timestamps: true, strict: false })
);

await mongoose.connect(MONGODB_URI);
for (const slug of incomplete) {
  const res = await Tool.updateOne({ slug }, { $unset: { url: "" } });
  console.log(`unset ${slug}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
}
console.log(`\nUnset url for ${incomplete.length} incomplete folders.`);
await mongoose.disconnect();
