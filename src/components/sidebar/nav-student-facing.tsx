/** @format */

"use client";

import { LayoutDashboard } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";

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
        title: "Student Dashboards",
        url: "#",
        icon: LayoutDashboard,
    },
];

export function NavStudentFacing() {
    const [activeTab, setActiveTab] = useQueryState("tab", parseAsString);
    const { isMobile, setOpenMobile } = useSidebar();

    // Normalize tab value for comparison (lowercase, no spaces)
    const normalizeTab = (title: string) =>
        title.toLowerCase().replace(/\s+/g, "-");

    // Close mobile sidebar when navigation item is clicked
    const handleNavigationClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Student Facing</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const itemTab = normalizeTab(item.title);
                    const isActive = activeTab === itemTab;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={isActive}
                                onClick={() => {
                                    setActiveTab(itemTab);
                                    handleNavigationClick();
                                }}
                                asChild
                            >
                                <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

