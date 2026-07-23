import Link from "next/link";
import { UtensilsCrossed, Camera, Flower2, Music, ArrowRight, Sparkles, Video, Brush, Shirt, Gem, Mail, CalendarCheck, Car, Hand, Church, Gift, Cake, Radio, Building2 } from "lucide-react";
import { VENDOR_CATEGORIES } from "@/firebase/schema";

const ICONS: Record<string, typeof UtensilsCrossed> = {
  UtensilsCrossed,
  Camera,
  Flower2,
  Music,
  Sparkles,
  Video,
  Brush,
  Shirt,
  Gem,
  Mail,
  CalendarCheck,
  Car,
  Hand,
  Church,
  Gift,
  Cake,
  Radio,
  Building2,
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="text-center">
        <h1 className="heading-lg">Wedding Services</h1>
        <p className="text-lead mt-3">Trusted vendors for every wedding need.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VENDOR_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] ?? ArrowRight;
          return (
            <Link key={cat.id} href={`/services/${cat.id}`} className="card card-hover group p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="heading-sm mt-4">{cat.name}</h2>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600">
                Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
