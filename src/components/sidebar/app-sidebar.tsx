/** @format */

import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { NavClassManagement } from "./nav-class-management";
import { NavMain } from "./nav-main";
import { NavRandom } from "./nav-random";
import { NavStudentFacing } from "./nav-student-facing";
import { OrganizationSwitcher } from "./sidebar-header";
import { Logo } from "../brand/logo";
import AppSidebarFooter from "./app-sidebar-footer";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                    <Logo />
                </Link>
                <OrganizationSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
                <NavRandom />
                <NavClassManagement />
                <NavStudentFacing />
            </SidebarContent>
            <AppSidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}
