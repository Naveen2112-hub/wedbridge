"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader as Loader2, Save, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createProfile, getProfileByUserId, updateProfile, uploadProfilePhoto } from "@/lib/profile/profileService";
import { useToast } from "@/components/ui/Toast";
import { sanitizeText, validatePhone } from "@/lib/utils";

const religions = ["Hindu", "Christian", "Muslim", "Sikh", "Jain"];
const districts = ["Chennai", "Coimbatore", "Madurai", "Tirunelveli", "Salem", "Trichy", "Vellore"];

export function ProfileEditForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState("");
  const [form, setForm] = useState({
    name: "", gender: "male" as "male" | "female", dob: "", religion: "Hindu", caste: "", motherTongue: "Tamil",
    education: "", occupation: "", income: "", phone: "", city: "", district: "", state: "Tamil Nadu",
    height: "", weight: "", maritalStatus: "never_married", familyType: "nuclear", bio: "",
  });

  useEffect(() => {
    (async () => {
      if (!user) return;
      const p = await getProfileByUserId(user.uid);
      if (p) { setProfileId(p.id ?? null); setPhotoURL(p.photoURL ?? ""); setForm((f) => ({ ...f, ...(p as Partial<typeof f>), dob: (p.dob as string) ?? "" })); }
    })();
  }, [user]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast("Image must be under 5MB", "error"); return; }
    setUploading(true);
    const url = await uploadProfilePhoto(user.uid, file);
    setUploading(false);
    if (url) { setPhotoURL(url); toast("Photo uploaded", "success"); }
    else toast("Upload failed", "error");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (sanitizeText(form.name).length < 2) { toast("Name is required", "error"); return; }
    if (form.phone && !validatePhone(form.phone)) { toast("Enter a valid 10-digit phone", "error"); return; }
    setLoading(true);
    const data = { ...form, name: sanitizeText(form.name), bio: sanitizeText(form.bio), userId: user.uid, uid: user.uid, dateOfBirth: form.dob, photoURL, photoURLs: [] as string[], createdBy: "user" as const, status: "pending" as const, featured: false };
    if (profileId) { await updateProfile(profileId, data); toast("Profile updated!", "success"); }
    else { const id = await createProfile(data); if (id) { setProfileId(id); toast("Profile created!", "success"); } else { toast("Failed to create profile", "error"); setLoading(false); return; } }
    setLoading(false);
    router.push("/profile");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="heading-md">{profileId ? "Edit Profile" : "Create Profile"}</h1>
      <p className="text-lead mt-1 text-sm">Fill in your details to find the best matches.</p>
      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-primary-100">{photoURL && <Image src={photoURL} alt="Your profile photo" fill sizes="80px" className="object-cover" />}</div>
        <label className="btn-outline cursor-pointer text-sm">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" />Upload Photo</>}<input type="file" accept="image/*" className="hidden" onChange={handlePhoto} /></label>
        {photoURL && <button type="button" onClick={() => setPhotoURL("")} className="btn-ghost text-sm"><X className="h-4 w-4" />Remove</button>}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} required />
          <div><label className="label">Gender</label><select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="male">Male</option><option value="female">Female</option></select></div>
          <Field label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} required />
          <div><label className="label">Religion</label><select className="input" value={form.religion} onChange={(e) => set("religion", e.target.value)}>{religions.map((r) => <option key={r}>{r}</option>)}</select></div>
          <Field label="Caste" value={form.caste} onChange={(v) => set("caste", v)} />
          <Field label="Mother Tongue" value={form.motherTongue} onChange={(v) => set("motherTongue", v)} />
          <Field label="Education" value={form.education} onChange={(v) => set("education", v)} />
          <Field label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
          <Field label="Annual Income" value={form.income} onChange={(v) => set("income", v)} />
          <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
          <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
          <div><label className="label">District</label><select className="input" value={form.district} onChange={(e) => set("district", e.target.value)}><option value="">Select</option>{districts.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="label">Marital Status</label><select className="input" value={form.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)}><option value="never_married">Never Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option><option value="awaiting_divorce">Awaiting Divorce</option></select></div>
          <div><label className="label">Family Type</label><select className="input" value={form.familyType} onChange={(e) => set("familyType", e.target.value)}><option value="nuclear">Nuclear</option><option value="joint">Joint</option></select></div>
        </div>
        <div><label className="label">About Yourself</label><textarea className="input" rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell us about yourself…" maxLength={500} /></div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />{profileId ? "Update Profile" : "Create Profile"}</>}</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return <div><label className="label">{label}{required && " *"}</label><input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} required={required} /></div>;
}
