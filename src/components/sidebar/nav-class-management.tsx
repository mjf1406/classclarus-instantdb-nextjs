/** @format */

"use client";

import { FileText, BookOpenCheck, CheckSquare, Target, Users } from "lucide-react";
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

const items = [
    {
        title: "Assignments",
        path: "assignments",
        icon: FileText,
    },
    {
        title: "Gradebook",
        path: "gradebook",
        icon: BookOpenCheck,
    },
    {
        title: "Tasks",
        path: "tasks",
        icon: CheckSquare,
    },
    {
        title: "Expectations",
        path: "expectations",
        icon: Target,
    },
    {
        title: "Manage Members",
        path: "manage-members",
        icon: Users,
    },
];

export function NavClassManagement({ pathname }: { pathname: string }) {
    const params = useParams();
    const { isMobile, setOpenMobile } = useSidebar();

    const orgId = params.orgId as string;
    const classId = params.classId as string | undefined;

    // Don't render navigation if we're not in a class context
    if (!classId) {
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
            <SidebarGroupLabel>Class Management</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
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

