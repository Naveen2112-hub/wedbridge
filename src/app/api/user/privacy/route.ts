import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getPrivacySettings, updatePrivacySettings, DEFAULT_PRIVACY, type PrivacySettings } from "@/lib/user/privacyService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getPrivacySettings(user.uid);
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<PrivacySettings>;
  const allowedKeys: (keyof PrivacySettings)[] = [
    "contactVisibility", "profileVisibility", "showOnlineStatus", "showLastSeen",
    "showProfilePhoto", "allowDirectMessages", "notificationPreference",
    "emailNotifications", "smsNotifications", "telegramNotifications",
  ];

  const update: Partial<PrivacySettings> = {};
  for (const key of allowedKeys) {
    if (key in body) {
      (update as Record<string, unknown>)[key] = body[key];
    }
  }

  const ok = await updatePrivacySettings(user.uid, update);
  return NextResponse.json({ success: ok, settings: { ...DEFAULT_PRIVACY, ...update } });
}
