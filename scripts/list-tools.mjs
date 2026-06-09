// List tools (slug, title, type, url) so we can build calculators one by one.
// Run: node --env-file=.env.local scripts/list-tools.mjs
import mongoose from "mongoose";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) { console.error("MONGODB_URI is not set."); process.exit(1); }

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ title: String, slug: String, type: String, url: String, status: String }, { timestamps: true })
);

await mongoose.connect(MONGODB_URI);
const tools = await Tool.find({}, "title slug type url status").sort({ title: 1 }).lean();
console.log(`Total tools: ${tools.length}\n`);
for (const t of tools) {
  console.log(`${t.slug}\t| ${t.type}\t| url=${t.url || "(none)"}\t| ${t.title}`);
}
await mongoose.disconnect();
