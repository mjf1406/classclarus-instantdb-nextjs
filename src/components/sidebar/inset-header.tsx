/** @format */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";

export function ClassHeader() {
    const params = useParams();
    const router = useRouter();
    const organizationId = params.orgId as string;
    const classId = params.classId as string | undefined;
    const { user, isLoading, organizations, error } = useAuthContext();
    const [activeTab] = useQueryState("tab", parseAsString);

    if (isLoading) {
        return null;
    }

    const currentOrganization = organizations.find(
        (org) => org.id === organizationId
    );
    const organizationClasses = currentOrganization?.classes || [];
    const currentClass = classId
        ? organizationClasses.find((c: { id: string }) => c.id === classId)
        : undefined;

    // Convert tab slug back to readable name
    const getTabName = (tabSlug: string | null) => {
        if (!tabSlug) return "TAB NAME";
        // Convert "history" -> "History", "get-started" -> "Get Started"
        return tabSlug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Handle organization selection - navigate to new organization
    const handleOrganizationChange = (newOrgId: string) => {
        router.push(`/${newOrgId}`);
    };

    // Handle class selection - navigate to new class with dashboard tab
    const handleClassChange = (newClassId: string) => {
        router.push(`/${organizationId}/${newClassId}?tab=dashboard`);
    };

    // Only show class-related breadcrumb items when we're on a class route
    const showClassBreadcrumb = !!classId;

    return (
        <header className="flex sticky top-0 h-16 justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background z-10">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList className="flex items-center gap-2">
                        <BreadcrumbItem>
                            <Select
                                value={organizationId || ""}
                                onValueChange={handleOrganizationChange}
                                disabled={!user || organizations.length === 0}
                            >
                                <SelectTrigger className="h-auto border-none bg-transparent px-2 py-1 shadow-none hover:bg-accent focus:ring-0 focus:ring-offset-0 disabled:opacity-50 [&>svg]:opacity-50">
                                    <SelectValue>
                                        {currentOrganization?.name ||
                                            "ORG NAME"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map((org) => (
                                        <SelectItem
                                            key={org.id}
                                            value={org.id}
                                        >
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BreadcrumbItem>
                        {showClassBreadcrumb && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <Select
                                        value={classId || ""}
                                        onValueChange={handleClassChange}
                                        disabled={!currentOrganization}
                                    >
                                        <SelectTrigger className="h-auto border-none bg-transparent px-2 py-1 shadow-none hover:bg-accent focus:ring-0 focus:ring-offset-0 disabled:opacity-50 [&>svg]:opacity-50">
                                            <SelectValue>
                                                {currentClass?.name ||
                                                    "CLASS NAME"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {organizationClasses.map(
                                                (classItem: {
                                                    id: string;
                                                    name: string;
                                                }) => (
                                                    <SelectItem
                                                        key={classItem.id}
                                                        value={classItem.id}
                                                    >
                                                        {classItem.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </BreadcrumbItem>
                                {activeTab && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                {getTabName(activeTab)}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}
