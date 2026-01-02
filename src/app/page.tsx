/** @format */

"use client";

import { db } from "@/lib/db/db";
import { MagicCodeAuth } from "@/components/auth/magic-code-auth";
import GuestLimitations from "@/components/guest/guest-limitations-section";
import GuestDescription from "@/components/guest/guest-description";
import TryAsGuestButton from "@/components/auth/guest-auth";
import OrgList from "@/components/organizations/org-list";
import { GoogleOAuthButton } from "@/components/auth/google-oauth";
import AppNavbar from "@/components/navbar/app-navbar";
import SignedOutNavbar from "@/components/navbar/signed-out-navbar";
import GuestUpgradeCard from "@/components/guest/guest-upgrade-card";

export default function Home() {
    return (
        <>
            <db.SignedIn>
                <AppNavbar />
            </db.SignedIn>
            <db.SignedOut>
                <SignedOutNavbar />
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
    const user = db.useUser();
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
