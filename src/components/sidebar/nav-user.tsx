/** @format */

"use client";

import { useState, useRef, use } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    HelpCircle,
    LogIn,
    LogOut,
    Mail,
    Sparkles,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

import { db } from "@/lib/db/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MagicCodeAuth } from "@/components/auth/magic-code-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "../auth/auth-provider";
import GuestDescription from "@/components/guest/guest-description";
import GuestUpgradeCard from "@/components/guest/guest-upgrade-card";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";

const GOOGLE_CLIENT_NAME = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_NAME || "";

type User = {
    created_at: Date | null | string;
    email: string;
    id: string;
    imageURL: string | null;
    avatarURL: string | null;
    isGuest: boolean;
    polarCustomerId: string | null;
    refresh_token: string | null;
    updated_at: Date | null | string;
    type: string;
    firstName: string | null;
    lastName: string | null;
    plan: string;
} | null | undefined;

export function NavUser({
    user: userProp,
    isLoading: isLoadingProp,
}: {
    user?: User;
    isLoading?: boolean;
}) {
    const { isMobile } = useSidebar();
    const [nonce] = useState(() => uuidv4());
    const { user: contextUser, isLoading: contextLoading } = useAuthContext();
    const user = userProp ?? contextUser;
    const isLoading = isLoadingProp ?? contextLoading;

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="pointer-events-none"
                    >
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="grid flex-1 text-left text-sm leading-tight gap-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="ml-auto size-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <db.SignedIn>
                <NavUserSignedIn isMobile={isMobile} user={user} />
            </db.SignedIn>
            <db.SignedOut>
                <NavUserSignedOut nonce={nonce} />
            </db.SignedOut>
        </SidebarMenu>
    );
}

