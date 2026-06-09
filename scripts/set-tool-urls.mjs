// Set tool.url = /calculators/<slug> for calculators that now have a dedicated page.
// Run: node --env-file=.env.local scripts/set-tool-urls.mjs
import mongoose from "mongoose";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }

// Add each new calculator's slug here as it gets built.
const BUILT_SLUGS = [
  "hourly-rate-calculator",
  "compound-interest-calculator",
  "mortgage-calculator",
  "simple-interest-calculator",
];

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ slug: String, url: String }, { timestamps: true, strict: false })
);

await mongoose.connect(MONGODB_URI);
for (const slug of BUILT_SLUGS) {
  const url = `/calculators/${slug}`;
  const res = await Tool.updateOne({ slug }, { $set: { url } });
  console.log(`${slug}: matched=${res.matchedCount} modified=${res.modifiedCount} -> url=${url}`);
}
await mongoose.disconnect();
