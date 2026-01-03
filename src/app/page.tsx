/** @format */

"use client";

import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import { MagicCodeAuth } from "@/components/auth/magic-code-auth";
import GuestLimitations from "@/components/guest/guest-limitations-section";
import GuestDescription from "@/components/guest/guest-description";
import TryAsGuestButton from "@/components/auth/guest-auth";
import OrgList from "@/components/organizations/org-list";
import { GoogleOAuthButton } from "@/components/auth/google-oauth";
import GuestUpgradeCard from "@/components/guest/guest-upgrade-card";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { NavUserNavbar } from "@/components/navbar/nav-user-navbar";

export default function Home() {
    return (
        <>
            <db.SignedIn>
                <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <div></div>

                        <div className="absolute left-1/2 -translate-x-1/2">
                            <Logo />
                        </div>

                        <div className="flex items-center gap-3">
                            <NavUserNavbar />
                        </div>
                    </div>
                </header>
            </db.SignedIn>
            <db.SignedOut>
                <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <div></div>

                        <div className="absolute left-1/2 -translate-x-1/2">
                            <Logo />
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeSwitch />
                        </div>
                    </div>
                </header>
            </db.SignedOut>
            <div className="min-h-screen flex justify-center p-4">
                <db.SignedIn>
                    <SignedInView />
                </db.SignedIn>
                <db.SignedOut>
                    <SignedOutView />
                </db.SignedOut>
            </div>
        </>
    );
}

export function SignedOutView() {
    return (
        <div className="w-full max-w-md space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <TryAsGuestButton />
                    <GuestDescription />
                    <GuestLimitations />
                </div>
                <MagicCodeAuth />
                <GoogleOAuthButton />
            </div>
        </div>
    );
}

function SignedInView() {
    const { user } = useAuthContext();
    return (
        <div className="w-full max-w-6xl space-y-6">
            <OrgList />
            {user.isGuest && (
                <div className="w-full mx-auto flex justify-center items-center">
                    <GuestUpgradeCard />
                </div>
            )}
        </div>
    );
}
