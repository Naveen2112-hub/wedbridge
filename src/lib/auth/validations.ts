import { z } from "zod";
import type { FirebaseError } from "firebase/app";

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1, "required") });
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({ name: z.string().min(2, "required"), email: z.string().email("email"), password: z.string().min(8, "weakPassword"), confirm: z.string().min(1, "required") }).refine((d) => d.password === d.confirm, { message: "mismatch", path: ["confirm"] });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email: z.string().email("email") });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const completeProfileSchema = z.object({
  name: z.string().min(2, "required"), gender: z.enum(["male", "female", "other"]), dateOfBirth: z.string().min(1, "required"),
  religion: z.string().min(1, "required"), caste: z.string().min(1, "required"), motherTongue: z.string().min(1, "required"),
  district: z.string().min(1, "required"), state: z.string().min(1, "required"), country: z.string().min(1, "required"),
  phone: z.string().min(6, "required"), email: z.string().email("email").optional().or(z.literal("")),
  photoURL: z.string().optional(), contactVisibility: z.enum(["everyone", "after_accept", "premium_only"]),
  maritalStatus: z.enum(["never_married", "divorced", "widowed", "awaiting_divorce"]), height: z.string().min(1, "required"),
  education: z.string().min(1, "required"), occupation: z.string().min(1, "required"), annualIncome: z.string().min(1, "required"),
});
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

export const profileSchema = completeProfileSchema.extend({
  fatherName: z.string().optional(), motherName: z.string().optional(), brothers: z.string().optional(), sisters: z.string().optional(),
  familyType: z.enum(["nuclear", "joint"]).optional(), familyStatus: z.enum(["middle", "upper_middle", "rich", "affluent"]).optional(),
  lifestyle: z.enum(["moderate", "traditional", "modern", "orthodox"]).optional(), foodPreference: z.enum(["veg", "non_veg", "eggetarian", "jain"]).optional(),
  smoking: z.enum(["yes", "no"]).optional(), drinking: z.enum(["yes", "no"]).optional(), horoscope: z.enum(["yes", "no"]).optional(),
  star: z.string().optional(), rasi: z.string().optional(), manglik: z.enum(["yes", "no", "dont_know"]).optional(),
  aboutMe: z.string().max(2000).optional(), partnerPreference: z.string().max(2000).optional(),
  gallery: z.array(z.string()).optional(),
  contactVisibility: z.enum(["everyone", "after_accept", "premium_only"]),
  profileVisibility: z.enum(["visible", "hidden"]),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export function mapAuthError(err: unknown): string {
  const e = err as FirebaseError;
  if (e?.code) {
    switch (e.code) {
      case "auth/invalid-credential": case "auth/wrong-password": case "auth/user-not-found": return "auth.error.invalid";
      case "auth/email-already-in-use": return "auth.error.emailInUse";
      case "auth/weak-password": return "auth.error.weakPassword";
      case "auth/invalid-email": return "auth.error.email";
      case "auth/configuration-not-found": case "auth/api-key-not-valid": return "auth.error.notConfigured";
      default: return "auth.error.generic";
    }
  }
  return "auth.error.generic";
}
