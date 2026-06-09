// Export a build-tracking CSV of all tools. done = "yes" when the tool's url is set
// (i.e. it has a dedicated /calculators/<slug> page). Re-run anytime to refresh.
// Run: node --env-file=.env.local scripts/export-tools-csv.mjs
import mongoose from "mongoose";
import { writeFileSync } from "node:fs";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ title: String, slug: String, type: String, url: String }, { timestamps: true })
);

await mongoose.connect(MONGODB_URI);
const tools = await Tool.find({}, "title slug type url").sort({ title: 1 }).lean();

const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const rows = [["slug", "title", "type", "url", "done"].join(",")];
let done = 0;
for (const t of tools) {
  const isDone = t.url ? "yes" : "no";
  if (t.url) done++;
  rows.push([esc(t.slug), esc(t.title), esc(t.type), esc(t.url || ""), isDone].join(","));
}
writeFileSync("data/tools-build.csv", rows.join("\n") + "\n", "utf8");
console.log(`Wrote data/tools-build.csv — ${tools.length} tools, ${done} done, ${tools.length - done} remaining.`);
await mongoose.disconnect();
