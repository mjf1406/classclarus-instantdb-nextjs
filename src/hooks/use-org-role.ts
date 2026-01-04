/** @format */

"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";

export type OrgRole = "owner" | "admin" | "teacher" | "student" | "parent" | null;

export interface UseOrgRoleReturn {
    role: OrgRole;
    isLoading: boolean;
    isOwnerOrAdmin: boolean;
    isTeacherOrAbove: boolean;
    isStudentOrParent: boolean;
}

export function useOrgRole(): UseOrgRoleReturn {
    const { user } = useAuthContext();
    const params = useParams();
    const orgId = params.orgId as string | undefined;

    const { data, isLoading } = db.useQuery(
        user?.id && orgId
            ? {
                  organizations: {
                      $: { where: { id: orgId } },
                      owner: {},
                      admins: {},
                      orgTeachers: {},
                      orgStudents: {},
                      orgParents: {},
                  },
              }
            : null
    );

    const role = useMemo<OrgRole>(() => {
        if (!user?.id || !orgId || !data?.organizations?.[0]) {
            return null;
        }

        const orgData = data.organizations[0];

        // Check owner first (highest priority)
        if (orgData.owner?.id === user.id) {
            return "owner";
        }

        // Check admin
        const admins = orgData.admins ?? [];
        const adminIds = Array.isArray(admins)
            ? admins.map((admin: any) => admin.id ?? admin)
            : [];
        if (adminIds.includes(user.id)) {
            return "admin";
        }

        // Check teacher
        const teachers = orgData.orgTeachers ?? [];
        const teacherIds = Array.isArray(teachers)
            ? teachers.map((teacher: any) => teacher.id ?? teacher)
            : [];
        if (teacherIds.includes(user.id)) {
            return "teacher";
        }

        // Check parent
        const parents = orgData.orgParents ?? [];
        const parentIds = Array.isArray(parents)
            ? parents.map((parent: any) => parent.id ?? parent)
            : [];
        if (parentIds.includes(user.id)) {
            return "parent";
        }

        // Check student
        const students = orgData.orgStudents ?? [];
        const studentIds = Array.isArray(students)
            ? students.map((student: any) => student.id ?? student)
            : [];
        if (studentIds.includes(user.id)) {
            return "student";
        }

        return null;
    }, [user?.id, orgId, data]);

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

