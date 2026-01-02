/** @format */

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import GuestUpgradeCard from "../guest/guest-upgrade-card";
import { NavClassManagement } from "./nav-class-management";
import { NavMain } from "./nav-main";
import { NavRandom } from "./nav-random";
import { NavStudentFacing } from "./nav-student-facing";
import { OrganizationSwitcher } from "./sidebar-header";
import { NavUser } from "./nav-user";

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
