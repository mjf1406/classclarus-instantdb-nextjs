/** @format */

"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";

export type ClassRole = "owner" | "admin" | "teacher" | "student" | "parent" | null;

export interface UseClassRoleReturn {
    role: ClassRole;
    isLoading: boolean;
    isOwnerOrAdmin: boolean;
    isTeacherOrAbove: boolean;
    isStudentOrParent: boolean;
}

export function useClassRole(): UseClassRoleReturn {
    const { user } = useAuthContext();
    const params = useParams();
    const classId = params.classId as string | undefined;

    const { data, isLoading } = db.useQuery(
        user?.id && classId
            ? {
                  classes: {
                      $: { where: { id: classId } },
                      owner: {},
                      classAdmins: {},
                      classTeachers: {},
                      classStudents: {},
                      classParents: {},
                  },
              }
            : null
    );

    const role = useMemo<ClassRole>(() => {
        if (!user?.id || !classId || !data?.classes?.[0]) {
            return null;
        }

        const classData = data.classes[0];

        // Check owner first (highest priority)
        if (classData.owner?.id === user.id) {
            return "owner";
        }

        // Check admin
        const admins = classData.classAdmins ?? [];
        const adminIds = Array.isArray(admins)
            ? admins.map((admin: any) => admin.id ?? admin)
            : [];
        if (adminIds.includes(user.id)) {
            return "admin";
        }

        // Check teacher
        const teachers = classData.classTeachers ?? [];
        const teacherIds = Array.isArray(teachers)
            ? teachers.map((teacher: any) => teacher.id ?? teacher)
            : [];
        if (teacherIds.includes(user.id)) {
            return "teacher";
        }

        // Check parent
        const parents = classData.classParents ?? [];
        const parentIds = Array.isArray(parents)
            ? parents.map((parent: any) => parent.id ?? parent)
            : [];
        if (parentIds.includes(user.id)) {
            return "parent";
        }

        // Check student
        const students = classData.classStudents ?? [];
        const studentIds = Array.isArray(students)
            ? students.map((student: any) => student.id ?? student)
            : [];
        if (studentIds.includes(user.id)) {
            return "student";
        }

        return null;
    }, [user?.id, classId, data]);

    const isOwnerOrAdmin = role === "owner" || role === "admin";
    const isTeacherOrAbove = isOwnerOrAdmin || role === "teacher";
    const isStudentOrParent = role === "student" || role === "parent";

    return {
        role,
        isLoading,
        isOwnerOrAdmin,
        isTeacherOrAbove,
        isStudentOrParent,
    };
}

