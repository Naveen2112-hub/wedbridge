"use client";

import { Heart, Briefcase, Code, BarChart, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const openings = [
  { title: "Senior Full-Stack Developer", type: "Full-time", location: "Chennai", desc: "Build and scale our Next.js and Firebase platform. 5+ years experience with React/TypeScript." },
  { title: "AI/ML Engineer", type: "Full-time", location: "Remote", desc: "Develop and optimize our matchmaking algorithms. Experience with Python, TensorFlow, and recommendation systems." },
  { title: "Product Designer", type: "Full-time", location: "Chennai", desc: "Design beautiful, intuitive user experiences. Portfolio of web and mobile design required." },
  { title: "Customer Success Manager", type: "Full-time", location: "Coimbatore", desc: "Help our users find their perfect match. Excellent communication skills in Tamil and English." },
  { title: "Vendor Partnerships Lead", type: "Full-time", location: "Madurai", desc: "Grow our wedding vendor marketplace. Experience in business development and vendor onboarding." },
];

export function CareersClient() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Reveal>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100"><Heart className="h-8 w-8 text-rose-600" fill="currentColor" /></div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-900">Careers at WedBridge</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">Join us in building Tamil Nadu&apos;s most trusted matrimony platform. We are looking for passionate people who want to make a difference.</p>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[{ icon: Briefcase, label: "Open Roles", value: "5" }, { icon: Code, label: "Tech Stack", value: "Next.js + Firebase" }, { icon: BarChart, label: "Growth", value: "50K+ Users" }].map((s) => (
            <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-6 text-center"><s.icon className="mx-auto h-8 w-8 text-rose-600" /><p className="mt-3 text-lg font-bold text-neutral-900">{s.value}</p><p className="text-sm text-neutral-500">{s.label}</p></div>
          ))}
        </div>
      </Reveal>
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-900">Open Positions</h2>
        <div className="mt-6 space-y-4">
          {openings.map((job, i) => (
            <Reveal key={job.title} delay={i * 50}>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div><h3 className="text-lg font-semibold text-neutral-900">{job.title}</h3><p className="mt-1 text-sm text-neutral-500">{job.type} · {job.location}</p></div>
                  <a href={`mailto:support@wedbridge.in?subject=Application: ${encodeURIComponent(job.title)}`} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">Apply</a>
                </div>
                <p className="mt-3 text-sm text-neutral-600">{job.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal delay={200}>
        <div className="mt-12 rounded-2xl bg-rose-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Don&apos;t see the right role?</h2>
          <p className="mt-2 text-rose-100">Send us your resume and we&apos;ll reach out when a match comes up.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="mailto:support@wedbridge.in" className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-rose-600"><Mail className="h-4 w-4" /> support@wedbridge.in</a>
            <a href="tel:+916383109341" className="flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white"><Phone className="h-4 w-4" /> +91 63831 09341</a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
