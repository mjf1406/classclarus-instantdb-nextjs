/** @format */

"use client";

import {
    LayoutDashboard,
    Home,
    UserPlus,
    Users,
    GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

const items = [
    {
        title: "Home",
        path: "home",
        icon: Home,
    },
    {
        title: "Dashboard",
        path: "dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Manage Members",
        path: "manage-members",
        icon: Users,
    },
    {
        title: "Join Code",
        path: "join-org",
        icon: UserPlus,
    },
    {
        title: "Classes",
        path: "classes",
        icon: GraduationCap,
    },
];

export function NavOrg({ pathname }: { pathname: string }) {
    const params = useParams();
    const { isMobile, setOpenMobile } = useSidebar();

    const orgId = params.orgId as string;

    // Close mobile sidebar when navigation item is clicked
    const handleNavigationClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const href = `/org/${orgId}/${item.path}`;
                    const isActive =
                        pathname === href || pathname.startsWith(href + "/");

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={isActive}
                                asChild
                            >
                                <Link
                                    href={href}
                                    prefetch={true}
                                    onClick={handleNavigationClick}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
