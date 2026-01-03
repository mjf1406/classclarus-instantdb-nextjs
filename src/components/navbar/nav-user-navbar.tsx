/** @format */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";

import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GuestUpgradeCard from "@/components/guest/guest-upgrade-card";
import { ThemeSwitch } from "@/components/theme/theme-switch";

export function NavUserNavbar() {
    const { user } = useAuthContext();
    const router = useRouter();

    if (!user) {
        return null;
    }

    const displayName =
        user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email || "User";
    const avatarUrl = user.avatarURL || user.imageURL || undefined;
    // Normalize empty strings to undefined
    const normalizedAvatarUrl =
        avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined;
    const initials =
        user.firstName && user.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`
            : user.email?.[0]?.toUpperCase() || "U";

    const handleSignOut = async () => {
        try {
            await db.auth.signOut();
            router.push("/");
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="User menu"
                >
                    <Avatar
                        className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-80"
                        key={normalizedAvatarUrl || "no-avatar"}
                    >
                        <AvatarImage
                            src={normalizedAvatarUrl}
                            alt={displayName}
                        />
                        <AvatarFallback className="text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="min-w-56 rounded-lg"
                align="end"
                sideOffset={8}
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
                            {user.plan && (
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.plan.charAt(0).toUpperCase() +
                                        user.plan.slice(1)}
                                </span>
                            )}
                            {user.isGuest && (
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

                {/* Guest upgrade section */}
                {user.isGuest && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <GuestUpgradeCard size="small" />
                        </div>
                    </>
                )}

                {/* Regular user options */}
                {!user.isGuest && (
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

                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
