/** @format */

"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Member type for the lists
export type StatMember = {
    id: string;
    email?: string;
    imageURL?: string;
    avatarURL?: string;
    firstName?: string;
    lastName?: string;
};

// Stat card configuration
export type StatConfig = {
    key: string;
    label: string;
    singularLabel: string;
    members: StatMember[];
    icon: LucideIcon;
    color: string;
    bgColor: string;
    hoverBorder: string;
};

interface CollapsibleStatsCardsProps {
    stats: StatConfig[];
    className?: string;
}

export function CollapsibleStatsCards({
    stats,
    className,
}: CollapsibleStatsCardsProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(
        {}
    );

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const getUserDisplayName = (member: StatMember) => {
        if (member.firstName && member.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }
        if (member.firstName) return member.firstName;
        if (member.email) return member.email;
        return "Unknown";
    };

    const getUserInitials = (member: StatMember) => {
        if (member.firstName && member.lastName) {
            return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
        }
        if (member.firstName) return member.firstName[0].toUpperCase();
        if (member.email) return member.email[0].toUpperCase();
        return "?";
    };

    return (
        <section className={cn("mb-8", className)}>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const isOpen = openSections[stat.key] ?? false;
                    const count = stat.members.length;

                    return (
                        <Collapsible
                            key={stat.key}
                            open={isOpen}
                            onOpenChange={() => toggleSection(stat.key)}
                        >
                            <div
                                className={cn(
                                    "rounded-xl border bg-card transition-all duration-200",
                                    stat.hoverBorder,
                                    isOpen && "border-primary/20"
                                )}
                            >
                                <CollapsibleTrigger asChild>
                                    <button className="w-full p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "flex size-10 items-center justify-center rounded-lg",
                                                        stat.bgColor
                                                    )}
                                                >
                                                    <stat.icon
                                                        className={cn(
                                                            "size-5",
                                                            stat.color
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold tabular-nums">
                                                        {count}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {stat.label}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    "size-5 text-muted-foreground transition-transform duration-200",
                                                    isOpen && "rotate-180"
                                                )}
                                            />
                                        </div>
                                    </button>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <div className="border-t px-5 pb-4 pt-3">
                                        {count === 0 ? (
                                            <p className="text-sm text-muted-foreground/60 italic py-2">
                                                No {stat.label.toLowerCase()}{" "}
                                                yet
                                            </p>
                                        ) : (
                                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                                {stat.members.map((member) => (
                                                    <li
                                                        key={member.id}
                                                        className="flex items-center gap-3 rounded-lg py-1.5 px-2 -mx-2 hover:bg-muted/50 transition-colors"
                                                    >
                                                        <Avatar className="size-8">
                                                            {member.imageURL ||
                                                            member.avatarURL ? (
                                                                <AvatarImage
                                                                    src={
                                                                        member.imageURL ??
                                                                        member.avatarURL ??
                                                                        undefined
                                                                    }
                                                                    alt={getUserDisplayName(
                                                                        member
                                                                    )}
                                                                />
                                                            ) : null}
                                                            <AvatarFallback
                                                                className={cn(
                                                                    "text-xs font-medium",
                                                                    stat.bgColor,
                                                                    stat.color
                                                                )}
                                                            >
                                                                {getUserInitials(
                                                                    member
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">
                                                                {getUserDisplayName(
                                                                    member
                                                                )}
                                                            </p>
                                                            {member.email &&
                                                                member.firstName && (
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {
                                                                            member.email
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    );
                })}
            </div>
        </section>
    );
}

// Skeleton component for loading state
export function CollapsibleStatsCardsSkeleton() {
    return (
        <section className="mb-8">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-24 rounded-xl bg-muted animate-pulse"
                    />
                ))}
            </div>
        </section>
    );
}


