/** @format */

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { NavMain } from "@/components/navigation/nav-main";
import { NavRandom } from "@/components/navigation/nav-random";
import { NavClassManagement } from "@/components/navigation/nav-class-management";
import { NavStudentFacing } from "@/components/navigation/nav-student-facing";
import { NavUser } from "@/components/navigation/nav-user";
import { GuestUpgradeCard } from "@/components/guest-upgrade-card";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <Link
                    href="/"
                    className="flex items-center justify-center mb-4 hover:opacity-80 transition-opacity"
                >
                    <Image
                        src="/classclarus-logo.webp"
                        alt="ClassClarus Logo"
                        width={217}
                        height={53}
                        className="h-auto w-auto"
                        priority
                    />
                </Link>
                <OrganizationSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
                <NavRandom />
                <NavClassManagement />
                <NavStudentFacing />
            </SidebarContent>
            <SidebarFooter>
                <GuestUpgradeCard />
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
