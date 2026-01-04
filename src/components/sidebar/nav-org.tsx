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
import { useOrgRole } from "@/hooks/use-org-role";

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
        requiresTeacherOrAbove: true,
    },
    {
        title: "Manage Members",
        path: "manage-members",
        icon: Users,
        requiresOwnerOrAdmin: true,
    },
    {
        title: "Join Code",
        path: "join-org",
        icon: UserPlus,
        requiresOwnerOrAdmin: true,
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
    const { isOwnerOrAdmin, isTeacherOrAbove } = useOrgRole();

    const orgId = params.orgId as string;

    // Close mobile sidebar when navigation item is clicked
    const handleNavigationClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    // Filter items based on role
    const visibleItems = items.filter((item) => {
        // Hide items that require owner/admin for non-admins
        if (item.requiresOwnerOrAdmin && !isOwnerOrAdmin) {
            return false;
        }
        // Hide items that require teacher or above for students/parents
        if (item.requiresTeacherOrAbove && !isTeacherOrAbove) {
            return false;
        }
        return true;
    });

    // Don't render if no items are visible
    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarMenu>
                {visibleItems.map((item) => {
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
