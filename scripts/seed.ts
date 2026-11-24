import { loadEnv } from "./load-env";

async function main() {
  loadEnv();
  const { SupabaseDB } = await import("../src/lib/db");
  const { runSeed, seedIfEmpty } = await import("../src/lib/seed");
  const force = process.argv.includes("--force");
  const db = SupabaseDB;

  if (!force) {
    await seedIfEmpty(db);
    const countResult = await db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number };
    console.log(`Seed check complete. ${countResult.c} content blocks present.`);
    console.log("Use `npm run db:seed -- --force` only on a development database to overwrite seeded content.");
    return;
  }

  const rowsResult = await db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number };
  console.warn("WARNING: --force overwrites seeded content statuses and replaces seeded testimonials and FAQs.");
  console.warn(`The database currently has ${rowsResult.c} content blocks.`);
  await runSeed(db, { force: true });
  const afterResult = await db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number };
  console.log(`Seed complete. ${afterResult.c} content blocks present.`);
}

void main().catch((error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});