/** @format */

"use client";

import { useState, useMemo } from "react";
import { Building2, Plus, Search, X } from "lucide-react";

import { db } from "@/lib/db/db";
import OrgCard, { OrgCardSkeleton } from "@/components/organizations/org-card";
import CreateOrganizationDialog from "@/components/organizations/create-org-dialog";
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

export default function OrgList() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user, isLoading: isUserLoading } = db.useAuth();

    // Query organizations with owner and classes relations
    // This fetches all organizations - in production you'd want to filter by membership
    const { data, isLoading, error } = db.useQuery({
        organizations: {
            owner: {},
            classes: {},
        },
    });

    const organizations = data?.organizations ?? [];

    // Filter organizations by search query
    const filteredOrganizations = useMemo(() => {
        if (!searchQuery.trim()) return organizations;
        const query = searchQuery.toLowerCase().trim();
        return organizations.filter((org) =>
            org.name.toLowerCase().includes(query)
        );
    }, [organizations, searchQuery]);

    // Loading state
    if (isLoading || isUserLoading) {
        return (
            <div className="space-y-6">
                <OrgListHeader
                    count={0}
                    isLoading
                />
                <div className="flex flex-col gap-5">
                    {[1, 2, 3].map((i) => (
                        <OrgCardSkeleton key={i} />
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
                    Failed to load organizations
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {error.message}
                </p>
            </div>
        );
    }

    // Empty state
    if (organizations.length === 0) {
        return (
            <div className="space-y-6">
                <OrgListHeader count={0} />
                <Empty className="min-h-100 border bg-card w-md mx-auto">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2 className="size-18" />
                        </EmptyMedia>
                        <EmptyTitle>No organizations yet</EmptyTitle>
                        <EmptyDescription>
                            Create your first organization to start managing
                            classes and members.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <CreateOrganizationDialog
                            trigger={
                                <Button>
                                    <Plus className="size-4" />
                                    Create my first organization
                                </Button>
                            }
                        />
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-6">
            <OrgListHeader
                count={organizations.length}
                filteredCount={filteredOrganizations.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* No search results */}
            {filteredOrganizations.length === 0 && searchQuery.trim() && (
                <Empty className="min-h-60 border bg-card">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Search className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>No organizations found</EmptyTitle>
                        <EmptyDescription>
                            No organizations match &ldquo;{searchQuery}&rdquo;.
                            Try a different search term.
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

            {/* Organization grid */}
            {filteredOrganizations.length > 0 && (
                <div className="flex flex-col gap-5">
                    {filteredOrganizations.map((org) => (
                        <OrgCard
                            key={org.id}
                            organization={org}
                            isOwner={user?.id === org.owner?.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Header component with count, search, and create button
function OrgListHeader({
    count,
    filteredCount,
    searchQuery,
    onSearchChange,
    isLoading,
}: {
    count: number;
    filteredCount?: number;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}) {
    const showSearch = count > 0 || (searchQuery && searchQuery.length > 0);
    const isFiltered = searchQuery && searchQuery.trim().length > 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Organizations
                    </h2>
                    <p className="text-muted-foreground">
                        {isLoading ? (
                            <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted" />
                        ) : count === 0 ? (
                            "Get started by creating an organization"
                        ) : isFiltered ? (
                            filteredCount === count ? (
                                `${count} organization${count !== 1 ? "s" : ""}`
                            ) : (
                                `Showing ${filteredCount} of ${count} organization${
                                    count !== 1 ? "s" : ""
                                }`
                            )
                        ) : count === 1 ? (
                            "1 organization"
                        ) : (
                            `${count} organizations`
                        )}
                    </p>
                </div>
                <CreateOrganizationDialog />
            </div>

            {/* Search bar */}
            {showSearch && onSearchChange && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search organizations..."
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