function NavUserSignedIn({
    isMobile,
    user: userProp,
}: {
    isMobile: boolean;
    user?: User;
}) {
    const { user: contextUser } = useAuthContext();
    const user = userProp ?? contextUser;
    const displayName =
        user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email || "User";
    const avatarUrl = user?.avatarURL || user?.imageURL || undefined;
    // Normalize empty strings to undefined
    const normalizedAvatarUrl =
        avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined;
    const initials =
        user?.firstName && user?.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`
            : user?.email?.[0]?.toUpperCase() || "U";

    const handleSignOut = () => {
        db.auth.signOut().catch((err) => {
            console.error("Error signing out:", err);
        });
    };

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar
                            className="h-8 w-8 rounded-lg"
                            key={normalizedAvatarUrl || "no-avatar"}
                        >
                            <AvatarImage
                                src={normalizedAvatarUrl}
                                alt={displayName}
                            />
                            <AvatarFallback className="rounded-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {displayName}
                            </span>
                            {user?.plan && (
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.plan.charAt(0).toUpperCase() +
                                        user.plan.slice(1)}
                                </span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar
                                className="h-8 w-8 rounded-lg"
                                key={normalizedAvatarUrl || "no-avatar"}
                            >
                                <AvatarImage
                                    src={normalizedAvatarUrl}
                                    alt={displayName}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {displayName}
                                </span>
                                {user?.email && (
                                    <span className="truncate text-xs">
                                        {user.email}
                                    </span>
                                )}
                                {user?.isGuest && (
                                    <span className="truncate text-xs text-muted-foreground">
                                        Guest
                                    </span>
                                )}
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">
                                Theme
                            </span>
                            <ThemeSwitch />
                        </div>
                    </div>
                    {user && user.isGuest && (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-2">
                                <GuestUpgradeCard size="small" />
                            </div>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    {user && !user.isGuest && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Sparkles />
                                    Upgrade to Pro
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/account">
                                        <BadgeCheck />
                                        Account
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CreditCard />
                                    Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Bell />
                                    Notifications
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

function NavUserSignedOut({ nonce }: { nonce: string }) {
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const handleGuestSignIn = () => {
        db.auth.signInAsGuest().catch((err) => {
            console.error("Error signing in as guest:", err);
            alert(
                "Failed to sign in as guest: " +
                    (err.body?.message || err.message)
            );
        });
    };

    const isManualToggle = useRef(false);

    const handleHelpIconClick = (e: React.PointerEvent) => {
        e.stopPropagation();
        // Mark that this is a manual toggle
        isManualToggle.current = true;
        // Toggle tooltip on click (for mobile)
        setTooltipOpen((prev) => !prev);
        // Reset the flag after a short delay
        setTimeout(() => {
            isManualToggle.current = false;
        }, 200);
    };

    const handleTooltipOpenChange = (open: boolean) => {
        // If this is a manual toggle, ignore the change (we already handled it)
        if (isManualToggle.current) {
            return;
        }
        // Allow tooltip to be controlled by hover (desktop)
        setTooltipOpen(open);
    };

    const handleGoogleSuccess = (credentialResponse: {
        credential?: string;
    }) => {
        if (!GOOGLE_CLIENT_NAME) {
            console.error("Google Client Name is not configured");
            alert(
                "Google OAuth is not properly configured. Please check your environment variables."
            );
            return;
        }

        if (!credentialResponse.credential) {
            console.error("No credential received from Google");
            alert(
                "Failed to receive credential from Google. Please try again."
            );
            return;
        }

        // Store JWT token temporarily for server action to extract firstName/lastName
        sessionStorage.setItem(
            "google_id_token",
            credentialResponse.credential
        );

        db.auth
            .signInWithIdToken({
                clientName: GOOGLE_CLIENT_NAME,
                idToken: credentialResponse.credential,
                nonce,
            })
            .catch((err) => {
                console.error("Error signing in with Google:", err);
                // Clear token on error
                sessionStorage.removeItem("google_id_token");
                alert(
                    "Failed to sign in with Google: " +
                        (err.body?.message || err.message)
                );
            });
    };

    const handleGoogleError = () => {
        alert("Google login failed. Please try again.");
    };

    const handleGoogleButtonClick = () => {
        // Find the Google OAuth button inside the hidden container
        const googleButton = googleButtonRef.current?.querySelector(
            'div[role="button"], button'
        ) as HTMLElement;
        if (googleButton) {
            googleButton.click();
        }
    };

    return (
        <>
            <SidebarMenuItem>
                {isCollapsed ? (
                    <SidebarMenuButton
                        onClick={handleGuestSignIn}
                        variant="outline"
                        size="sm"
                        tooltip={{
                            children: (
                                <div>
                                    <p className="font-medium mb-1">
                                        Try as Guest
                                    </p>
                                    <div className="text-xs max-w-48 [&>p]:text-xs [&>p]:text-foreground">
                                        <GuestDescription />
                                    </div>
                                </div>
                            ),
                        }}
                    >
                        <LogIn />
                        <span>Try as Guest</span>
                    </SidebarMenuButton>
                ) : (
                    <div className="flex items-center gap-2 w-full">
                        <SidebarMenuButton
                            onClick={handleGuestSignIn}
                            variant="outline"
                            size="sm"
                            tooltip="Try as Guest"
                            className="flex-1"
                        >
                            <LogIn />
                            <span>Try as Guest</span>
                        </SidebarMenuButton>
                        <Tooltip
                            open={tooltipOpen}
                            onOpenChange={handleTooltipOpenChange}
                        >
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onPointerDown={handleHelpIconClick}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="What is guest mode?"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="max-w-32 [&>p]:text-xs [&>p]:text-foreground">
                                    <GuestDescription />
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </SidebarMenuItem>
            <SidebarMenuItem>
                <MagicCodeAuth
                    trigger={
                        <SidebarMenuButton
                            variant="outline"
                            size="sm"
                            tooltip="Sign in with Email"
                        >
                            <Mail className="h-4 w-4" />
                            <span>Sign in with Email</span>
                        </SidebarMenuButton>
                    }
                />
            </SidebarMenuItem>
            <SidebarMenuItem>
                <div
                    ref={googleButtonRef}
                    className="hidden"
                >
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        nonce={nonce}
                        useOneTap={false}
                        auto_select={false}
                    />
                </div>
                <SidebarMenuButton
                    onClick={handleGoogleButtonClick}
                    variant="outline"
                    size="sm"
                    tooltip="Sign in with Google"
                >
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>Sign in with Google</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <div className="flex items-center justify-between gap-2 w-full px-2 py-1.5">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeSwitch />
                </div>
            </SidebarMenuItem>
        </>
    );
}
