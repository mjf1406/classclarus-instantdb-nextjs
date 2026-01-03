/** @format */

import { db } from "@/lib/db/db";

export type JoinCodeType = "student" | "teacher" | "parent";

// Type for class query result - extracted from the actual query
export type ClassQueryShape = {
    classes: {
        owner: {};
        classAdmins: {};
        classTeachers: {};
        classStudents: {};
        classParents: {};
        joinCodeEntity: {};
        organization: {
            owner: {};
            admins: {};
        };
    };
};

export type ClassQueryResult = NonNullable<
    ReturnType<typeof db.useQuery<ClassQueryShape>>["data"]
>["classes"][number];

export const codeLabels: Record<JoinCodeType, string> = {
    student: "Student",
    teacher: "Teacher",
    parent: "Parent",
};

export const codeColors: Record<JoinCodeType, string> = {
    student: "text-blue-500",
    teacher: "text-emerald-500",
    parent: "text-amber-500",
};

