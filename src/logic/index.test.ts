import { analyzeSource, formatSmells } from "./index.js";

export function runQueryLensTests() {
  // Test 1: SELECT * smell detection
  const sql1 = "SELECT * FROM users WHERE active = true;";
  const smells1 = analyzeSource(sql1);
  if (smells1.length !== 1 || smells1[0]?.rule !== "select-star") {
    throw new Error(`SELECT * detection failed: ${JSON.stringify(smells1)}`);
  }

  // Test 2: Unbounded findMany smell detection (Prisma ORM)
  const prisma1 = "const users = await prisma.user.findMany();";
  const smells2 = analyzeSource(prisma1);
  if (smells2.length !== 1 || smells2[0]?.rule !== "unbounded-findmany") {
    throw new Error(`Unbounded findMany detection failed: ${JSON.stringify(smells2)}`);
  }

  // Test 3: Bounded findMany clean source (no smell)
  const prismaClean = "const users = await prisma.user.findMany({ take: 50 });";
  const smellsClean = analyzeSource(prismaClean);
  if (smellsClean.length !== 0) {
    throw new Error(`Bounded findMany incorrectly flagged: ${JSON.stringify(smellsClean)}`);
  }

  // Test 4: Nested include N+1 smell detection
  const nestedInclude = "const data = await db.user.findMany({ include: { posts: { include: { comments: true } } } });";
  const smells3 = analyzeSource(nestedInclude);
  if (smells3.length < 1 || !smells3.some((s) => s.rule === "nested-include")) {
    throw new Error(`Nested include detection failed: ${JSON.stringify(smells3)}`);
  }

  // Test 5: SQL Tautology WHERE 1=1 smell detection
  const tautology = "SELECT id FROM orders WHERE 1=1 AND status = 'pending';";
  const smells4 = analyzeSource(tautology);
  if (smells4.length < 1 || !smells4.some((s) => s.rule === "tautology")) {
    throw new Error(`Tautology detection failed: ${JSON.stringify(smells4)}`);
  }

  // Test 6: N+1 await query in loop detection
  const loopN1 = "for (const id of userIds) { const u = await db.user.find(id); }";
  const smells5 = analyzeSource(loopN1);
  if (smells5.length < 1 || !smells5.some((s) => s.rule === "n-plus-one-loop")) {
    throw new Error(`N+1 loop detection failed: ${JSON.stringify(smells5)}`);
  }

  // Test 7: CLI report formatting
  const formatted = formatSmells(smells1);
  if (!formatted.includes("L1 [warn] select-star: SELECT * — prefer explicit columns")) {
    throw new Error(`Report formatting failed: ${formatted}`);
  }

  const cleanFormatted = formatSmells([]);
  if (cleanFormatted !== "QueryLens: no smells detected.") {
    throw new Error(`Clean report formatting failed: ${cleanFormatted}`);
  }

  console.log("✓ All 7 QueryLens unit tests passed!");
}

runQueryLensTests();
