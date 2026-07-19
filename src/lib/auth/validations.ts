import { z } from "zod";
import type { FirebaseError } from "firebase/app";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "required"),
  email: z.string().email("email"),
  password: z.string().min(8, "weakPassword"),
  confirm: z.string().min(1, "required"),
}).refine((d) => d.password === d.confirm, { message: "mismatch", path: ["confirm"] });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email: z.string().email("email") });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const completeProfileSchema = z.object({
  name: z.string().min(2, "required"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(1, "required"),
  religion: z.string().min(1, "required"),
  caste: z.string().min(1, "required"),
  district: z.string().min(1, "required"),
  phone: z.string().min(6, "required"),
  email: z.string().email("email").optional().or(z.literal("")),
  photoURL: z.string().optional(),
  contactVisibility: z.enum(["everyone", "after_accept", "premium_only"]),
});
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

export function mapAuthError(err: unknown): string {
  const e = err as FirebaseError;
  if (e?.code) {
    switch (e.code) {
      case "auth/invalid-credential": case "auth/wrong-password": case "auth/user-not-found":
        return "auth.error.invalid";
      case "auth/email-already-in-use": return "auth.error.emailInUse";
      case "auth/weak-password": return "auth.error.weakPassword";
      case "auth/invalid-email": return "auth.error.email";
      case "auth/configuration-not-found": case "auth/api-key-not-valid":
        return "auth.error.notConfigured";
      default: return "auth.error.generic";
    }
  }
  return "auth.error.generic";
}
