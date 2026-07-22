/**
 * Unit tests for the AI search assistant.
 * Run with: npx tsx src/lib/ai/__tests__/searchAssistant.test.ts
 */
import { parseSearchQuery } from "@/lib/ai/searchAssistant";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS: ${name}`);
  } catch (e) {
    console.error(`  FAIL: ${name} - ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 1;
  }
}

console.log("Search Assistant Tests:");

test("should detect gender 'bride'", () => {
  const result = parseSearchQuery("Show premium brides under 27");
  assert(result.filters.gender === "female", `Expected female, got ${result.filters.gender}`);
});

test("should detect age 'under 27'", () => {
  const result = parseSearchQuery("Show brides under 27");
  assert(result.filters.maxAge === 27, `Expected maxAge 27, got ${result.filters.maxAge}`);
});

test("should detect age range '25 to 30'", () => {
  const result = parseSearchQuery("Show profiles 25 to 30 years");
  assert(result.filters.minAge === 25, `Expected minAge 25, got ${result.filters.minAge}`);
  assert(result.filters.maxAge === 30, `Expected maxAge 30, got ${result.filters.maxAge}`);
});

test("should detect district 'Chennai'", () => {
  const result = parseSearchQuery("Show software engineers in Chennai");
  assert(result.filters.district === "Chennai", `Expected Chennai, got ${result.filters.district}`);
});

test("should detect occupation 'software engineer'", () => {
  const result = parseSearchQuery("Show software engineers in Chennai");
  assert(result.filters.occupation === "Software Engineer", `Expected Software Engineer, got ${result.filters.occupation}`);
});

test("should detect religion 'Hindu'", () => {
  const result = parseSearchQuery("Show Hindu profiles in Salem");
  assert(result.filters.religion === "Hindu", `Expected Hindu, got ${result.filters.religion}`);
});

test("should detect premium filter", () => {
  const result = parseSearchQuery("Find premium brides");
  assert(result.filters.premium === true, "Expected premium=true");
});

test("should detect verified filter", () => {
  const result = parseSearchQuery("Find verified profiles in Madurai");
  assert(result.filters.verified === true, "Expected verified=true");
});

test("should detect Tamil keyword for Chennai", () => {
  const result = parseSearchQuery("சென்னை ஆசிரியர்களை காட்டு");
  assert(result.filters.district === "Chennai", `Expected Chennai, got ${result.filters.district}`);
});

test("should detect Tamil occupation 'ஆசிரியர்'", () => {
  const result = parseSearchQuery("சென்னை ஆசிரியர்களை காட்டு");
  assert(result.filters.occupation === "Teacher", `Expected Teacher, got ${result.filters.occupation}`);
});

test("should provide explanation", () => {
  const result = parseSearchQuery("Show software engineers in Chennai");
  assert(result.explanation.length > 0, "Should have explanation");
  assert(result.confidence > 0, "Should have confidence > 0");
});

console.log("\nDone.");
