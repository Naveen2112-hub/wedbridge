/**
 * Unit tests for the field validator.
 * Run with: npx tsx src/lib/ai/__tests__/fieldValidator.test.ts
 */
import { validateAndCorrect, calculateAge, calculateCompletion, getMissingFields } from "@/lib/ocr/fieldValidator";
import type { PartialProfile, ProfileWithConfidence } from "@/lib/profile/ocrTypes";

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

console.log("Field Validator Tests:");

test("should normalize education B.E variants", () => {
  const data: PartialProfile = { education: "B E" };
  const conf: ProfileWithConfidence = { education: { value: "B E", confidence: 0.8, level: "high", source: "parser" } };
  const { data: corrected } = validateAndCorrect(data, conf);
  assert(corrected.education === "B.E", `Expected B.E, got ${corrected.education}`);
});

test("should normalize education BE to B.E", () => {
  const data: PartialProfile = { education: "BE" };
  const conf: ProfileWithConfidence = { education: { value: "BE", confidence: 0.8, level: "high", source: "parser" } };
  const { data: corrected } = validateAndCorrect(data, conf);
  assert(corrected.education === "B.E", `Expected B.E, got ${corrected.education}`);
});

test("should normalize occupation 'Software Engg' to 'Software Engineer'", () => {
  const data: PartialProfile = { occupation: "Software Engg" };
  const conf: ProfileWithConfidence = { occupation: { value: "Software Engg", confidence: 0.8, level: "high", source: "parser" } };
  const { data: corrected } = validateAndCorrect(data, conf);
  assert(corrected.occupation === "Software Engineer", `Expected Software Engineer, got ${corrected.occupation}`);
});

test("should normalize phone to +91 format", () => {
  const data: PartialProfile = { phone: "9876543210" };
  const conf: ProfileWithConfidence = { phone: { value: "9876543210", confidence: 0.9, level: "high", source: "scan" } };
  const { data: corrected } = validateAndCorrect(data, conf);
  assert(corrected.phone === "+919876543210", `Expected +919876543210, got ${corrected.phone}`);
});

test("should normalize email to lowercase", () => {
  const data: PartialProfile = { email: "TEST@Example.COM" };
  const conf: ProfileWithConfidence = { email: { value: "TEST@Example.COM", confidence: 0.9, level: "high", source: "scan" } };
  const { data: corrected } = validateAndCorrect(data, conf);
  assert(corrected.email === "test@example.com", `Expected lowercase, got ${corrected.email}`);
});

test("should calculate age from DOB", () => {
  const age = calculateAge("15/01/1995");
  assert(age !== null && age >= 28 && age <= 32, `Expected 28-32, got ${age}`);
});

test("should calculate completion percentage", () => {
  const data: Record<string, string> = { name: "Test", dateOfBirth: "1995-01-15", religion: "Hindu" };
  const pct = calculateCompletion(data);
  assert(pct > 0 && pct < 100, `Expected 0-100, got ${pct}`);
});

test("should identify missing fields", () => {
  const data: Record<string, string> = { name: "Test" };
  const missing = getMissingFields(data);
  assert(missing.length > 10, `Expected > 10 missing, got ${missing.length}`);
  assert(missing.includes("phone"), "Should include phone in missing");
});

test("should track corrections", () => {
  const data: PartialProfile = { education: "B E", phone: "9876543210" };
  const conf: ProfileWithConfidence = {
    education: { value: "B E", confidence: 0.8, level: "high", source: "parser" },
    phone: { value: "9876543210", confidence: 0.9, level: "high", source: "scan" },
  };
  const { corrections } = validateAndCorrect(data, conf);
  assert(corrections.length > 0, "Should have corrections");
});

console.log("\nDone.");
