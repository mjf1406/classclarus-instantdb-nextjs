/** @format */

"use client";

import { use } from "react";

interface AssignmentsPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function AssignmentsPage({ params }: AssignmentsPageProps) {
    const { orgId, classId } = use(params);

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="text-2xl font-bold">Assignments</h1>
                <p className="mt-2 text-muted-foreground">
                    Assignments page for class {classId}
                </p>
            </main>
        </div>
    );
}

