// Set tool.url = /calculators/<slug> for EVERY folder that exists under
// app/calculators (auto-detects built calculators). Then nothing manual to track.
// Run: node --env-file=.env.local scripts/sync-tool-urls.mjs
import mongoose from "mongoose";
import { readdirSync, statSync } from "node:fs";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }

const dir = "app/calculators";
const slugs = readdirSync(dir).filter(
  (n) => !n.startsWith("_") && !n.startsWith(".") && statSync(`${dir}/${n}`).isDirectory()
);

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ slug: String, url: String }, { timestamps: true, strict: false })
);

await mongoose.connect(MONGODB_URI);
let updated = 0;
for (const slug of slugs) {
  const url = `/calculators/${slug}`;
  const res = await Tool.updateOne({ slug }, { $set: { url } });
  if (res.matchedCount) updated++;
  console.log(`${slug}: matched=${res.matchedCount} -> url=${url}`);
}
console.log(`\nSynced ${updated}/${slugs.length} calculator folders to DB urls.`);
await mongoose.disconnect();
