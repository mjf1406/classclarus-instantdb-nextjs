/** @format */

"use client";

import { db } from "@/lib/db/db";
import { MagicCodeAuth } from "@/components/auth/magic-code-auth";
import GuestLimitations from "@/components/guest/guest-limitations-section";
import GuestDescription from "@/components/guest/guest-description";
import TryAsGuestButton from "@/components/auth/guest-auth";
import GoogleOAuthButton from "@/components/auth/google-oauth";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Logo } from "@/components/brand/logo";
import OrgList from "@/components/organizations/org-list";
import CreateOrganizationDialog from "@/components/organizations/create-org-dialog";

export default function Home() {
    return (
        <div className="min-h-screen flex justify-center p-4">
            <div className="top-0 right-0 fixed m-3">
                <ThemeSwitch />
            </div>
            <db.SignedIn>
                <SignedInView />
            </db.SignedIn>
            <db.SignedOut>
                <SignedOutView />
            </db.SignedOut>
        </div>
    );
}

function SignedOutView() {
    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2 flex items-center justify-center">
                <Logo />
            </div>
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
    return (
        <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2 flex items-center justify-center">
                <Logo />
            </div>
            <OrgList />
        </div>
    );
}
