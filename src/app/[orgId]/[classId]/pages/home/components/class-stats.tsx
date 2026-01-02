/** @format */

"use client";

import { GraduationCap, ShieldCheck, Users } from "lucide-react";
import {
    CollapsibleStatsCards,
    type StatMember,
} from "@/components/stats/collapsible-stats-cards";
import { ClassQueryResult } from "./types";

interface ClassStatsProps {
    classData: ClassQueryResult;
}

export function ClassStats({ classData }: ClassStatsProps) {
    // Use linked relations if available
    const linkedStudents = (classData.classStudents ?? []) as StatMember[];
    const linkedTeachers = (classData.classTeachers ?? []) as StatMember[];
    const linkedParents = (classData.classParents ?? []) as StatMember[];
    const linkedAdmins = (classData.classAdmins ?? []) as StatMember[];

    const stats = [
        {
            key: "students",
            label: "Students",
            singularLabel: "student",
            members: linkedStudents,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            hoverBorder: "hover:border-blue-500/30",
        },
        {
            key: "teachers",
            label: "Teachers",
            singularLabel: "teacher",
            members: linkedTeachers,
            icon: GraduationCap,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            hoverBorder: "hover:border-emerald-500/30",
        },
        {
            key: "parents",
            label: "Parents",
            singularLabel: "parent",
            members: linkedParents,
            icon: Users,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            hoverBorder: "hover:border-amber-500/30",
        },
        {
            key: "admins",
            label: "Admins",
            singularLabel: "admin",
            members: linkedAdmins,
            icon: ShieldCheck,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
            hoverBorder: "hover:border-violet-500/30",
        },
    ];

    return <CollapsibleStatsCards stats={stats} />;
}

