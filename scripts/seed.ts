import { loadEnv } from "./load-env";

async function main() {
  loadEnv();
  const { getDb } = await import("../src/lib/db");
  const { runSeed, seedIfEmpty } = await import("../src/lib/seed");
  const force = process.argv.includes("--force");
  const db = getDb();

  if (!force) {
    seedIfEmpty(db);
    const count = (db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number }).c;
    console.log(`Seed check complete. ${count} content blocks present.`);
    console.log("Use `npm run db:seed -- --force` only on a development database to overwrite seeded content.");
    db.close();
    return;
  }

  const rows = (db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number }).c;
  console.warn("WARNING: --force overwrites seeded content statuses and replaces seeded testimonials and FAQs.");
  console.warn(`The database currently has ${rows} content blocks.`);
  runSeed(db, { force: true });
  const after = (db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number }).c;
  console.log(`Seed complete. ${after} content blocks present.`);
  db.close();
}

void main().catch((error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
