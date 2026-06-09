// Write the list of not-yet-built tools (no url) to data/remaining-tools.json.
// Run: node --env-file=.env.local scripts/dump-remaining.mjs
import mongoose from "mongoose";
import { writeFileSync } from "node:fs";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ title: String, slug: String, type: String, url: String }, { timestamps: true })
);

await mongoose.connect(MONGODB_URI);
const tools = await Tool.find(
  { $or: [{ url: { $exists: false } }, { url: "" }, { url: null }] },
  "title slug type"
).sort({ slug: 1 }).lean();

const list = tools.map((t) => ({ slug: t.slug, title: t.title, type: t.type }));
writeFileSync("data/remaining-tools.json", JSON.stringify(list), "utf8");
console.log(`Wrote data/remaining-tools.json — ${list.length} remaining tools.`);
await mongoose.disconnect();
