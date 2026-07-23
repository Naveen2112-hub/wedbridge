"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";

export function ContactClient() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast("Message sent! We will get back to you soon.", "success");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Have questions? We&apos;re here to help. Reach out through any of the channels below.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-4">
            <a href="tel:+916383109341" className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Phone</p>
                <p className="text-lg font-semibold text-neutral-900">+91 63831 09341</p>
              </div>
            </a>
            <a href="mailto:support@wedbridge.in" className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                <Mail className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Email</p>
                <p className="text-lg font-semibold text-neutral-900">support@wedbridge.in</p>
              </div>
            </a>
            <a href="https://wa.me/916383109341" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">WhatsApp</p>
                <p className="text-lg font-semibold text-neutral-900">+91 63831 09341</p>
              </div>
            </a>
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Address</p>
                <p className="text-lg font-semibold text-neutral-900">Tamil Nadu, India</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-xl font-bold text-neutral-900">Send a Message</h2>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                required
              />
              <textarea
                placeholder="Your Message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send Message"} <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
