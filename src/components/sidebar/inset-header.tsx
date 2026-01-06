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
import { useClassRole, ClassRole } from "@/hooks/use-class-role";
import { Crown, ShieldCheck, GraduationCap, Users } from "lucide-react";

export function ClassHeader() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const organizationId = params.orgId as string;
    const classId = params.classId as string | undefined;
    const { user, isLoading, organizations, error } = useAuthContext();
    
    // Get user's role in the class - must be called before any early returns
    const { role } = useClassRole();

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

    // Extract tab name from pathname
    // Pathname format: /{orgId}/{classId}/{tab}
    const getTabName = () => {
        if (!classId) return null;
        const pathSegments = pathname.split("/");
        const tabSegment = pathSegments[pathSegments.length - 1];

        // If we're on the base class route, return null (no tab shown)
        if (tabSegment === classId) return null;

        // Convert "class-time" -> "Class Time", "student-dashboards" -> "Student Dashboards"
        return tabSegment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Handle organization selection - navigate to new organization
    const handleOrganizationChange = (newOrgId: string) => {
        router.push(`/org/${newOrgId}`);
    };

    // Handle class selection - navigate to new class with home tab
    const handleClassChange = (newClassId: string) => {
        router.push(`/class/${organizationId}/${newClassId}/home`);
    };

    const activeTab = getTabName();

    // Only show class-related breadcrumb items when we're on a class route
    const showClassBreadcrumb = !!classId;

    // Helper functions for role display
    const getRoleIcon = (role: ClassRole) => {
        switch (role) {
            case "owner":
                return Crown;
            case "admin":
                return ShieldCheck;
            case "teacher":
                return GraduationCap;
            case "student":
                return Users;
            case "parent":
                return Users;
            default:
                return null;
        }
    };

    const getRoleColor = (role: ClassRole) => {
        switch (role) {
            case "owner":
                return "text-amber-500";
            case "admin":
                return "text-violet-500";
            case "teacher":
                return "text-emerald-500";
            case "student":
                return "text-blue-500";
            case "parent":
                return "text-amber-500";
            default:
                return "text-muted-foreground";
        }
    };

    const getRoleLabel = (role: ClassRole) => {
        switch (role) {
            case "owner":
                return "Owner";
            case "admin":
                return "Admin";
            case "teacher":
                return "Teacher";
            case "student":
                return "Student";
            case "parent":
                return "Parent";
            default:
                return "";
        }
    };

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
                                            <div className="flex items-center gap-2">
                                                <BreadcrumbPage>
                                                    {getTabName()}
                                                </BreadcrumbPage>
                                                {role && (
                                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <span>as</span>
                                                        {(() => {
                                                            const RoleIcon =
                                                                getRoleIcon(
                                                                    role
                                                                );
                                                            return RoleIcon ? (
                                                                <RoleIcon
                                                                    className={`size-4 ${getRoleColor(
                                                                        role
                                                                    )}`}
                                                                />
                                                            ) : null;
                                                        })()}
                                                        <span
                                                            className={getRoleColor(
                                                                role
                                                            )}
                                                        >
                                                            {getRoleLabel(role)}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </BreadcrumbItem>
                                    </>
                                )}
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
