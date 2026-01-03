/** @format */

"use client";

import { use } from "react";

interface StudentDashboardsPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function StudentDashboardsPage({
    params,
}: StudentDashboardsPageProps) {
    const { orgId, classId } = use(params);

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="text-2xl font-bold">Student Dashboards</h1>
                <p className="mt-2 text-muted-foreground">
                    Student Dashboards page for class {classId}
                </p>
            </main>
        </div>
    );
}

