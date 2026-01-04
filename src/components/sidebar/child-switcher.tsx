/** @format */

"use client";

import { useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronsUpDown, User } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db/db";
import { useAuthContext } from "../auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function ChildSwitcher({
    user,
    isLoading: isLoadingProp,
    pathname,
}: {
    user?: User;
    isLoading?: boolean;
    pathname: string;
}) {
    const { isMobile } = useSidebar();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orgId = params.orgId as string | undefined;
    const classId = params.classId as string | undefined;

    // Get selected child from URL search params, default to first child
    const selectedChildId = searchParams.get("childId");

    // Query current user's children
    const { data, isLoading: childrenLoading } = db.useQuery(
        user?.id
            ? {
                  $users: {
                      $: { where: { id: user.id } },
                      children: {},
                  },
              }
            : null
    );

    const userData = data?.$users?.[0];
    const children = userData?.children ?? [];
    const isLoading = isLoadingProp ?? childrenLoading;

    // Get selected child or default to first child
    const selectedChild = selectedChildId
        ? children.find((c: any) => c.id === selectedChildId)
        : children[0];

    if (!user?.id || children.length === 0) {
        return null;
    }

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
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="ml-auto size-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const getChildDisplayName = (child: any) => {
        if (child.firstName && child.lastName) {
            return `${child.firstName} ${child.lastName}`;
        }
        if (child.firstName) return child.firstName;
        if (child.email) return child.email;
        return "Unknown";
    };

    const getChildInitials = (child: any) => {
        if (child.firstName && child.lastName) {
            return `${child.firstName[0]}${child.lastName[0]}`.toUpperCase();
        }
        if (child.firstName) return child.firstName[0].toUpperCase();
        if (child.email) return child.email[0].toUpperCase();
        return "?";
    };

    const handleChildSelect = (childId: string) => {
        const currentPath = pathname;
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("childId", childId);
        
        // Update URL with childId param
        router.push(`${currentPath}?${newSearchParams.toString()}`);
    };

    if (!selectedChild) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="size-8">
                                <AvatarImage
                                    src={selectedChild.avatarURL || selectedChild.imageURL || undefined}
                                    alt={getChildDisplayName(selectedChild)}
                                />
                                <AvatarFallback>
                                    {getChildInitials(selectedChild)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {getChildDisplayName(selectedChild)}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {children.length} child{children.length !== 1 ? "ren" : ""}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Children
                        </DropdownMenuLabel>
                        {children.map((child: any) => {
                            const isSelected = child.id === selectedChild.id;
                            return (
                                <DropdownMenuItem
                                    key={child.id}
                                    onClick={() => handleChildSelect(child.id)}
                                    className="gap-2 p-2"
                                >
                                    <Avatar className="size-6">
                                        <AvatarImage
                                            src={child.avatarURL || child.imageURL || undefined}
                                            alt={getChildDisplayName(child)}
                                        />
                                        <AvatarFallback>
                                            {getChildInitials(child)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className={isSelected ? "font-medium" : ""}>
                                        {getChildDisplayName(child)}
                                    </span>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

