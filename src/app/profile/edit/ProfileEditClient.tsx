"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader as Loader2, CircleAlert as AlertCircle, CircleAlert as AlertTriangle, CircleCheck as CheckCircle2, User, Phone, MapPin, Calendar, Shield, Users, GraduationCap, Briefcase, IndianRupee, HeartHandshake, Ruler, BookOpen, Leaf, Cigarette, Wine, Star, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { profileSchema, type ProfileValues, mapAuthError } from "@/lib/auth/validations";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { OCRUploader } from "@/components/profile/OCRUploader";
import { CompletionCard } from "@/components/profile/CompletionCard";
import { getProfile, saveProfile } from "@/lib/profile/profileService";
import type { ProfileDocument } from "@/firebase/schema";
import type { PartialProfile, ProfileWithConfidence } from "@/lib/profile/ocrTypes";
import { reviewFields } from "@/lib/profile/ocrTypes";
import { cn } from "@/lib/cn";

const INDIAN_STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Puducherry"];
const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Kanyakumari"];
const RELIGIONS = ["Hindu", "Christian", "Muslim", "Jain", "Sikh", "Other"];
const TONGUES = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "English", "Other"];
const STARS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const RASIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];

export default function ProfileEditPage() { return <AuthGuard><ProtectedLayout><ProfileEditContent /></ProtectedLayout></AuthGuard>; }

function ProfileEditContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ocrReview, setOcrReview] = useState<{ key: string; value: string; confidence: number }[] | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: "", gender: "male", dateOfBirth: "", religion: "", caste: "", motherTongue: "", district: "", state: "Tamil Nadu", country: "India", phone: "", email: "", photoURL: "", contactVisibility: "after_accept", maritalStatus: "never_married", height: "", education: "", occupation: "", annualIncome: "", profileVisibility: "visible" } as ProfileValues });

  useEffect(() => { (async () => { if (!user) return; const p = await getProfile(user.uid); if (p) { reset(p as ProfileValues); setPhotoURL(p.photoURL ?? ""); setGallery(p.gallery ?? []); } setLoading(false); })(); }, [user, reset]);
  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div>;

  const watched = watch();
  const draft = { ...watched, photoURL, gallery, accountStatus: "active" as const, verificationStatus: "unverified" as const };

  const onSubmit = async (values: ProfileValues) => {
    setAuthError(null); setSaved(false);
    try { if (!user) return; await saveProfile(user.uid, { ...values, photoURL, gallery } as Partial<ProfileDocument>); setSaved(true); setTimeout(() => router.push("/profile"), 1200); }
    catch (err) { setAuthError(mapAuthError(err)); }
  };

  const onOCR = (data: PartialProfile) => {
    if (data.name) setValue("name", data.name);
    if (data.dateOfBirth) setValue("dateOfBirth", data.dateOfBirth);
    if (data.education) setValue("education", data.education);
    if (data.occupation) setValue("occupation", data.occupation);
    if (data.religion) setValue("religion", data.religion);
    if (data.caste) setValue("caste", data.caste);
    if (data.height) setValue("height", data.height);
    if (data.district) setValue("district", data.district);
    if (data.phone) setValue("phone", data.phone);
  };

  const onOCRConfidence = (data: ProfileWithConfidence) => {
    const review = reviewFields(data).map(({ key, field }) => ({ key, value: field.value, confidence: field.confidence }));
    setOcrReview(review.length > 0 ? review : null);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="heading-md">{t("profile.edit")}</h1><p className="text-lead mt-2">Update your information and preferences.</p></div>

      {authError && <p className="flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t(authError as never)}</p>}
      {saved && <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{t("profile.saved")}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={t("profile.basic")}>
            <div className="mb-5"><PhotoUploader uid={user!.uid} value={photoURL} onChange={setPhotoURL} /></div>
            <div className="mb-5"><OCRUploader onExtract={onOCR} onConfidence={onOCRConfidence} /></div>
            {ocrReview && ocrReview.length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-800"><AlertTriangle className="h-4 w-4" />{ocrReview.length} field(s) need review</p>
                <ul className="mt-2 space-y-1 text-xs text-amber-700">{ocrReview.map((r) => (<li key={r.key}><span className="font-medium">{r.key}</span>: {r.value} <span className="text-amber-500">({Math.round(r.confidence * 100)}%)</span></li>))}</ul>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("auth.complete.name")} icon={User} error={errors.name && t("auth.error.required")}><input className="auth-input pl-10" {...register("name")} /></Field>
              <Field label={t("auth.complete.dob")} icon={Calendar} error={errors.dateOfBirth && t("auth.error.required")}><input type="date" className="auth-input pl-10" {...register("dateOfBirth")} /></Field>
            </div>
            <div className="mt-4"><label className="label">{t("auth.complete.gender")}</label><div className="grid grid-cols-3 gap-2">{(["male", "female", "other"] as const).map((g) => (<label key={g} className={cn("cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition", watch("gender") === g ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-gray-500 hover:border-primary-300")}><input type="radio" value={g} className="sr-only" {...register("gender")} />{t(`auth.complete.${g}` as never)}</label>))}</div></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("auth.complete.religion")} icon={Shield} error={errors.religion && t("auth.error.required")}><select className="auth-input pl-10" {...register("religion")}><option value="">Select…</option>{RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label={t("auth.complete.caste")} icon={Users} error={errors.caste && t("auth.error.required")}><input className="auth-input pl-10" {...register("caste")} /></Field>
              <Field label={t("auth.complete.motherTongue")} icon={Users} error={errors.motherTongue && t("auth.error.required")}><select className="auth-input pl-10" {...register("motherTongue")}><option value="">Select…</option>{TONGUES.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label={t("auth.complete.maritalStatus")} icon={HeartHandshake} error={errors.maritalStatus && t("auth.error.required")}><select className="auth-input pl-10" {...register("maritalStatus")}>{([["never_married", "Never Married"], ["divorced", "Divorced"], ["widowed", "Widowed"], ["awaiting_divorce", "Awaiting Divorce"]] as [string, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label={t("auth.complete.district")} icon={MapPin} error={errors.district && t("auth.error.required")}><select className="auth-input pl-10" {...register("district")}><option value="">Select…</option>{TN_DISTRICTS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label={t("auth.complete.state")} icon={MapPin} error={errors.state && t("auth.error.required")}><select className="auth-input pl-10" {...register("state")}>{INDIAN_STATES.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label={t("auth.complete.country")} icon={MapPin} error={errors.country && t("auth.error.required")}><input className="auth-input pl-10" {...register("country")} /></Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("auth.complete.phone")} icon={Phone} error={errors.phone && t("auth.error.required")}><input type="tel" className="auth-input pl-10" {...register("phone")} /></Field>
              <Field label={t("auth.complete.email")} icon={User} error={errors.email && t("auth.error.email")}><input type="email" className="auth-input pl-10" {...register("email")} /></Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label={t("auth.complete.height")} icon={Ruler} error={errors.height && t("auth.error.required")}><input className="auth-input pl-10" {...register("height")} /></Field>
              <Field label={t("auth.complete.education")} icon={GraduationCap} error={errors.education && t("auth.error.required")}><input className="auth-input pl-10" {...register("education")} /></Field>
              <Field label={t("auth.complete.occupation")} icon={Briefcase} error={errors.occupation && t("auth.error.required")}><input className="auth-input pl-10" {...register("occupation")} /></Field>
            </div>
            <div className="mt-4"><Field label={t("auth.complete.annualIncome")} icon={IndianRupee} error={errors.annualIncome && t("auth.error.required")}><input className="auth-input pl-10" {...register("annualIncome")} /></Field></div>
          </Card>

          <Card title={t("profile.family")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("profile.fatherName")} icon={User}><input className="auth-input pl-10" {...register("fatherName")} /></Field>
              <Field label={t("profile.motherName")} icon={User}><input className="auth-input pl-10" {...register("motherName")} /></Field>
              <Field label={t("profile.brothers")} icon={Users}><input className="auth-input pl-10" {...register("brothers")} /></Field>
              <Field label={t("profile.sisters")} icon={Users}><input className="auth-input pl-10" {...register("sisters")} /></Field>
              <Field label={t("profile.familyType")} icon={Users}><select className="auth-input pl-10" {...register("familyType")}><option value="">Select…</option><option value="nuclear">Nuclear</option><option value="joint">Joint</option></select></Field>
              <Field label={t("profile.familyStatus")} icon={Users}><select className="auth-input pl-10" {...register("familyStatus")}><option value="">Select…</option><option value="middle">Middle Class</option><option value="upper_middle">Upper Middle</option><option value="rich">Rich</option><option value="affluent">Affluent</option></select></Field>
            </div>
          </Card>

          <Card title={t("profile.lifestyle")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("profile.lifestyle")} icon={Sparkles}><select className="auth-input pl-10" {...register("lifestyle")}><option value="">Select…</option><option value="moderate">Moderate</option><option value="traditional">Traditional</option><option value="modern">Modern</option><option value="orthodox">Orthodox</option></select></Field>
              <Field label={t("profile.food")} icon={Leaf}><select className="auth-input pl-10" {...register("foodPreference")}><option value="">Select…</option><option value="veg">Vegetarian</option><option value="non_veg">Non-Veg</option><option value="eggetarian">Eggetarian</option><option value="jain">Jain</option></select></Field>
              <Field label={t("profile.smoking")} icon={Cigarette}><select className="auth-input pl-10" {...register("smoking")}><option value="">Select…</option><option value="no">No</option><option value="yes">Yes</option></select></Field>
              <Field label={t("profile.drinking")} icon={Wine}><select className="auth-input pl-10" {...register("drinking")}><option value="">Select…</option><option value="no">No</option><option value="yes">Yes</option></select></Field>
            </div>
          </Card>

          <Card title="Astrology">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("profile.horoscope")} icon={BookOpen}><select className="auth-input pl-10" {...register("horoscope")}><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option></select></Field>
              <Field label={t("profile.star")} icon={Star}><select className="auth-input pl-10" {...register("star")}><option value="">Select…</option>{STARS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label={t("profile.rasi")} icon={Star}><select className="auth-input pl-10" {...register("rasi")}><option value="">Select…</option>{RASIS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label={t("profile.manglik")} icon={Star}><select className="auth-input pl-10" {...register("manglik")}><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option><option value="dont_know">Don&apos;t know</option></select></Field>
            </div>
          </Card>

          <Card title={t("profile.about")}><textarea rows={4} className="auth-input" placeholder={t("profile.aboutMe")} {...register("aboutMe")} /></Card>
          <Card title={t("profile.partner")}><textarea rows={4} className="auth-input" placeholder={t("profile.partnerPref")} {...register("partnerPreference")} /></Card>
        </div>

        <div className="space-y-6">
          <CompletionCard profile={draft as never} />
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="font-display text-base font-semibold text-primary-900">{t("auth.complete.contactVisibility")}</h3>
            <div className="mt-3 space-y-2">{(["everyone", "after_accept", "premium_only"] as const).map((v) => (<label key={v} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition", watch("contactVisibility") === v ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-gray-500 hover:border-primary-300")}><input type="radio" value={v} className="sr-only" {...register("contactVisibility")} /><span className={cn("flex h-4 w-4 flex-none items-center justify-center rounded-full border", watch("contactVisibility") === v ? "border-secondary bg-secondary" : "border-primary-200")}>{watch("contactVisibility") === v && <span className="h-2 w-2 rounded-full bg-white" />}</span>{t(`auth.complete.visibility.${v === "everyone" ? "everyone" : v === "after_accept" ? "afterAccept" : "premiumOnly"}` as never)}</label>))}</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="font-display text-base font-semibold text-primary-900">Profile Visibility</h3>
            <div className="mt-3 space-y-2">{(["visible", "hidden"] as const).map((v) => (<label key={v} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition", watch("profileVisibility") === v ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-gray-500 hover:border-primary-300")}><input type="radio" value={v} className="sr-only" {...register("profileVisibility")} /><span className={cn("flex h-4 w-4 flex-none items-center justify-center rounded-full border", watch("profileVisibility") === v ? "border-secondary bg-secondary" : "border-primary-200")}>{watch("profileVisibility") === v && <span className="h-2 w-2 rounded-full bg-white" />}</span>{v === "visible" ? t("profile.visibility.visible") : t("profile.visibility.hidden")}</label>))}</div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.save")}</button>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl bg-white p-6 shadow-md"><h2 className="font-display text-lg font-semibold text-primary-900">{title}</h2><div className="mt-4">{children}</div></div>; }
function Field({ label, icon: Icon, error, children }: { label: string; icon: React.ComponentType<{ className?: string }>; error?: string | null; children: React.ReactNode }) { return (<div><label className="label">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />{children}</div>{error && <p className="mt-1 text-xs text-accent-700">{error}</p>}</div>); }
