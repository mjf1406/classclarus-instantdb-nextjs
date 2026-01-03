/** @format */

"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronsUpDown, Plus, Building2, ChevronRight } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db/db";
import CreateClassDialog from "../classes/create-class-dialog";
import CreateOrganizationDialog from "../organizations/create-org-dialog";
import { useAuthContext } from "../auth/auth-provider";

type User =
    | {
          created_at: Date | null | string;
          email: string;
          id: string;
          imageURL: string | null;
          avatarURL: string | null;
          isGuest: boolean;
          polarCustomerId: string | null;
          refresh_token: string | null;
          updated_at: Date | null | string;
          type: string;
          firstName: string | null;
          lastName: string | null;
          plan: string;
      }
    | null
    | undefined;

export function OrganizationSwitcher({
    user,
    isLoading: isLoadingProp,
    pathname,
}: {
    user?: User;
    isLoading?: boolean;
    pathname: string;
}) {
    const { isMobile } = useSidebar();
    const params = useParams();
    const router = useRouter();
    const organizationId = params.organizationId as string | undefined;
    const classId = params.classId as string | undefined;
    const { organizations, isLoading: orgLoading } = useAuthContext();
    const isLoading = isLoadingProp ?? orgLoading;
    const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] =
        useState(false);
    const [selectedOrgForCreate, setSelectedOrgForCreate] = useState<{
        id: string;
    } | null>(null);
    const createOrgTriggerRef = useRef<HTMLButtonElement>(null);
    const createClassTriggerRef = useRef<HTMLButtonElement>(null);

    const selectedOrganization = organizationId
        ? organizations.find((org) => org.id === organizationId)
        : organizations[0] || null;

    const displayOrganization = selectedOrganization || organizations[0];

    if (!displayOrganization || organizations.length === 0) {
        return null;
    }

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="pointer-events-none"
                    >
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="grid flex-1 text-left text-sm leading-tight gap-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="ml-auto size-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // Get classes for the selected organization
    const organizationClasses = displayOrganization.classes || [];
    const currentClass = classId
        ? organizationClasses.find((c: { id: string }) => c.id === classId)
        : undefined;

    const handleOrganizationClassSelect = (orgId: string, classId: string) => {
        router.push(`/class/${orgId}/${classId}/dashboard`);
    };

    const handleOpenCreateClassDialog = (org: { id: string }) => {
        setSelectedOrgForCreate(org);
        setIsCreateClassDialogOpen(true);
    };

    const handleCreateClassDialogOpenChange = (open: boolean) => {
        setIsCreateClassDialogOpen(open);
        if (!open) {
            // Reset when dialog closes
            setSelectedOrgForCreate(null);
        }
    };

    const handleOpenCreateOrgDialog = () => {
        // Trigger the hidden button to open the dialog (uncontrolled)
        setTimeout(() => {
            createOrgTriggerRef.current?.click();
        }, 0);
    };

    return (
        <>
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
                                    <span className="truncate font-medium flex items-center gap-1.5">
                                        {displayOrganization.name}
                                        {currentClass && (
                                            <>
                                                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                                                {currentClass.name}
                                            </>
                                        )}
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
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
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
                                                    handleOpenCreateClassDialog(
                                                        org
                                                    )
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
                            <DropdownMenuItem
                                className="gap-2 p-2"
                                onClick={handleOpenCreateOrgDialog}
                            >
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
            </SidebarMenu>
            <db.SignedIn>
                {selectedOrgForCreate && (
                    <CreateClassDialog
                        open={isCreateClassDialogOpen}
                        onOpenChange={handleCreateClassDialogOpenChange}
                        organizationId={selectedOrgForCreate.id}
                        trigger={
                            <button
                                ref={createClassTriggerRef}
                                style={{ display: "none" }}
                                aria-hidden="true"
                                tabIndex={-1}
                            />
                        }
                    />
                )}
                <CreateOrganizationDialog
                    trigger={
                        <button
                            ref={createOrgTriggerRef}
                            style={{ display: "none" }}
                            aria-hidden="true"
                            tabIndex={-1}
                        />
                    }
                />
            </db.SignedIn>
        </>
    );
}
