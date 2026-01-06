/** @format */

"use client";

import {
    LayoutDashboard,
    Coins,
    Clock,
    Home,
    Merge,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    SidebarGroup,
    // SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useClassRole } from "@/hooks/use-class-role";

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
        title: "Points",
        path: "points",
        icon: Coins,
    },
    {
        title: "Class Time",
        path: "class-time",
        icon: Clock,
        requiresTeacherOrAbove: true,
    },
    {
        title: "Join Codes",
        path: "join-codes",
        icon: Merge,
        requiresTeacherOrAbove: true,
    },
];

export function NavMain({ pathname }: { pathname: string }) {
    const params = useParams();
    const { isMobile, setOpenMobile } = useSidebar();
    const { isTeacherOrAbove } = useClassRole();

    const orgId = params.orgId as string;
    const classId = params.classId as string | undefined;

    // Close mobile sidebar when navigation item is clicked
    const handleNavigationClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    // Filter items based on context and role
    const visibleItems = items.filter((item) => {
        // Always show top-level items
        if (item.isTopLevel) {
            return true;
        }
        // Only show class-specific items when in a class context
        if (!classId) {
            return false;
        }
        // Hide items that require teacher or above for students/parents
        if (item.requiresTeacherOrAbove && !isTeacherOrAbove) {
            return false;
        }
        return true;
    });

    // Don't render navigation if there are no visible items
    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <SidebarGroup>
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu>
                {visibleItems.map((item) => {
                    const href = item.isTopLevel 
                        ? `/${item.path}` 
                        : `/class/${orgId}/${classId}/${item.path}`;
                    const isActive = pathname === href;

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
