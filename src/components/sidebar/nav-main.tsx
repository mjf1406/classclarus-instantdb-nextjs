/** @format */

"use client";

import {
    LayoutDashboard,
    Coins,
    Clock,
    Home,
} from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";

import {
    SidebarGroup,
    // SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
        isActive: true,
    },
    {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
    },
    {
        title: "Points",
        url: "#",
        icon: Coins,
    },
    {
        title: "Class Time",
        url: "#",
        icon: Clock,
    },
];

export function NavMain() {
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
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu>
                {items.map((item) => {
                    const itemTab = normalizeTab(item.title);
                    const isActive =
                        activeTab === itemTab || (!activeTab && item.isActive);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={isActive}
                                onClick={() => {
                                    setActiveTab(itemTab);
                                    handleNavigationClick();
                                }}
                            >
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
