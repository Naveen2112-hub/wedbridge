"use client";

import { Reveal } from "@/components/ui/Reveal";

const sections = [
  { title: "1. Information We Collect", body: "We collect information you provide during registration including name, email, phone, gender, date of birth, religion, caste, district, and profile photos. We also collect usage data such as search queries, interests sent, and profile views." },
  { title: "2. How We Use Your Information", body: "Your information is used to create and maintain your profile, provide matchmaking services, send notifications, verify identity, process payments, and improve our services. We never sell your data to third parties." },
  { title: "3. Data Storage & Security", body: "Your data is stored securely using Firebase infrastructure with industry-standard encryption. Contact details are only visible to users you have accepted interests from. Payment information is processed through Razorpay and is not stored on our servers." },
  { title: "4. Profile Visibility", body: "Your profile is visible to other registered users based on your privacy settings. You can control who sees your contact information through your contact visibility settings." },
  { title: "5. Third-Party Services", body: "We use Firebase for authentication and data storage, Razorpay for payments, and optional Telegram for notifications. These services have their own privacy policies which we encourage you to review." },
  { title: "6. Data Retention", body: "Your profile data is retained while your account is active. You can request account deletion at any time, and we will remove your data within 30 days, except where required by law." },
  { title: "7. Your Rights", body: "You have the right to access, correct, or delete your personal data. You can update your profile at any time through your dashboard settings. Contact support@wedbridge.in for data requests." },
  { title: "8. Cookies", body: "We use essential cookies for authentication and session management. We do not use tracking cookies for advertising. Your language and theme preferences are stored in your browser's local storage." },
  { title: "9. Children's Privacy", body: "WedBridge is only for users 18 years and older. We do not knowingly collect data from minors. If you believe a minor has registered, please contact us immediately." },
  { title: "10. Changes to This Policy", body: "We may update this privacy policy from time to time. Users will be notified of significant changes via email or in-app notification. Continued use after changes constitutes acceptance." },
];

export function PrivacyClient() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Reveal><h1 className="text-4xl font-bold tracking-tight text-neutral-900">Privacy Policy</h1><p className="mt-2 text-sm text-neutral-500">Last updated: January 2025</p></Reveal>
      <div className="mt-8 space-y-6">
        {sections.map((s, i) => (
          <Reveal key={i} delay={i * 30}>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6"><h2 className="text-lg font-semibold text-neutral-900">{s.title}</h2><p className="mt-2 text-sm text-neutral-600">{s.body}</p></div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
