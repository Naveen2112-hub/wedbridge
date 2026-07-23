"use client";

import { Reveal } from "@/components/ui/Reveal";

const sections = [
  { title: "1. Membership Fees", body: "WedBridge offers Free, Premium (Rs. 999/year), and Gold (Rs. 1,999/year) membership plans. Fees are charged upfront for the full membership period." },
  { title: "2. Refund Eligibility", body: "Membership fees are non-refundable once the membership is activated and premium features are unlocked. This is because digital services are delivered immediately upon activation." },
  { title: "3. Cancellation", body: "You can cancel auto-renewal at any time from your membership settings. Your membership will remain active until the expiry date, after which it will downgrade to Free." },
  { title: "4. Failed Payments", body: "If a payment fails during the membership purchase process, no charge is made and no membership is activated. You can retry the payment at any time." },
  { title: "5. Duplicate Charges", body: "If you are charged twice for the same membership due to a technical error, contact support@wedbridge.in with transaction details. We will refund the duplicate charge within 7 business days." },
  { title: "6. Vendor Bookings", body: "Vendor booking payments are handled directly between users and vendors. WedBridge does not process vendor booking payments and is not responsible for vendor refund policies." },
  { title: "7. Chargebacks", body: "Initiating a chargeback without first contacting support may result in account suspension. Please contact us at support@wedbridge.in to resolve any billing issues." },
  { title: "8. Bank Processing Time", body: "Approved refunds may take 5-10 business days to reflect in your account, depending on your bank's processing time." },
];

export function RefundClient() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Reveal>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Refund Policy</h1>
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
