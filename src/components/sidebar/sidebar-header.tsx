/** @format */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { db } from "@/lib/db/db";
import { CreateClassDialog } from "@/components/class/create-class-dialog";

export function OrganizationSwitcher() {
    const { isMobile } = useSidebar();
    const params = useParams();
    const router = useRouter();
    const organizationId = params.organizationId as string | undefined;
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedOrgForCreate, setSelectedOrgForCreate] = useState<{
        id: string;
    } | null>(null);

    // Query all organizations and their classes from InstantDB
    const { data } = db.useQuery({
        organizations: {
            classes: {},
        },
    });

    const organizations = data?.organizations || [];
    const selectedOrganization = organizationId
        ? organizations.find((org) => org.id === organizationId)
        : organizations[0] || null;

    // Use selectedOrganization or fallback to first organization
    const displayOrganization = selectedOrganization || organizations[0];

    if (!displayOrganization || organizations.length === 0) {
        return null;
    }

    // Get classes for the selected organization
    const organizationClasses = displayOrganization.classes || [];

    const handleOrganizationClassSelect = (orgId: string, classId: string) => {
        router.push(`/${orgId}/${classId}?tab=dashboard`);
    };

    const handleOpenCreateDialog = (org: { id: string }) => {
        setSelectedOrgForCreate(org);
        setIsCreateDialogOpen(true);
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Building2 className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {displayOrganization.name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {organizationClasses.length} class
                                    {organizationClasses.length !== 1
                                        ? "es"
                                        : ""}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Organizations
                        </DropdownMenuLabel>
                        {organizations.map((org, index) => {
                            const orgClasses = org.classes || [];
                            return (
                                <DropdownMenuSub key={org.id}>
                                    <DropdownMenuSubTrigger className="gap-2 p-2">
                                        <div className="flex size-6 items-center justify-center rounded-md border">
                                            <Building2 className="size-3.5 shrink-0" />
                                        </div>
                                        {org.name}
                                        <DropdownMenuShortcut>
                                            ⌘{index + 1}
                                        </DropdownMenuShortcut>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="min-w-48">
                                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                                            Classes
                                        </DropdownMenuLabel>
                                        {orgClasses.length > 0 ? (
                                            orgClasses.map((classItem) => (
                                                <DropdownMenuItem
                                                    key={classItem.id}
                                                    onClick={() => {
                                                        handleOrganizationClassSelect(
                                                            org.id,
                                                            classItem.id
                                                        );
                                                    }}
                                                    className="gap-2 p-2"
                                                >
                                                    <span>
                                                        {classItem.name}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))
                                        ) : (
                                            <DropdownMenuItem
                                                disabled
                                                className="text-muted-foreground"
                                            >
                                                No classes
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="gap-2 p-2"
                                            onClick={() =>
                                                handleOpenCreateDialog(org)
                                            }
                                        >
                                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                                <Plus className="size-4" />
                                            </div>
                                            <div className="text-muted-foreground font-medium">
                                                Add class
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">
                                Add organization
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <db.SignedIn>
                <CreateClassDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    myOrg={selectedOrgForCreate}
                />
            </db.SignedIn>
        </SidebarMenu>
    );
}
