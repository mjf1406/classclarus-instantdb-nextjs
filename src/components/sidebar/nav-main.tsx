/** @format */

"use client";

import { ChevronRight, type LucideIcon, LayoutDashboard, Coins, Clock } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    // SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";

const items = [
    {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
        isActive: true,
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
                    const hasSubItems = item.items && item.items.length > 0;

                    // If item has no sub-items, render as direct link
                    if (!hasSubItems) {
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
                    }

                    // If item has sub-items, render as collapsible
                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        onClick={() => {
                                            // If it has sub-items, set the first one as active
                                            const firstSubItem = item.items![0];
                                            setActiveTab(
                                                normalizeTab(firstSubItem.title)
                                            );
                                            handleNavigationClick();
                                        }}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => {
                                            const subItemTab = normalizeTab(
                                                subItem.title
                                            );
                                            const isSubActive =
                                                activeTab === subItemTab;

                                            return (
                                                <SidebarMenuSubItem
                                                    key={subItem.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isSubActive}
                                                        onClick={() => {
                                                            if (subItemTab) {
                                                                setActiveTab(
                                                                    subItemTab
                                                                );
                                                            }
                                                            handleNavigationClick();
                                                        }}
                                                    >
                                                        <a
                                                            href="#"
                                                            onClick={(e) =>
                                                                e.preventDefault()
                                                            }
                                                        >
                                                            <span>
                                                                {subItem.title}
                                                            </span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
