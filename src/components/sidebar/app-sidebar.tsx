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
import { Logo } from "../brand/logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <Logo />
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
