import type { PlanInfo } from "@/lib/membership/membershipService";

export const PLANS: PlanInfo[] = [
  { id: "premium", name: "Premium", price: 999, features: ["View contact details", "Send unlimited interests", "AI matching", "Priority support", "Advanced filters"] },
  { id: "gold", name: "Gold", price: 1999, features: ["All Premium features", "Profile highlighting", "Featured placement", "Dedicated relationship manager", "Background verification", "Exclusive matches"] },
];
