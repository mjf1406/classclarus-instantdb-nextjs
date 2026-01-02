/** @format */

"use client";

import { use } from "react";
import { useQueryState, parseAsString } from "nuqs";
import ClassHomePage from "./pages/home/classHomePage";
import ClassPointsPage from "./pages/points/classPointsPage";

interface ClassPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function ClassPage({ params }: ClassPageProps) {
    const [activeTab] = useQueryState("tab", parseAsString);

    // Normalize tab value for comparison (lowercase, no spaces)
    const normalizeTab = (tab: string | null) =>
        tab ? tab.toLowerCase().replace(/\s+/g, "-") : null;

    const normalizedTab = normalizeTab(activeTab);

    // Route based on tab parameter
    // Default to home if no tab or invalid tab
    if (normalizedTab === "points") {
        return <ClassPointsPage params={params} />;
    }

    // Default to home page
    return <ClassHomePage params={params} />;
}
