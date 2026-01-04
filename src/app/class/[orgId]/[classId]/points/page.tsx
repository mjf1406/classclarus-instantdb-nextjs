/** @format */

"use client";

import { use } from "react";
import { useTargetUserId } from "@/hooks/use-target-user-id";
import { useClassRole } from "@/hooks/use-class-role";

interface ClassPointsPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function ClassPointsPage({ params }: ClassPointsPageProps) {
    const { orgId, classId } = use(params);
    const { targetUserId, isLoading: targetUserIdLoading } = useTargetUserId();
    const { role } = useClassRole();

    // When implementing data queries, filter by targetUserId:
    // - Students: filter to their own data (targetUserId = their user ID)
    // - Parents: filter to selected child's data (targetUserId = child's user ID)
    // - Teachers/Admins: show all data (targetUserId = null, no filter)
    //
    // Example query:
    // const { data } = db.useQuery({
    //     points: {
    //         $: {
    //             where: targetUserId
    //                 ? { studentId: targetUserId }
    //                 : { classId },
    //         },
    //     },
    // });

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="text-2xl font-bold">Points Page</h1>
                <p className="mt-2 text-muted-foreground">
                    Points page for class {classId}
                    {targetUserId && ` (viewing data for user: ${targetUserId})`}
                </p>
            </main>
        </div>
    );
}

