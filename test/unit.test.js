/**
 * Hello Dear — Unit Test Suite
 * ------------------------------------------------------------------
 * Tests individual backend helper functions in isolation — no HTTP
 * requests, no running server, no database connection required.
 *
 * This complements test.js (which does black-box, HTTP-level *system*
 * testing) with true unit-level testing of the pure logic that other
 * routes depend on: admin token signing/verification, email domain
 * classification, the profanity filter, and category slug generation.
 *
 * Companion document: test.md (§4a Unit Test Traceability).
 *
 * Requirements:
 *   - Node.js 18+ (built-in `assert`, `node:test` not required — this
 *     uses the same hand-rolled runner as test.js for consistency)
 *   - `cd backend && npm install` must have been run at least once
 *     (server.js requires express/mysql2/bcrypt/dotenv/cors even
 *     though this suite never issues an HTTP request or a DB query)
 *
 * Usage (from the test/ directory):
 *   node unit.test.js
 *
 * Exit code: 0 if every test passed, 1 otherwise (CI-friendly).
 */

const assert = require("assert");
const {
  base64url,
  base64urlDecode,
  signAdminToken,
  verifyAdminToken,
  isUniversityEmail,
  containsProfanity,
  slugify
} = require("../backend/server");

// ---- tiny test runner (same style as test.js, for a consistent report) --

const results = [];

function test(id, name, fn) {
  try {
    fn();
    results.push({ id, name, status: "PASS" });
    console.log(`✅ PASS  ${id}  ${name}`);
  } catch (error) {
    results.push({ id, name, status: "FAIL", error: error.message });
    console.log(`❌ FAIL  ${id}  ${name}`);
    console.log(`         → ${error.message}`);
  }
}

console.log("\nHello Dear — Unit Test Run\n");

// ---- UT-01..03: base64url encode/decode -------------------------------

test("UT-01", "base64url round-trips arbitrary text", () => {
  const original = '{"adminId":"admin","exp":1234567890}';
  const decoded = base64urlDecode(base64url(original));
  assert.strictEqual(decoded, original);
});

test("UT-02", "base64url output is URL-safe (no +, /, or = characters)", () => {
  // A payload chosen so that plain base64 would contain '+' and '/'.
  const encoded = base64url("\xfb\xff\xbf\xef>>>???");
  assert.ok(!/[+/=]/.test(encoded), `expected no +, /, = in "${encoded}"`);
});

test("UT-03", "base64urlDecode handles input missing its padding", () => {
  // "abc" (3 chars) base64url-encodes to 4 chars with no padding needed;
  // this checks the padding-restoration branch with a length that DOES
  // need padding re-added.
  const encoded = base64url("ab"); // shorter input forces padding on the way back
  assert.strictEqual(base64urlDecode(encoded), "ab");
});

// ---- UT-04..08: admin token sign/verify --------------------------------

test("UT-04", "signAdminToken produces a token verifyAdminToken accepts", () => {
  const token = signAdminToken("admin1");
  const payload = verifyAdminToken(token);
  assert.ok(payload, "expected a payload, got null");
  assert.strictEqual(payload.adminId, "admin1");
});

test("UT-05", "verifyAdminToken rejects a tampered signature", () => {
  const token = signAdminToken("admin1");
  const [payloadPart, signature] = token.split(".");
  // flip one hex character in the signature
  const flippedChar = signature[0] === "a" ? "b" : "a";
  const tampered = `${payloadPart}.${flippedChar}${signature.slice(1)}`;
  assert.strictEqual(verifyAdminToken(tampered), null);
});

test("UT-06", "verifyAdminToken rejects a tampered payload", () => {
  const token = signAdminToken("admin1");
  const [payloadPart, signature] = token.split(".");
  const tamperedPayload = base64url('{"adminId":"attacker","exp":9999999999999}');
  assert.strictEqual(verifyAdminToken(`${tamperedPayload}.${signature}`), null);
});

