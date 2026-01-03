/** @format */

import { Skeleton } from "@/components/ui/skeleton";
import { CollapsibleStatsCardsSkeleton } from "@/components/stats/collapsible-stats-cards";

export default function Loading() {
    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            {/* Header skeleton */}
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="size-8 rounded-md" />
                </div>
            </header>

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

                {/* Classes section skeleton */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="mt-1 h-5 w-16" />
                        </div>
                        <Skeleton className="h-9 w-28 rounded-md" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-56 rounded-xl"
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
