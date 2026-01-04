/** @format */

"use client";

import { use } from "react";
import ClassList from "@/components/classes/class-list";

interface OrgClassesPageProps {
    params: Promise<{ orgId: string }>;
}

export default function OrgClassesPage({ params }: OrgClassesPageProps) {
    const { orgId } = use(params);

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <ClassList organizationId={orgId} />
            </main>
        </div>
    );
}

