/** @format */

"use server";

import dbAdmin from "@/lib/db/db-admin";

// Server actions are automatically secure - no need for secret validation

type JoinCodeType =
    | "organization"
    | "classStudent"
    | "classTeacher"
    | "classParent";

interface LookupResult {
    type: JoinCodeType;
    entityId: string;
    entityName: string;
    organizationId?: string;
    classId?: string;
}

interface JoinResult {
    success: boolean;
    redirectUrl?: string;
    error?: string;
    requiresStudentSelection?: boolean;
    classId?: string;
    students?: Array<{ id: string; email?: string }>;
}

/**
 * Looks up a join code and returns its type and associated entity
 * Server action - automatically secure
 */
export async function lookupJoinCode(
    code: string
): Promise<{ success: boolean; data?: LookupResult; error?: string }> {

    if (!code || code.length !== 8) {
        return { success: false, error: "Invalid join code format" };
    }

    try {
        // Check organizations
        const { data: orgData } = await dbAdmin.query({
            organizations: {
                $: { where: { joinCode: code } },
            },
        });

        if (orgData?.organizations?.[0]) {
            const org = orgData.organizations[0];
            return {
                success: true,
                data: {
                    type: "organization",
                    entityId: org.id,
                    entityName: org.name,
                },
            };
        }

        // Check classes for student/teacher/parent codes
        const { data: classData } = await dbAdmin.query({
            classes: {
                $: {
                    where: {
                        or: [
                            { joinCodeStudent: code },
                            { joinCodeTeacher: code },
                            { joinCodeParent: code },
                        ],
                    },
                },
                organization: {},
            },
        });

        if (classData?.classes?.[0]) {
            const classEntity = classData.classes[0];
            let type: JoinCodeType;
            if (classEntity.joinCodeStudent === code) {
                type = "classStudent";
            } else if (classEntity.joinCodeTeacher === code) {
                type = "classTeacher";
            } else {
                type = "classParent";
            }

            return {
                success: true,
                data: {
                    type,
                    entityId: classEntity.id,
                    entityName: classEntity.name,
                    organizationId: classEntity.organization?.id,
                    classId: classEntity.id,
                },
            };
        }

        return { success: false, error: "Join code not found" };
    } catch (err) {
        console.error("Error looking up join code:", err);
        return {
            success: false,
            error: "Failed to lookup join code",
        };
    }
}

/**
 * Joins an organization as a member
 * Server action - automatically secure
 */
export async function joinOrganization(
    userId: string,
    orgId: string
): Promise<JoinResult> {

    try {
        // Check if user is already a member
        const { data } = await dbAdmin.query({
            organizations: {
                $: { where: { id: orgId } },
                members: {},
            },
        });

        const org = data?.organizations?.[0];
        if (!org) {
            return { success: false, error: "Organization not found" };
        }

        const existingMembers = org.members ?? [];
        const memberIds = Array.isArray(existingMembers)
            ? existingMembers.map((m: any) => m.id ?? m)
            : [];

        if (memberIds.includes(userId)) {
            return {
                success: false,
                error: "You are already a member of this organization",
            };
        }

        // Link user as member
        await dbAdmin.transact(
            dbAdmin.tx.organizations[orgId].link({ members: userId })
        );

        return {
            success: true,
            redirectUrl: `/${orgId}`,
        };
    } catch (err) {
        console.error("Error joining organization:", err);
        return {
            success: false,
            error: "Failed to join organization",
        };
    }
}

/**
 * Joins a class as a student
 * Server action - automatically secure
 */
export async function joinClassAsStudent(
    userId: string,
    classId: string
): Promise<JoinResult> {

    try {
        // Check if user is already a student
        const { data } = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                classStudents: {},
                organization: {},
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        const existingStudents = classEntity.classStudents ?? [];
        const studentIds = Array.isArray(existingStudents)
            ? existingStudents.map((s: any) => s.id ?? s)
            : [];

        if (studentIds.includes(userId)) {
            return {
                success: false,
                error: "You are already a student in this class",
            };
        }

        // Link user as student
        await dbAdmin.transact(
            dbAdmin.tx.classes[classId].link({ classStudents: userId })
        );

        const orgId = classEntity.organization?.id;
        return {
            success: true,
            redirectUrl: `/${orgId}/${classId}`,
        };
    } catch (err) {
        console.error("Error joining class as student:", err);
        return {
            success: false,
            error: "Failed to join class",
        };
    }
}

/**
 * Joins a class as a teacher
 * Server action - automatically secure
 */
export async function joinClassAsTeacher(
    userId: string,
    classId: string
): Promise<JoinResult> {

    try {
        // Check if user is already a teacher
        const { data } = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                classTeachers: {},
                organization: {},
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        const existingTeachers = classEntity.classTeachers ?? [];
        const teacherIds = Array.isArray(existingTeachers)
            ? existingTeachers.map((t: any) => t.id ?? t)
            : [];

        if (teacherIds.includes(userId)) {
            return {
                success: false,
                error: "You are already a teacher in this class",
            };
        }

        // Link user as teacher
        await dbAdmin.transact(
            dbAdmin.tx.classes[classId].link({ classTeachers: userId })
        );

        const orgId = classEntity.organization?.id;
        return {
            success: true,
            redirectUrl: `/${orgId}/${classId}`,
        };
    } catch (err) {
        console.error("Error joining class as teacher:", err);
        return {
            success: false,
            error: "Failed to join class",
        };
    }
}

/**
 * Gets the list of students in a class for parent selection
 * Server action - automatically secure
 */
export async function getClassStudents(
    classId: string
): Promise<{
    success: boolean;
    students?: Array<{ id: string; email?: string }>;
    error?: string;
}> {

    try {
        const { data } = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                classStudents: {},
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        const students = classEntity.classStudents ?? [];
        const studentList = Array.isArray(students)
            ? students.map((s: any) => ({
                  id: s.id ?? s,
                  email: s.email,
              }))
            : [];

        return {
            success: true,
            students: studentList,
        };
    } catch (err) {
        console.error("Error getting class students:", err);
        return {
            success: false,
            error: "Failed to get class students",
        };
    }
}

/**
 * Joins a class as a parent and links to selected students
 * Server action - automatically secure
 */
export async function joinClassAsParent(
    userId: string,
    classId: string,
    studentIds: string[]
): Promise<JoinResult> {

    if (!studentIds || studentIds.length === 0) {
        return {
            success: false,
            error: "Please select at least one student",
        };
    }

    try {
        // Check if user is already a parent
        const { data } = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                classParents: {},
                organization: {},
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        const existingParents = classEntity.classParents ?? [];
        const parentIds = Array.isArray(existingParents)
            ? existingParents.map((p: any) => p.id ?? p)
            : [];

        // Link user as parent to class
        const transactions = [];
        if (!parentIds.includes(userId)) {
            transactions.push(
                dbAdmin.tx.classes[classId].link({ classParents: userId })
            );
        }

        // Link parent to each selected student
        for (const studentId of studentIds) {
            transactions.push(
                dbAdmin.tx.$users[userId].link({ children: studentId })
            );
        }

        await dbAdmin.transact(transactions);

        const orgId = classEntity.organization?.id;
        return {
            success: true,
            redirectUrl: `/${orgId}/${classId}`,
        };
    } catch (err) {
        console.error("Error joining class as parent:", err);
        return {
            success: false,
            error: "Failed to join class as parent",
        };
    }
}