test("UT-07", "verifyAdminToken rejects malformed tokens", () => {
  assert.strictEqual(verifyAdminToken(null), null);
  assert.strictEqual(verifyAdminToken(""), null);
  assert.strictEqual(verifyAdminToken("no-dot-in-this-string"), null);
  assert.strictEqual(verifyAdminToken("."), null);
});

test("UT-08", "verifyAdminToken rejects an already-expired token", () => {
  // Build a token with the same shape signAdminToken produces, but with
  // exp in the past — exercises the expiry branch directly, since
  // signAdminToken itself always sets a future expiry.
  const crypto = require("crypto");
  const secret = process.env.ADMIN_TOKEN_SECRET || "dev-only-insecure-secret-change-me";
  const payload = JSON.stringify({ adminId: "admin1", exp: Date.now() - 1000 });
  const payloadPart = base64url(payload);
  const signature = crypto.createHmac("sha256", secret).update(payloadPart).digest("hex");
  assert.strictEqual(verifyAdminToken(`${payloadPart}.${signature}`), null);
});

// ---- UT-09..12: isUniversityEmail --------------------------------------

test("UT-09", "isUniversityEmail accepts a non-free-provider domain", () => {
  assert.strictEqual(isUniversityEmail("student@jcu.edu.au"), true);
});

test("UT-10", "isUniversityEmail rejects common free email providers", () => {
  assert.strictEqual(isUniversityEmail("student@gmail.com"), false);
  assert.strictEqual(isUniversityEmail("student@outlook.com"), false);
  assert.strictEqual(isUniversityEmail("student@naver.com"), false);
});

test("UT-11", "isUniversityEmail is case-insensitive on the domain", () => {
  assert.strictEqual(isUniversityEmail("student@GMAIL.COM"), false);
});

test("UT-12", "isUniversityEmail rejects an address with no domain", () => {
  assert.strictEqual(isUniversityEmail("not-an-email"), false);
});

// ---- UT-13..16: containsProfanity --------------------------------------

test("UT-13", "containsProfanity returns false for clean text", () => {
  assert.strictEqual(containsProfanity("Thanks for the support, this really helped me today."), false);
});

test("UT-14", "containsProfanity returns false for empty/undefined input", () => {
  assert.strictEqual(containsProfanity(""), false);
  assert.strictEqual(containsProfanity(undefined), false);
});

test("UT-15", "containsProfanity matches a blocked word as a whole word, case-insensitively", () => {
  assert.strictEqual(containsProfanity("You are being an ASSHOLE about this."), true);
});

test("UT-16", "containsProfanity does not false-positive on a word that merely contains a blocked substring", () => {
  // "assholeness" contains "asshole" as a substring but is not the whole
  // word "asshole" — the \b...\b regex should NOT match here. This is a
  // boundary-value test for the word-boundary logic itself.
  assert.strictEqual(containsProfanity("The assholeness of the situation was noted."), false);
});

// ---- UT-17..19: slugify -------------------------------------------------

test("UT-17", "slugify lower-cases and hyphenates a normal label", () => {
  assert.strictEqual(slugify("Mental Health"), "mental-health");
});

test("UT-18", "slugify collapses punctuation/whitespace and trims leading/trailing hyphens", () => {
  assert.strictEqual(slugify("  Career!! Services??  "), "career-services");
});

test("UT-19", "slugify falls back to a generated slug for input with no alphanumeric characters", () => {
  const result = slugify("!!!");
  assert.ok(/^category-\d+$/.test(result), `expected "category-<timestamp>", got "${result}"`);
});

// ---- summary ------------------------------------------------------------

const passed = results.filter((r) => r.status === "PASS").length;
const failed = results.filter((r) => r.status === "FAIL").length;

console.log("\n----------------------------------------");
console.log(`Total: ${results.length}   Passed: ${passed}   Failed: ${failed}`);
console.log("----------------------------------------\n");

if (failed > 0) {
  process.exitCode = 1;
}