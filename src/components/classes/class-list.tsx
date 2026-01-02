/** @format */

"use client";

import { useState, useMemo } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { GraduationCap, Plus, Search, X } from "lucide-react";

import { db } from "@/lib/db/db";
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

interface ClassListProps {
    organizationId: string;
}

export default function ClassList({ organizationId }: ClassListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    // Use 25ms delay when clearing (empty search), 100ms when typing
    const debouncedSearchQuery = useDebouncedValue(
        searchQuery,
        searchQuery.trim() ? 100 : 25
    );
    const { user, isLoading: isUserLoading } = db.useAuth();

    // Query classes for this organization with owner relation
    const { data, isLoading, error } = db.useQuery({
        classes: {
            $: { where: { organization: organizationId } },
            owner: {},
            classAdmins: {},
            classTeachers: {},
            classStudents: {},
            joinCodeEntity: {},
            organization: {
                owner: {},
            },
        },
    });

    // Also get the organization to check permissions
    const { data: orgData, isLoading: isOrgLoading } = db.useQuery({
        organizations: {
            $: { where: { id: organizationId } },
            owner: {},
            admins: {},
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

    // Filter classes by search query (name only)
    // Use debounced value for smooth filtering (25ms when clearing, 100ms when typing)
    const filteredClasses = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return classes;
        const query = debouncedSearchQuery.toLowerCase().trim();
        return classes.filter((cls) => cls.name.toLowerCase().includes(query));
    }, [classes, debouncedSearchQuery]);

    // Loading state
    if (isLoading || isUserLoading || isOrgLoading) {
        return (
            <div className="space-y-6">
                <ClassListHeader
                    organizationId={organizationId}
                    count={0}
                    isLoading
                    canCreate={false}
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

    // Empty state
    if (classes.length === 0) {
        return (
            <div className="space-y-6">
                <ClassListHeader
                    organizationId={organizationId}
                    count={0}
                    canCreate={canEditInOrg}
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
    return (
        <div className="space-y-6">
            <ClassListHeader
                organizationId={organizationId}
                count={classes.length}
                filteredCount={filteredClasses.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                canCreate={canEditInOrg}
            />

            {/* No search results */}
            {filteredClasses.length === 0 && searchQuery.trim() && (
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

            {/* Classes grid */}
            {filteredClasses.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredClasses.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            classData={cls}
                            canEdit={canEditClass(cls)}
                        />
                    ))}
                </div>
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
}: {
    organizationId: string;
    count: number;
    filteredCount?: number;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    canCreate: boolean;
}) {
    const showSearch = count > 0 || (searchQuery && searchQuery.length > 0);
    const isFiltered = searchQuery && searchQuery.trim().length > 0;

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
        </div>
    );
}
