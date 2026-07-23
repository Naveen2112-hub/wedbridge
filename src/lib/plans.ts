export type PlanId = "premium" | "gold";

export interface Plan {
  id: PlanId;
  name: string;
  amount: number; // in paise
  priceLabel: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  premium: {
    id: "premium",
    name: "Premium",
    amount: 99900,
    priceLabel: "₹999",
    description: "Everything you need to plan your wedding with confidence.",
    features: [
      "Unlimited vendor enquiries",
      "Priority customer support",
      "Save up to 50 vendors",
      "Checklist & budget planner",
    ],
  },
  gold: {
    id: "gold",
    name: "Gold",
    amount: 199900,
    priceLabel: "₹1,999",
    description: "Our complete toolkit for couples who want it all.",
    features: [
      "Everything in Premium",
      "Dedicated wedding concierge",
      "Unlimited saved vendors",
      "Custom wedding website",
      "Exclusive partner discounts",
    ],
    highlight: true,
  },
};

export interface Membership {
  uid: string;
  plan: PlanId;
  status: "active" | "expired" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  activatedAt: number | null;
  expiryDate: number | null;
  createdAt: number | null;
  updatedAt: number | null;
}
