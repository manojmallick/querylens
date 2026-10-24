import * as assert from "node:assert";
import { analyzeSource } from "../logic/index.js";

suite("QueryLens logic", () => {
  test("flags select star", () => {
    const s = analyzeSource("const q = 'SELECT * FROM users'");
    assert.ok(s.some((x) => x.rule === "select-star"));
  });
});
