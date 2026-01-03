/** @format */

import { Skeleton } from "@/components/ui/skeleton";
import { CollapsibleStatsCardsSkeleton } from "@/components/stats/collapsible-stats-cards";

export default function Loading() {
    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* Hero skeleton */}
                <section className="mb-8">
                    <div className="rounded-2xl border bg-card p-6 md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start">
                            <Skeleton className="size-24 rounded-2xl md:size-32" />
                            <div className="flex-1 space-y-4">
                                <div>
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="mt-2 h-5 w-96 max-w-full" />
                                </div>
                                <Skeleton className="h-10 w-48 rounded-lg" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats skeleton */}
                <CollapsibleStatsCardsSkeleton />
            </main>
        </div>
    );
}
