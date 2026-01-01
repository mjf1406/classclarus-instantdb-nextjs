/** @format */

"use client";

import { useState, useMemo } from "react";
import {
    Building2,
    ChevronDown,
    HelpCircle,
    Plus,
    Search,
    X,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
import Link from "next/link";

export default function OrgList() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user, isLoading: isUserLoading } = db.useAuth();

    const query = user
        ? {
              organizations: {
                  $: {
                      where: {
                          or: [
                              { "owner.id": user.id },
                              { "admins.id": user.id },
                              { "orgStudents.id": user.id },
                              { "orgTeachers.id": user.id },
                              { "orgParents.id": user.id },
                          ],
                      },
                  },
                  owner: {},
                  orgStudents: {},
                  orgTeachers: {},
                  orgParents: {},
                  admins: {},
                  joinCodeEntity: {},
                  classes: {
                      owner: {},
                      classAdmins: {},
                      classTeachers: {},
                  },
              },
          }
        : {};

    const { data, isLoading, error } = db.useQuery(query);

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

    const [isWhatIsOrgOpen, setIsWhatIsOrgOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
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
                                    `${count} organization${
                                        count !== 1 ? "s" : ""
                                    }`
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
                </div>
                <div className="space-x-4">
                    <CreateOrganizationDialog />
                    <Button
                        asChild
                        variant={"outline"}
                    >
                        <Link href="/join">Join Org</Link>
                    </Button>
                </div>
            </div>
            {/* What is an Organization? collapsible */}
            <Collapsible
                open={isWhatIsOrgOpen}
                onOpenChange={setIsWhatIsOrgOpen}
            >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <ChevronDown
                        className={`size-4 transition-transform duration-200 ${
                            isWhatIsOrgOpen ? "rotate-180" : ""
                        }`}
                    />
                    <HelpCircle />
                    <span className="group-hover:underline underline-offset-2">
                        What is an Organization?
                    </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 pb-1">
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground max-w-2xl space-y-3">
                        <p>
                            An organization is a flexible container for grouping
                            your classes. It could represent:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-1">
                            <li>
                                A <strong>school district</strong> containing
                                multiple schools and their classes, in which
                                case your district admin would invite you to
                                their organization.
                            </li>
                            <li>
                                A <strong>single school</strong> with all its
                                classes, in which case your school admin would
                                invite you to their organization.
                            </li>
                            <li>
                                A <strong>personal workspace</strong> (e.g.,
                                &ldquo;My Classes&rdquo;) if your institution
                                isn&apos;t on ClassClarus yet.
                            </li>
                        </ul>
                        <p>
                            If your school or district isn&apos;t already on
                            ClassClarus, we recommend creating an organization
                            with any name and adding all your classes there.
                            Another option is to create a separate organization
                            for each school year to keep things tidy.
                        </p>
                    </div>
                </CollapsibleContent>
            </Collapsible>
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
