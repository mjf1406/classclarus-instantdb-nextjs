/** @format */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import {
    Archive,
    ChevronDown,
    GraduationCap,
    Plus,
    Search,
    X,
} from "lucide-react";

import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import ClassCard, { ClassCardSkeleton } from "@/components/classes/class-card";
import CreateClassDialog from "@/components/classes/create-class-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ClassListProps {
    organizationId: string;
}

export default function ClassList({ organizationId }: ClassListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isArchivedOpen, setIsArchivedOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState<
        "all" | "teacher" | "parent" | "student"
    >("all");
    const [memberFilter, setMemberFilter] = useState<string | null>(null);
    // Use 25ms delay when clearing (empty search), 100ms when typing
    const debouncedSearchQuery = useDebouncedValue(
        searchQuery,
        searchQuery.trim() ? 100 : 25
    );
    const { user, isLoading: isUserLoading } = useAuthContext();

    // Query classes for this organization with owner relation
    const { data, isLoading, error } = db.useQuery({
        classes: {
            $: { where: { organization: organizationId } },
            owner: {},
            classAdmins: {},
            classTeachers: {},
            classStudents: {},
            classParents: {},
            joinCodeEntity: {},
            organization: {
                owner: {},
            },
        },
    });

    // Also get the organization to check permissions and members for filtering
    const { data: orgData, isLoading: isOrgLoading } = db.useQuery({
        organizations: {
            $: { where: { id: organizationId } },
            owner: {},
            admins: {},
            orgTeachers: {},
            orgParents: {},
            orgStudents: {},
        },
    });

    const organization = orgData?.organizations?.[0];
    const classes = data?.classes ?? [];

    // Check if current user can edit classes in this org
    const canEditInOrg = useMemo(() => {
        if (!user?.id || !organization) return false;
        const isOrgOwner = organization.owner?.id === user.id;
        // Use linked admins if available, fall back to JSON array during migration
        const linkedAdmins = organization.admins ?? [];
        const orgAdmins = Array.isArray(linkedAdmins)
            ? linkedAdmins.map((admin: any) => admin.id ?? admin)
            : Array.isArray(organization.admins)
            ? organization.admins
            : [];
        const isOrgAdmin = orgAdmins.includes(user.id);
        return isOrgOwner || isOrgAdmin;
    }, [user?.id, organization]);

    // Check if user can edit a specific class
    const canEditClass = (classData: (typeof classes)[0]) => {
        if (!user?.id) return false;
        if (canEditInOrg) return true; // Org owner/admin can edit all classes
        const isClassOwner = classData.owner?.id === user.id;
        // Use linked classAdmins if available, fall back to JSON array during migration
        const linkedClassAdmins = classData.classAdmins ?? [];
        const classAdmins = Array.isArray(linkedClassAdmins)
            ? linkedClassAdmins.map((admin: any) => admin.id ?? admin)
            : Array.isArray(classData.classAdmins)
            ? classData.classAdmins
            : [];
        return isClassOwner || classAdmins.includes(user.id);
    };

    // Check if user can archive a specific class (must be class owner/admin AND org owner/admin)
    const canArchiveClass = (classData: (typeof classes)[0]) => {
        if (!user?.id) return false;
        if (!canEditInOrg) return false; // Must be org owner/admin
        // Also must be class owner or class admin
        const isClassOwner = classData.owner?.id === user.id;
        const linkedClassAdmins = classData.classAdmins ?? [];
        const classAdmins = Array.isArray(linkedClassAdmins)
            ? linkedClassAdmins.map((admin: any) => admin.id ?? admin)
            : Array.isArray(classData.classAdmins)
            ? classData.classAdmins
            : [];
        return isClassOwner || classAdmins.includes(user.id);
    };

    // Split classes into active and archived
    const { activeClasses, archivedClasses } = useMemo(() => {
        const active: typeof classes = [];
        const archived: typeof classes = [];

        classes.forEach((cls) => {
            if (cls.archivedAt == null) {
                active.push(cls);
            } else {
                archived.push(cls);
            }
        });

        return { activeClasses: active, archivedClasses: archived };
    }, [classes]);

    // Helper function to check if a class matches the role/member filter
    const matchesRoleFilter = useCallback(
        (cls: (typeof classes)[0]): boolean => {
            if (roleFilter === "all") return true;

            if (memberFilter) {
                // Filter by specific member
                switch (roleFilter) {
                    case "teacher": {
                        const classTeachers = cls.classTeachers ?? [];
                        return classTeachers.some((teacher: any) => {
                            const teacherId =
                                typeof teacher === "string"
                                    ? teacher
                                    : teacher?.id;
                            return teacherId === memberFilter;
                        });
                    }
                    case "parent": {
                        const classParents = cls.classParents ?? [];
                        return classParents.some((parent: any) => {
                            const parentId =
                                typeof parent === "string"
                                    ? parent
                                    : parent?.id;
                            return parentId === memberFilter;
                        });
                    }
                    case "student": {
                        const classStudents = cls.classStudents ?? [];
                        return classStudents.some((student: any) => {
                            const studentId =
                                typeof student === "string"
                                    ? student
                                    : student?.id;
                            return studentId === memberFilter;
                        });
                    }
                }
            } else {
                // Filter by role (any member of that role)
                switch (roleFilter) {
                    case "teacher":
                        return (cls.classTeachers ?? []).length > 0;
                    case "parent":
                        return (cls.classParents ?? []).length > 0;
                    case "student":
                        return (cls.classStudents ?? []).length > 0;
                }
            }
            return true;
        },
        [roleFilter, memberFilter]
    );

    // Filter classes by search query and role/member filter
    // Use debounced value for smooth filtering (25ms when clearing, 100ms when typing)
    const filteredActiveClasses = useMemo(() => {
        let filtered = activeClasses;

        // Apply role/member filter
        if (roleFilter !== "all") {
            filtered = filtered.filter(matchesRoleFilter);
        }

        // Apply search query filter
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase().trim();
            filtered = filtered.filter((cls) =>
                cls.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [activeClasses, debouncedSearchQuery, matchesRoleFilter, roleFilter]);

    const filteredArchivedClasses = useMemo(() => {
        let filtered = archivedClasses;

        // Apply role/member filter
        if (roleFilter !== "all") {
            filtered = filtered.filter(matchesRoleFilter);
        }

        // Apply search query filter
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase().trim();
            filtered = filtered.filter((cls) =>
                cls.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [archivedClasses, debouncedSearchQuery, matchesRoleFilter, roleFilter]);

    // Loading state
    if (isLoading || isUserLoading || isOrgLoading) {
        return (
            <div className="space-y-6">
                <ClassListHeader
                    organizationId={organizationId}
                    count={0}
                    isLoading
                    canCreate={false}
                    organization={organization}
                    roleFilter={roleFilter}
                    memberFilter={memberFilter}
                    onRoleFilterChange={setRoleFilter}
                    onMemberFilterChange={setMemberFilter}
                />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <ClassCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
                <p className="text-destructive font-medium">
                    Failed to load classes
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {error.message}
                </p>
            </div>
        );
    }

    // Empty state (no classes at all)
    if (classes.length === 0) {
        return (
            <div className="space-y-6">
                <ClassListHeader
                    organizationId={organizationId}
                    count={0}
                    canCreate={canEditInOrg}
                    organization={organization}
                    roleFilter={roleFilter}
                    memberFilter={memberFilter}
                    onRoleFilterChange={setRoleFilter}
                    onMemberFilterChange={setMemberFilter}
                />
                <Empty className="min-h-80 border bg-card w-full max-w-md mx-auto rounded-xl">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <GraduationCap className="size-12" />
                        </EmptyMedia>
                        <EmptyTitle>No classes yet</EmptyTitle>
                        <EmptyDescription>
                            {canEditInOrg
                                ? "Create your first class to start managing students and content."
                                : "This organization doesn't have any classes yet."}
                        </EmptyDescription>
                    </EmptyHeader>
                    {canEditInOrg && (
                        <EmptyContent>
                            <CreateClassDialog
                                organizationId={organizationId}
                                trigger={
                                    <Button>
                                        <Plus className="size-4" />
                                        Create my first class
                                    </Button>
                                }
                            />
                        </EmptyContent>
                    )}
                </Empty>
            </div>
        );
    }

    // List view
    const hasActiveClasses = activeClasses.length > 0;
    const hasArchivedClasses = archivedClasses.length > 0;
    const hasSearchResults =
        filteredActiveClasses.length > 0 || filteredArchivedClasses.length > 0;

    return (
        <div className="space-y-6">
            <ClassListHeader
                organizationId={organizationId}
                count={activeClasses.length}
                filteredCount={filteredActiveClasses.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                canCreate={canEditInOrg}
                organization={organization}
                roleFilter={roleFilter}
                memberFilter={memberFilter}
                onRoleFilterChange={setRoleFilter}
                onMemberFilterChange={setMemberFilter}
            />

            {/* No search results */}
            {!hasSearchResults && searchQuery.trim() && (
                <Empty className="min-h-60 border bg-card rounded-xl">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Search className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>No classes found</EmptyTitle>
                        <EmptyDescription>
                            No classes match &ldquo;{searchQuery}&rdquo;. Try a
                            different search term.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            variant="outline"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="size-4" />
                            Clear search
                        </Button>
                    </EmptyContent>
                </Empty>
            )}

            {/* Active classes grid */}
            {hasActiveClasses && filteredActiveClasses.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredActiveClasses.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            classData={cls}
                            canEdit={canEditClass(cls)}
                            canArchive={canArchiveClass(cls)}
                        />
                    ))}
                </div>
            )}

            {/* Empty state for active classes only */}
            {hasActiveClasses &&
                filteredActiveClasses.length === 0 &&
                searchQuery.trim() && (
                    <Empty className="min-h-60 border bg-card rounded-xl">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Search className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No active classes found</EmptyTitle>
                            <EmptyDescription>
                                No active classes match &ldquo;{searchQuery}
                                &rdquo;.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

            {/* Archived classes section */}
            {hasArchivedClasses && (
                <Collapsible
                    open={isArchivedOpen}
                    onOpenChange={setIsArchivedOpen}
                    className="space-y-4"
                >
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                        <ChevronDown
                            className={`size-4 transition-transform duration-200 ${
                                isArchivedOpen ? "rotate-180" : ""
                            }`}
                        />
                        <Archive className="size-4" />
                        <span>Archived Classes</span>
                        <span className="ml-auto px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
                            {filteredArchivedClasses.length}
                        </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                        {filteredArchivedClasses.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredArchivedClasses.map((cls) => (
                                    <ClassCard
                                        key={cls.id}
                                        classData={cls}
                                        canEdit={canEditClass(cls)}
                                        canArchive={canArchiveClass(cls)}
                                    />
                                ))}
                            </div>
                        ) : searchQuery.trim() ? (
                            <Empty className="min-h-40 border bg-card rounded-xl">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Search className="size-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        No archived classes found
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        No archived classes match &ldquo;
                                        {searchQuery}&rdquo;.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : null}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
}

// Header component with count, search, and create button
function ClassListHeader({
    organizationId,
    count,
    filteredCount,
    searchQuery,
    onSearchChange,
    isLoading,
    canCreate,
    organization,
    roleFilter,
    memberFilter,
    onRoleFilterChange,
    onMemberFilterChange,
}: {
    organizationId: string;
    count: number;
    filteredCount?: number;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    canCreate: boolean;
    organization?: {
        orgTeachers?: Array<{
            id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
        }>;
        orgParents?: Array<{
            id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
        }>;
        orgStudents?: Array<{
            id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
        }>;
    };
    roleFilter?: "all" | "teacher" | "parent" | "student";
    memberFilter?: string | null;
    onRoleFilterChange?: (
        value: "all" | "teacher" | "parent" | "student"
    ) => void;
    onMemberFilterChange?: (value: string | null) => void;
}) {
    const showSearch = count > 0 || (searchQuery && searchQuery.length > 0);
    const isFiltered = searchQuery && searchQuery.trim().length > 0;

    // Get members for the selected role
    const getMembersForRole = (role: "teacher" | "parent" | "student") => {
        if (!organization) return [];
        switch (role) {
            case "teacher":
                return (organization.orgTeachers ?? []) as Array<{
                    id: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                }>;
            case "parent":
                return (organization.orgParents ?? []) as Array<{
                    id: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                }>;
            case "student":
                return (organization.orgStudents ?? []) as Array<{
                    id: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                }>;
        }
    };

    const membersForRole =
        roleFilter && roleFilter !== "all" ? getMembersForRole(roleFilter) : [];

    const getMemberDisplayName = (member: {
        firstName?: string;
        lastName?: string;
        email?: string;
    }) => {
        if (member.firstName && member.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }
        if (member.firstName) return member.firstName;
        if (member.email) return member.email;
        return "Unknown";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Classes
                    </h2>
                    <p className="text-muted-foreground">
                        {isLoading ? (
                            <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted" />
                        ) : count === 0 ? (
                            "Get started by creating a class"
                        ) : isFiltered ? (
                            filteredCount === count ? (
                                `${count} class${count !== 1 ? "es" : ""}`
                            ) : (
                                `Showing ${filteredCount} of ${count} class${
                                    count !== 1 ? "es" : ""
                                }`
                            )
                        ) : count === 1 ? (
                            "1 class"
                        ) : (
                            `${count} classes`
                        )}
                    </p>
                </div>
                {canCreate && (
                    <CreateClassDialog organizationId={organizationId} />
                )}
            </div>

            {/* Search bar */}
            {showSearch && onSearchChange && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search classes..."
                        value={searchQuery ?? ""}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchQuery && searchQuery.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="size-4" />
                            <span className="sr-only">Clear search</span>
                        </button>
                    )}
                </div>
            )}

            {/* Filter bar - only show for admins */}
            {canCreate &&
                organization &&
                onRoleFilterChange &&
                onMemberFilterChange && (
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="size-4" />
                            <span>Filter by:</span>
                        </div>
                        <Select
                            value={roleFilter ?? "all"}
                            onValueChange={(value) => {
                                onRoleFilterChange(
                                    value as
                                        | "all"
                                        | "teacher"
                                        | "parent"
                                        | "student"
                                );
                                onMemberFilterChange(null); // Reset member filter when role changes
                            }}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        {roleFilter &&
                            roleFilter !== "all" &&
                            membersForRole.length > 0 && (
                                <Select
                                    value={memberFilter ?? ""}
                                    onValueChange={(value) =>
                                        onMemberFilterChange(value || null)
                                    }
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select member..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            All {roleFilter}s
                                        </SelectItem>
                                        {membersForRole.map((member) => (
                                            <SelectItem
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {getMemberDisplayName(member)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        {(roleFilter !== "all" || memberFilter) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    onRoleFilterChange("all");
                                    onMemberFilterChange(null);
                                }}
                                className="ml-auto"
                            >
                                <X className="size-4" />
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}
        </div>
    );
}
