import Link from "next/link";
import { UtensilsCrossed, Camera, Flower2, Music, ArrowRight } from "lucide-react";

export default function ServicesPage() {
  const services = [
    { icon: UtensilsCrossed, title: "Catering", desc: "Traditional Tamil Nadu cuisine for your wedding.", color: "bg-primary-50 text-primary-600" },
    { icon: Camera, title: "Photography", desc: "Capture every precious moment.", color: "bg-secondary-50 text-secondary-600" },
    { icon: Flower2, title: "Decoration", desc: "Beautiful venue and stage decoration.", color: "bg-accent-50 text-accent-600" },
    { icon: Music, title: "Music & Entertainment", desc: "Live music and entertainment services.", color: "bg-success-50 text-success-600" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="text-center">
        <h1 className="heading-lg">Wedding Services</h1>
        <p className="text-lead mt-3">Trusted vendors for every wedding need.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Link key={s.title} href="/services" className="card card-hover group p-6">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </span>
            <h2 className="heading-sm mt-4">{s.title}</h2>
            <p className="text-body mt-2">{s.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600">
              Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
