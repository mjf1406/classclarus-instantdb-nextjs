/** @format */

"use client";

import { use } from "react";
import { LayoutDashboard } from "lucide-react";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgDashboardPageProps {
    params: Promise<{ orgId: string }>;
}

export default function OrgDashboardPage({
    params,
}: OrgDashboardPageProps) {
    const { orgId } = use(params);
    const { user, isLoading: isUserLoading } = useAuthContext();

    // Query the organization
    const { data, isLoading, error } = db.useQuery({
        organizations: {
            $: { where: { id: orgId } },
        },
    });

    const organization = data?.organizations?.[0];

    // Loading state
    if (isLoading || isUserLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
                <main className="mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-6">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="mt-2 h-5 w-96 max-w-full" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // Error or not found state
    if (error || !organization) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Organization Not Found</CardTitle>
                        <CardDescription>
                            {error?.message || "The organization you're looking for doesn't exist."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="size-8" />
                        Dashboard
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Analytics and insights for {organization.name}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                        <CardDescription>
                            Dashboard analytics and metrics will be available here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            This page will display organization-wide statistics, activity
                            metrics, and insights.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

