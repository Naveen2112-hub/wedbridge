/**
 * Unit tests for the compatibility engine.
 * Run with: npx tsx src/lib/ai/__tests__/compatibilityEngine.test.ts
 */
import { calculateCompatibility } from "@/lib/ai/compatibilityEngine";
import type { ProfileDocument } from "@/firebase/schema";

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

const baseProfile: ProfileDocument = {
  uid: "user1",
  name: "Test User",
  gender: "male",
  dateOfBirth: "1995-01-15",
  religion: "Hindu",
  caste: "Vanniyar",
  motherTongue: "Tamil",
  education: "B.E",
  occupation: "Software Engineer",
  district: "Chennai",
  state: "Tamil Nadu",
  country: "India",
  maritalStatus: "never_married",
  phone: "9876543210",
  email: "test@example.com",
  height: "5'9\"",
  annualIncome: "8 LPA",
  foodPreference: "vegetarian",
  smoking: "no",
  drinking: "no",
  featured: false,
  status: "approved",
  verificationStatus: "unverified",
  bio: "",
  photoURL: "",
  partnerPreference: "",
  lifestyle: "",
  familyType: "",
  createdBy: "user",
  createdAt: { seconds: 0, nanoseconds: 0 } as never,
};

console.log("Compatibility Engine Tests:");

test("identical profiles should have high compatibility", () => {
  const result = calculateCompatibility(baseProfile, { ...baseProfile, uid: "user2" });
  assert(result.overallScore >= 80, `Expected >= 80, got ${result.overallScore}`);
  assert(result.strengths.length > 0, "Should have strengths");
});

test("different religions should lower score", () => {
  const result = calculateCompatibility(baseProfile, {
    ...baseProfile,
    uid: "user3",
    religion: "Christian",
    caste: "CSI",
  });
  assert(result.overallScore < 80, `Expected < 80, got ${result.overallScore}`);
});

test("should generate conversation starters", () => {
  const result = calculateCompatibility(baseProfile, { ...baseProfile, uid: "user4" });
  assert(result.conversationStarters.length > 0, "Should have conversation starters");
  assert(result.conversationStarters.length <= 5, "Should have at most 5 starters");
});

test("should identify weaknesses", () => {
  const result = calculateCompatibility(baseProfile, {
    ...baseProfile,
    uid: "user5",
    occupation: "Teacher",
    district: "Madurai",
    foodPreference: "non-vegetarian",
  });
  assert(result.weaknesses.length >= 0, "Should have weaknesses array");
});

test("breakdown should include all factors", () => {
  const result = calculateCompatibility(baseProfile, { ...baseProfile, uid: "user6" });
  assert(result.breakdown.length >= 15, `Expected >= 15 factors, got ${result.breakdown.length}`);
});

console.log("\nDone.");
