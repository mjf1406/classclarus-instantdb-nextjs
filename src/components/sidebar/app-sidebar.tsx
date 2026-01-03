/** @format */

"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { NavClassManagement } from "./nav-class-management";
import { NavMain } from "./nav-main";
import { NavRandom } from "./nav-random";
import { NavStudentFacing } from "./nav-student-facing";
import { OrganizationSwitcher } from "./organization-switcher";
import { Logo, Icon } from "../brand/logo";
import Link from "next/link";
import { useAuthContext } from "../auth/auth-provider";
import GuestUpgradeCard from "../guest/guest-upgrade-card";
import { NavUser } from "./nav-user";
import { Skeleton } from "@/components/ui/skeleton";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { user, isLoading } = useAuthContext();
    const { state } = useSidebar();

    return (
        <Sidebar
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <Link
                    href="/"
                    prefetch={false}
                >
                    {state === "collapsed" ? <Icon /> : <Logo />}
                </Link>
                {/* <OrganizationSwitcher /> */}
            </SidebarHeader>
            <SidebarContent>
                <NavMain pathname={pathname} />
                <NavRandom pathname={pathname} />
                <NavClassManagement pathname={pathname} />
                <NavStudentFacing pathname={pathname} />
            </SidebarContent>
            <SidebarFooter>
                <Link href={"/join"}>Join Org/Class</Link>
                {user?.isGuest && <GuestUpgradeCard />}
                {isLoading ? (
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
                ) : (
                    <OrganizationSwitcher
                        user={user}
                        isLoading={isLoading}
                        pathname={pathname}
                    />
                )}
                {isLoading ? (
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
                ) : (
                    <NavUser
                        user={user}
                        isLoading={isLoading}
                    />
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
