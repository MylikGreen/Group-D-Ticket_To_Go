const test = require("node:test");
const assert = require("node:assert");
const addSearch = require("../js/addSearch.js"); // <-- Changed from "../" to "./" because it's in the root folder

test("addSearch validation", async (t) => {
  await t.test("returns false for null input", () => {
    assert.strictEqual(addSearch(null), false);
  });

  await t.test("returns false for undefined input", () => {
    assert.strictEqual(addSearch(undefined), false);
  });

  await t.test("returns false for non-string types", () => {
    assert.strictEqual(addSearch(123), false);
  });

  await t.test("returns false for empty string", () => {
    assert.strictEqual(addSearch(""), false);
  });

  await t.test("returns false for whitespace-only string", () => {
    assert.strictEqual(addSearch("   "), false);
  });

  await t.test("returns false for strings longer than 255 characters", () => {
    const longQuery = "a".repeat(256);
    assert.strictEqual(addSearch(longQuery), false);
  });

  await t.test("returns true for valid standard query", () => {
    assert.strictEqual(addSearch("addition"), true);
  });

  await t.test("returns true for valid query with extra whitespace", () => {
    assert.strictEqual(addSearch("  division  "), true);
  });
});