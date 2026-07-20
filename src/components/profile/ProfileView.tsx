"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Loader as Loader2, BadgeCheck, Crown, Star, MapPin, Briefcase, GraduationCap, Phone, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getProfileByUserId } from "@/lib/profile/profileService";
import type { ProfileDocument } from "@/firebase/schema";
import { formatDate } from "@/lib/utils";

export function ProfileView({ profile: passedProfile }: { profile?: ProfileDocument } = {}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileDocument | null>(passedProfile ?? null);
  const [loading, setLoading] = useState(!passedProfile);

  useEffect(() => {
    if (passedProfile) { setProfile(passedProfile); setLoading(false); return; }
    (async () => {
      if (!user) { setLoading(false); return; }
      const p = await getProfileByUserId(user.uid);
      setProfile(p); setLoading(false);
    })();
  }, [user, passedProfile]);

  if (loading) return <div className="px-4 py-16"><div className="skeleton h-64 w-full rounded-2xl" /></div>;
  if (!profile) return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center"><User className="mx-auto h-12 w-12 text-primary-300" /><h1 className="heading-md mt-4">No Profile Yet</h1><p className="text-lead mt-2 text-sm">Create your profile to start finding matches.</p><Link href="/profile/edit" className="btn-primary mt-6">Create Profile</Link></div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-primary-100">{profile.photoURL && <Image src={profile.photoURL} alt={profile.name} fill className="h-full w-full object-cover" />}</div>
            <div className="flex-1 pb-2"><div className="flex items-center gap-2"><h1 className="heading-md">{profile.name}</h1>{profile.verified && <BadgeCheck className="h-5 w-5 text-green-600" />}{profile.premium && <Crown className="h-5 w-5 text-secondary-500" />}{profile.featured && <Star className="h-5 w-5 text-amber-500" />}</div><p className="text-sm text-gray-500">{profile.religion} · {profile.caste ?? ""}</p></div>
            <Link href="/profile/edit" className="btn-outline mb-2 text-sm">Edit Profile</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={Calendar} label="Date of Birth" value={formatDate(profile.dob)} />
            <Info icon={User} label="Gender" value={profile.gender} />
            <Info icon={MapPin} label="Location" value={`${profile.district ?? ""}, ${profile.state ?? "Tamil Nadu"}`} />
            <Info icon={GraduationCap} label="Education" value={profile.education ?? "—"} />
            <Info icon={Briefcase} label="Occupation" value={profile.occupation ?? "—"} />
            <Info icon={Phone} label="Phone" value={profile.phone ?? "—"} />
          </div>
          {profile.bio && <div className="mt-6"><h3 className="font-semibold text-primary-900">About</h3><p className="mt-2 text-sm text-gray-500">{profile.bio}</p></div>}
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-gray-500">{label}</p><p className="text-sm font-medium text-primary-900">{value}</p></div></div>;
}
