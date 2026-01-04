/** @format */

"use client";

import { use } from "react";
import { useTargetUserId } from "@/hooks/use-target-user-id";

interface TasksPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function TasksPage({ params }: TasksPageProps) {
    const { orgId, classId } = use(params);
    const { targetUserId } = useTargetUserId();

    // When implementing data queries, filter by targetUserId:
    // - Students: filter to their own data (targetUserId = their user ID)
    // - Parents: filter to selected child's data (targetUserId = child's user ID)
    // - Teachers/Admins: show all data (targetUserId = null, no filter)
    //
    // Example query:
    // const { data } = db.useQuery({
    //     tasks: {
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
                <h1 className="text-2xl font-bold">Tasks</h1>
                <p className="mt-2 text-muted-foreground">
                    Tasks page for class {classId}
                </p>
            </main>
        </div>
    );
}

