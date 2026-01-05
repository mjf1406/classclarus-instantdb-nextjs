/** @format */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react";

import { db } from "@/lib/db/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MagicCodeAuth } from "@/components/auth/magic-code-auth";
import TryAsGuestButton from "@/components/auth/guest-auth";
import { GoogleOAuthButton } from "@/components/auth/google-oauth";
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
import { useAuthContext } from "../auth/auth-provider";
import GuestUpgradeCard from "@/components/guest/guest-upgrade-card";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";

type User =
    | {
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
      }
    | null
    | undefined;

export function NavUser({
    user: userProp,
    isLoading: isLoadingProp,
}: {
    user?: User;
    isLoading?: boolean;
}) {
    const { isMobile } = useSidebar();
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
                <NavUserSignedIn
                    isMobile={isMobile}
                    user={user}
                />
            </db.SignedIn>
            <db.SignedOut>
                <NavUserSignedOut />
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
    const router = useRouter();
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

    const handleSignOut = async () => {
        try {
            await db.auth.signOut();
            router.push("/");
        } catch (err) {
            console.error("Error signing out:", err);
        }
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

function NavUserSignedOut() {
    return (
        <>
            <SidebarMenuItem>
                <TryAsGuestButton />
            </SidebarMenuItem>
            <SidebarMenuItem>
                <MagicCodeAuth />
            </SidebarMenuItem>
            <SidebarMenuItem>
                <GoogleOAuthButton />
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
