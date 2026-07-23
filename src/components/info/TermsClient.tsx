"use client";

import { Reveal } from "@/components/ui/Reveal";

const sections = [
  { title: "1. Acceptance of Terms", body: "By registering or using WedBridge, you agree to these terms of service. If you do not agree, please do not use the platform." },
  { title: "2. Eligibility", body: "You must be at least 18 years old and legally eligible to marry under Indian law to use WedBridge. By registering, you confirm you meet these requirements." },
  { title: "3. Account Registration", body: "You must provide accurate and complete information during registration. Each user may maintain only one account. Sharing accounts is prohibited." },
  { title: "4. Profile Content", body: "You are responsible for all content you post. Profiles must not contain false, misleading, offensive, or prohibited content. WedBridge reserves the right to remove any profile that violates these terms." },
  { title: "5. User Conduct", body: "Users must not harass, threaten, or defraud other users. Sending spam, attempting to extract money, or misrepresenting identity will result in immediate account suspension." },
  { title: "6. Membership Plans", body: "WedBridge offers Free, Premium, and Gold membership tiers. Paid memberships unlock additional features as described on the membership page. Fees are billed in Indian Rupees (INR)." },
  { title: "7. Payments", body: "Payments are processed through Razorpay. By making a payment, you authorize us to charge the selected plan amount. Membership fees are non-refundable once activated except as stated in our Refund Policy." },
  { title: "8. Wedding Marketplace", body: "WedBridge provides a platform for vendors to list services. We facilitate bookings but are not a party to vendor-user contracts. Vendors are responsible for service quality." },
  { title: "9. AI Matchmaking", body: "Our AI compatibility scores are recommendations only. WedBridge does not guarantee matches or outcomes. Users should exercise their own judgment when evaluating profiles." },
  { title: "10. Limitation of Liability", body: "WedBridge is not liable for any damages arising from interactions between users, vendor services, or matchmaking outcomes. Our maximum liability is limited to the fees paid by the user." },
  { title: "11. Termination", body: "WedBridge may suspend or terminate accounts that violate these terms. Users may delete their account at any time through settings." },
  { title: "12. Changes to Terms", body: "We may update these terms from time to time. Continued use after changes constitutes acceptance. Significant changes will be communicated to users." },
];

export function TermsClient() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Reveal>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: January 2025</p>
      </Reveal>
      <div className="mt-8 space-y-6">
        {sections.map((s, i) => (
          <Reveal key={i} delay={i * 30}>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900">{s.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
