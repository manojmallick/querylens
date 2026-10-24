/** Lightweight SQL smell detection for Prisma/Drizzle-ish source */

export interface QuerySmell {
  rule: string;
  severity: "info" | "warn" | "error";
  message: string;
  line: number;
}

export function analyzeSource(source: string): QuerySmell[] {
  const smells: QuerySmell[] = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((line, i) => {
    const n = i + 1;
    if (/SELECT\s+\*/i.test(line)) {
      smells.push({
        rule: "select-star",
        severity: "warn",
        message: "SELECT * — prefer explicit columns",
        line: n,
      });
    }
    if (/findMany\([^)]*\)\s*;/.test(line) && !/take:|limit/i.test(line)) {
      smells.push({
        rule: "unbounded-findmany",
        severity: "warn",
        message: "findMany without take/limit — possible full table scan",
        line: n,
      });
    }
    if (/include:\s*\{[^}]*include:/.test(line) || /include:.*include:/.test(line)) {
      smells.push({
        rule: "nested-include",
        severity: "info",
        message: "Nested include — watch for N+1 style fan-out",
        line: n,
      });
    }
    if (/WHERE\s+1\s*=\s*1/i.test(line)) {
      smells.push({
        rule: "tautology",
        severity: "error",
        message: "Tautology WHERE 1=1 — review generated SQL",
        line: n,
      });
    }
    if (/\.map\s*\(.*await.*find/.test(line) || /for\s*\(.*of.*\)\s*\{[^}]*await.*find/.test(line)) {
      smells.push({
        rule: "n-plus-one-loop",
        severity: "error",
        message: "Await query inside loop — classic N+1",
        line: n,
      });
    }
  });
  return smells;
}

export function formatSmells(smells: QuerySmell[]): string {
  if (!smells.length) return "QueryLens: no smells detected.";
  return smells
    .map((s) => `L${s.line} [${s.severity}] ${s.rule}: ${s.message}`)
    .join("\n");
}
