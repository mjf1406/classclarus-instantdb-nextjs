/** @format */

"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <>
            {/* Navbar skeleton */}
            <nav className="sticky top-0 w-full mx-auto flex items-center p-4 bg-background/80 backdrop-blur-md z-10">
                <div className="flex-1" />
                <div className="flex-none">
                    <Skeleton className="h-8 w-32" />
                </div>
                <div className="flex-1 flex justify-end items-center space-x-2">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                </div>
            </nav>

            {/* Main content skeleton */}
            <div className="min-h-screen flex justify-center p-4">
                <div className="w-full max-w-6xl space-y-6">
                    {/* Content skeleton - works for both signed in and signed out states */}
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full max-w-md mx-auto" />
                        <Skeleton className="h-32 w-full max-w-md mx-auto rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full max-w-md mx-auto" />
                            <Skeleton className="h-4 w-3/4 max-w-md mx-auto" />
                        </div>
                        <Skeleton className="h-12 w-full max-w-md mx-auto rounded-lg" />
                    </div>
                </div>
            </div>
        </>
    );
}

