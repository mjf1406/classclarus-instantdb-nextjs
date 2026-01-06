/** @format */

"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
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
import { useAuthContext } from "@/components/auth/auth-provider";
import { JoinOrgClassButton } from "@/components/join-codes";

export function OrgHeader() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const organizationId = params.orgId as string;
    const { user, isLoading, organizations, error } = useAuthContext();

    if (isLoading) {
        return null;
    }

    const currentOrganization = organizations.find(
        (org) => org.id === organizationId
    );

    // Extract page name from pathname
    // Pathname format: /org/{orgId}/{page}
    const getPageName = () => {
        const pathSegments = pathname.split("/");
        const pageSegment = pathSegments[pathSegments.length - 1];

        // If we're on the base org route, return null (no page shown)
        if (pageSegment === organizationId) return null;

        // Convert "manage-members" -> "Manage Members", "join-org" -> "Join Org"
        return pageSegment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Handle organization selection - navigate to new organization
    const handleOrganizationChange = (newOrgId: string) => {
        router.push(`/org/${newOrgId}/home`);
    };

    const activePage = getPageName();

    return (
        <header className="flex sticky top-0 h-16 justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background z-50">
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
                        {activePage && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {getPageName()}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center px-4">
                <JoinOrgClassButton />
            </div>
        </header>
    );
}
