/** @format */

"use client";

import { Building2, Plus } from "lucide-react";

import { db } from "@/lib/db/db";
import OrgCard, { OrgCardSkeleton } from "@/components/organizations/org-card";
import CreateOrganizationDialog from "@/components/organizations/create-org-dialog";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function OrgList() {
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

    // Loading state
    if (isLoading || isUserLoading) {
        return (
            <div className="space-y-6">
                <OrgListHeader
                    count={0}
                    isLoading
                />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <Empty className="min-h-100 border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2 className="size-6" />
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
            <OrgListHeader count={organizations.length} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                    <OrgCard
                        key={org.id}
                        organization={org}
                        isOwner={user?.id === org.owner?.id}
                    />
                ))}
            </div>
        </div>
    );
}

// Header component with count and create button
function OrgListHeader({
    count,
    isLoading,
}: {
    count: number;
    isLoading?: boolean;
}) {
    return (
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
                    ) : count === 1 ? (
                        "1 organization"
                    ) : (
                        `${count} organizations`
                    )}
                </p>
            </div>
            <CreateOrganizationDialog />
        </div>
    );
}
