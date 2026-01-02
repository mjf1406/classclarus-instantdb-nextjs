/** @format */

"use client";

import Link from "next/link";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";

import { db } from "@/lib/db/db";
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

export function NavUser() {
    const user = db.useUser();
    const { data, isLoading } = db.useQuery({
        $users: {
            $: {
                where: {
                    id: user?.id,
                },
                limit: 1,
            },
        },
    });
    const userInfo = data?.$users?.[0];

    if (!user) {
        return null;
    }

    const displayName =
        userInfo?.firstName && userInfo?.lastName
            ? `${userInfo?.firstName} ${userInfo?.lastName}`
            : userInfo?.email || "User";
    const avatarUrl = userInfo?.avatarURL || user.imageURL || undefined;
    // Normalize empty strings to undefined
    const normalizedAvatarUrl =
        avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined;
    const initials =
        userInfo?.firstName && userInfo?.lastName
            ? `${userInfo?.firstName[0]}${userInfo?.lastName[0]}`
            : userInfo?.email?.[0]?.toUpperCase() || "U";

    const handleSignOut = () => {
        db.auth.signOut().catch((err) => {
            console.error("Error signing out:", err);
        });
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
                            {userInfo?.plan && (
                                <span className="truncate text-xs text-muted-foreground">
                                    {(userInfo?.plan).charAt(0).toUpperCase() +
                                        (userInfo?.plan).slice(1)}
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
