"use client";
import { UserCog } from "lucide-react";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
export default function ProfileEditPage() { return (<ProtectedPage title="Edit Profile" description="Update your profile information and preferences." icon={UserCog} action={{ label: "View profile", href: "/profile" }} />); }
