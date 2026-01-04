/** @format */

"use client";

import { Users, Calendar, Dice6 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useClassRole } from "@/hooks/use-class-role";

const items = [
    {
        title: "Assigners",
        path: "assigners",
        icon: Users,
    },
    {
        title: "Random Event",
        path: "random-event",
        icon: Calendar,
        requiresTeacherOrAbove: true,
    },
    {
        title: "Randomizer",
        path: "randomizer",
        icon: Dice6,
        requiresTeacherOrAbove: true,
    },
];

export function NavRandom({ pathname }: { pathname: string }) {
    const params = useParams();
    const { isMobile, setOpenMobile } = useSidebar();
    const { isTeacherOrAbove } = useClassRole();

    const orgId = params.orgId as string;
    const classId = params.classId as string | undefined;

    // Don't render navigation if we're not in a class context
    if (!classId) {
        return null;
    }

    // Filter items based on role
    const visibleItems = items.filter((item) => {
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

    // Close mobile sidebar when navigation item is clicked
    const handleNavigationClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Random</SidebarGroupLabel>
            <SidebarMenu>
                {visibleItems.map((item) => {
                    const href = `/class/${orgId}/${classId}/${item.path}`;
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

