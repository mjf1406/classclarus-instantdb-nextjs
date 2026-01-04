/** @format */

"use server";

import { id } from "@instantdb/admin";
import dbAdmin from "@/lib/db/db-admin";

async function isGuestUser(userId: string): Promise<boolean> {
    try {
        const userData = await dbAdmin.query({
            $users: {
                $: { where: { id: userId } },
            },
        });

        const user = userData?.$users?.[0];
        if (!user) {
            return true;
        }

        return user.type === "guest" || !user.email;
    } catch (err) {
        console.error("Error checking if user is guest:", err);
        return true;
    }
}

interface TokenValidationResult {
    success: boolean;
    token?: any;
    error?: string;
}

async function validateJoinToken(
    token: string,
    userId: string,
    code: string,
    entityId: string,
    expectedType: JoinCodeType
): Promise<TokenValidationResult> {
    const tokenData = await dbAdmin.query({
        joinTokens: {
            $: { where: { token: token } },
        },
    });

    const joinToken = tokenData?.joinTokens?.[0];
    if (!joinToken) {
        return {
            success: false,
            error: "Join token not found",
        };
    }

    if (joinToken.used) {
        return {
            success: false,
            error: "Join token already used",
        };
    }

    const now = new Date();
    if (!joinToken.expiresAt) {
        return {
            success: false,
            error: "Join token has no expiration date",
        };
    }
    // Convert expiresAt to Date object - admin SDK may return string/number
    // Check type first to avoid TypeScript error with instanceof
    const expiresAtValue = joinToken.expiresAt as unknown;
    let expiresAtDate: Date;
    if (expiresAtValue instanceof Date) {
        expiresAtDate = expiresAtValue;
    } else if (
        typeof expiresAtValue === "string" ||
        typeof expiresAtValue === "number"
    ) {
        expiresAtDate = new Date(expiresAtValue);
    } else {
        return {
            success: false,
            error: "Invalid expiration date format",
        };
    }
    if (expiresAtDate <= now) {
        return {
            success: false,
            error: "Join token expired. Please enter the code again",
        };
    }

    if (joinToken.owner !== userId) {
        return {
            success: false,
            error: "Join token does not match",
        };
    }

    if (joinToken.code !== code) {
        return {
            success: false,
            error: "Join token does not match",
        };
    }

    if (joinToken.entityId !== entityId) {
        return {
            success: false,
            error: "Join token does not match",
        };
    }

    if (joinToken.type !== expectedType) {
        return {
            success: false,
            error: "Join token does not match",
        };
    }

    return {
        success: true,
        token: joinToken,
    };
}

interface CodeValidationResult {
    success: boolean;
    error?: string;
}

async function validateOrgJoinCode(
    code: string,
    orgId: string
): Promise<CodeValidationResult> {
    const orgCodeData = await dbAdmin.query({
        orgJoinCodes: {
            $: { where: { code: code } },
            organization: {},
        },
    });

    const orgCode = orgCodeData?.orgJoinCodes?.[0];
    if (!orgCode || orgCode.organization?.id !== orgId) {
        return {
            success: false,
            error: "Invalid join code for this organization",
        };
    }

    return { success: true };
}

async function validateClassJoinCode(
    code: string,
    classId: string,
    codeField: "studentCode" | "teacherCode" | "parentCode"
): Promise<CodeValidationResult> {
    // Query by the specific code field, then verify it belongs to the correct class
    let classCodeData;
    if (codeField === "studentCode") {
        classCodeData = await dbAdmin.query({
            classJoinCodes: {
                $: {
                    where: { studentCode: code },
                },
                class: {},
            },
        });
    } else if (codeField === "teacherCode") {
        classCodeData = await dbAdmin.query({
            classJoinCodes: {
                $: {
                    where: { teacherCode: code },
                },
                class: {},
            },
        });
    } else {
        classCodeData = await dbAdmin.query({
            classJoinCodes: {
                $: {
                    where: { parentCode: code },
                },
                class: {},
            },
        });
    }

    const classCode = classCodeData?.classJoinCodes?.[0];
    if (!classCode || !classCode.class || classCode.class.id !== classId) {
        return {
            success: false,
            error: "Invalid join code for this class",
        };
    }

    return { success: true };
}

async function validateGuestUser(
    userId: string,
    context: "organizations" | "classes"
): Promise<CodeValidationResult> {
    if (await isGuestUser(userId)) {
        return {
            success: false,
            error: `Guest users cannot join ${context}. Please sign in with a full account.`,
        };
    }

    return { success: true };
}

async function validateClassOwners(
    classEntity: any
): Promise<CodeValidationResult> {
    const classOwnerId = classEntity.owner?.id;
    if (classOwnerId && (await isGuestUser(classOwnerId))) {
        return {
            success: false,
            error: "This class is owned by a guest account and cannot accept new members.",
        };
    }

    const orgOwnerId = classEntity.organization?.owner?.id;
    if (orgOwnerId && (await isGuestUser(orgOwnerId))) {
        return {
            success: false,
            error: "This class's organization is owned by a guest account and cannot accept new members.",
        };
    }

    return { success: true };
}

async function createJoinToken(
    code: string,
    type: JoinCodeType,
    entityId: string,
    userId: string
): Promise<string> {
    const tokenId = id();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes from now

    await dbAdmin.transact(
        dbAdmin.tx.joinTokens[tokenId].create({
            token: tokenId,
            code: code,
            type: type,
            entityId: entityId,
            owner: userId,
            expiresAt: expiresAt,
            used: false,
            created: new Date(),
        })
    );

    return tokenId;
}

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
    token?: string;
}

interface JoinResult {
    success: boolean;
    redirectUrl?: string;
    error?: string;
    requiresStudentSelection?: boolean;
    classId?: string;
    students?: Array<{ id: string; email?: string }>;
}

export async function lookupJoinCode(
    code: string,
    userId: string
): Promise<{ success: boolean; data?: LookupResult; error?: string }> {
    if (!code || code.length !== 6) {
        return { success: false, error: "Invalid join code format" };
    }

    if (!userId) {
        return { success: false, error: "User ID is required" };
    }

    try {
        // Early guest check for class codes (student/teacher/parent) to prevent token creation
        // Organization codes are checked later in joinOrganization
        // We'll check class codes here since we need to know the type before creating token
        // Check organization join codes
        const orgCodeData = await dbAdmin.query({
            orgJoinCodes: {
                $: { where: { code: code } },
                organization: {},
            },
        });

        if (orgCodeData?.orgJoinCodes?.[0]) {
            const orgCode = orgCodeData.orgJoinCodes[0];
            const org = orgCode.organization;
            if (org) {
                const tokenId = await createJoinToken(
                    code,
                    "organization",
                    org.id,
                    userId
                );

                return {
                    success: true,
                    data: {
                        type: "organization",
                        entityId: org.id,
                        entityName: org.name,
                        token: tokenId,
                    },
                };
            }
        }

        // Check class join codes for student/teacher/parent codes
        const classCodeData = await dbAdmin.query({
            classJoinCodes: {
                $: {
                    where: {
                        or: [
                            { studentCode: code },
                            { teacherCode: code },
                            { parentCode: code },
                        ],
                    },
                },
                class: {
                    organization: {},
                },
            },
        });

        if (classCodeData?.classJoinCodes?.[0]) {
            const classCode = classCodeData.classJoinCodes[0];
            const classEntity = classCode.class;
            if (classEntity) {
                let type: JoinCodeType;
                if (classCode.studentCode === code) {
                    type = "classStudent";
                } else if (classCode.teacherCode === code) {
                    type = "classTeacher";
                } else {
                    type = "classParent";
                }

                // Early guest check for class codes - prevent token creation
                const guestValidation = await validateGuestUser(userId, "classes");
                if (!guestValidation.success) {
                    return {
                        success: false,
                        error: guestValidation.error,
                    };
                }

                const tokenId = await createJoinToken(
                    code,
                    type,
                    classEntity.id,
                    userId
                );

                return {
                    success: true,
                    data: {
                        type,
                        entityId: classEntity.id,
                        entityName: classEntity.name,
                        organizationId: classEntity.organization?.id,
                        classId: classEntity.id,
                        token: tokenId,
                    },
                };
            }
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

export async function joinOrganization(
    userId: string,
    orgId: string,
    code: string,
    token: string
): Promise<JoinResult> {
    try {
        // Early guest check - prevent unnecessary processing
        const guestValidation = await validateGuestUser(
            userId,
            "organizations"
        );
        if (!guestValidation.success) {
            return {
                success: false,
                error: guestValidation.error,
            };
        }

        // Validate code
        const codeValidation = await validateOrgJoinCode(code, orgId);
        if (!codeValidation.success) {
            return {
                success: false,
                error: codeValidation.error,
            };
        }

        // Validate token
        const tokenValidation = await validateJoinToken(
            token,
            userId,
            code,
            orgId,
            "organization"
        );
        if (!tokenValidation.success) {
            return {
                success: false,
                error: tokenValidation.error,
            };
        }

        const joinToken = tokenValidation.token;

        // Check if organization exists and get owner
        const data = await dbAdmin.query({
            organizations: {
                $: { where: { id: orgId } },
                owner: {},
                orgStudents: {},
                orgTeachers: {},
                orgParents: {},
            },
        });

        const org = data?.organizations?.[0];
        if (!org) {
            return { success: false, error: "Organization not found" };
        }

        // Check if organization owner is a guest
        const ownerId = org.owner?.id;
        if (ownerId && (await isGuestUser(ownerId))) {
            return {
                success: false,
                error: "This organization is owned by a guest account and cannot accept new members.",
            };
        }

        // Check if user is already in any role
        const existingStudents = org.orgStudents ?? [];
        const existingTeachers = org.orgTeachers ?? [];
        const existingParents = org.orgParents ?? [];

        const studentIds = Array.isArray(existingStudents)
            ? existingStudents.map((s: any) => s.id ?? s)
            : [];
        const teacherIds = Array.isArray(existingTeachers)
            ? existingTeachers.map((t: any) => t.id ?? t)
            : [];
        const parentIds = Array.isArray(existingParents)
            ? existingParents.map((p: any) => p.id ?? p)
            : [];

        if (
            studentIds.includes(userId) ||
            teacherIds.includes(userId) ||
            parentIds.includes(userId)
        ) {
            return {
                success: false,
                error: "You are already a member of this organization",
            };
        }

        // When joining via org code, add as student by default
        // (This could be made configurable in the future)
        const transactions: any[] = [
            dbAdmin.tx.organizations[orgId].link({ orgStudents: userId }),
            dbAdmin.tx.joinTokens[joinToken.id].update({ used: true }),
        ];

        await dbAdmin.transact(transactions);

        return {
            success: true,
            redirectUrl: `/org/${orgId}`,
        };
    } catch (err) {
        console.error("Error joining organization:", err);
        return {
            success: false,
            error: "Failed to join organization",
        };
    }
}

export async function joinClassAsStudent(
    userId: string,
    classId: string,
    code: string,
    token: string
): Promise<JoinResult> {
    try {
        // Early guest check - prevent unnecessary processing
        const guestValidation = await validateGuestUser(userId, "classes");
        if (!guestValidation.success) {
            return {
                success: false,
                error: guestValidation.error,
            };
        }

        // Validate code
        const codeValidation = await validateClassJoinCode(
            code,
            classId,
            "studentCode"
        );
        if (!codeValidation.success) {
            return {
                success: false,
                error: codeValidation.error,
            };
        }

        // Validate token
        const tokenValidation = await validateJoinToken(
            token,
            userId,
            code,
            classId,
            "classStudent"
        );
        if (!tokenValidation.success) {
            return {
                success: false,
                error: tokenValidation.error,
            };
        }

        const joinToken = tokenValidation.token;

        // Check if class exists and get owner and organization owner
        const data = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                owner: {},
                classStudents: {},
                organization: {
                    owner: {},
                },
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        // Check if class/org owners are guests
        const ownersValidation = await validateClassOwners(classEntity);
        if (!ownersValidation.success) {
            return {
                success: false,
                error: ownersValidation.error,
            };
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

        const orgId = classEntity.organization?.id;

        // Link user as student to class and organization
        const transactions: any[] = [
            dbAdmin.tx.classes[classId].link({ classStudents: userId }),
            dbAdmin.tx.joinTokens[joinToken.id].update({ used: true }),
        ];

        if (orgId) {
            transactions.push(
                dbAdmin.tx.organizations[orgId].link({ orgStudents: userId })
            );
        }

        await dbAdmin.transact(transactions);

        return {
            success: true,
            redirectUrl: `/class/${orgId}/${classId}/home`,
        };
    } catch (err) {
        console.error("Error joining class as student:", err);
        return {
            success: false,
            error: "Failed to join class",
        };
    }
}

export async function joinClassAsTeacher(
    userId: string,
    classId: string,
    code: string,
    token: string
): Promise<JoinResult> {
    try {
        // Early guest check - prevent unnecessary processing
        const guestValidation = await validateGuestUser(userId, "classes");
        if (!guestValidation.success) {
            return {
                success: false,
                error: guestValidation.error,
            };
        }

        // Validate code
        const codeValidation = await validateClassJoinCode(
            code,
            classId,
            "teacherCode"
        );
        if (!codeValidation.success) {
            return {
                success: false,
                error: codeValidation.error,
            };
        }

        // Validate token
        const tokenValidation = await validateJoinToken(
            token,
            userId,
            code,
            classId,
            "classTeacher"
        );
        if (!tokenValidation.success) {
            return {
                success: false,
                error: tokenValidation.error,
            };
        }

        const joinToken = tokenValidation.token;

        // Check if class exists and get owner and organization owner
        const data = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                owner: {},
                classTeachers: {},
                organization: {
                    owner: {},
                },
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        // Check if class/org owners are guests
        const ownersValidation = await validateClassOwners(classEntity);
        if (!ownersValidation.success) {
            return {
                success: false,
                error: ownersValidation.error,
            };
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

        const orgId = classEntity.organization?.id;

        // Link user as teacher to class and organization
        const transactions: any[] = [
            dbAdmin.tx.classes[classId].link({ classTeachers: userId }),
            dbAdmin.tx.joinTokens[joinToken.id].update({ used: true }),
        ];

        if (orgId) {
            transactions.push(
                dbAdmin.tx.organizations[orgId].link({ orgTeachers: userId })
            );
        }

        await dbAdmin.transact(transactions);

        return {
            success: true,
            redirectUrl: `/class/${orgId}/${classId}/home`,
        };
    } catch (err) {
        console.error("Error joining class as teacher:", err);
        return {
            success: false,
            error: "Failed to join class",
        };
    }
}

export async function getClassStudents(classId: string): Promise<{
    success: boolean;
    students?: Array<{
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        imageURL?: string;
        avatarURL?: string;
    }>;
    error?: string;
}> {
    try {
        const data = await dbAdmin.query({
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
                  firstName: s.firstName,
                  lastName: s.lastName,
                  imageURL: s.imageURL,
                  avatarURL: s.avatarURL,
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

export async function joinClassAsParent(
    userId: string,
    classId: string,
    studentIds: string[],
    code: string,
    token: string
): Promise<JoinResult> {
    if (!studentIds || studentIds.length === 0) {
        return {
            success: false,
            error: "Please select at least one student",
        };
    }

    try {
        // Early guest check - prevent unnecessary processing
        const guestValidation = await validateGuestUser(userId, "classes");
        if (!guestValidation.success) {
            return {
                success: false,
                error: guestValidation.error,
            };
        }

        // Validate code
        const codeValidation = await validateClassJoinCode(
            code,
            classId,
            "parentCode"
        );
        if (!codeValidation.success) {
            return {
                success: false,
                error: codeValidation.error,
            };
        }

        // Validate token
        const tokenValidation = await validateJoinToken(
            token,
            userId,
            code,
            classId,
            "classParent"
        );
        if (!tokenValidation.success) {
            return {
                success: false,
                error: tokenValidation.error,
            };
        }

        const joinToken = tokenValidation.token;

        // Check if class exists and get owner and organization owner
        const data = await dbAdmin.query({
            classes: {
                $: { where: { id: classId } },
                owner: {},
                classParents: {},
                organization: {
                    owner: {},
                },
            },
        });

        const classEntity = data?.classes?.[0];
        if (!classEntity) {
            return { success: false, error: "Class not found" };
        }

        // Check if class/org owners are guests
        const ownersValidation = await validateClassOwners(classEntity);
        if (!ownersValidation.success) {
            return {
                success: false,
                error: ownersValidation.error,
            };
        }

        const existingParents = classEntity.classParents ?? [];
        const parentIds = Array.isArray(existingParents)
            ? existingParents.map((p: any) => p.id ?? p)
            : [];

        const orgId = classEntity.organization?.id;

        // Link user as parent to class and organization
        const transactions: any[] = [];
        if (!parentIds.includes(userId)) {
            transactions.push(
                dbAdmin.tx.classes[classId].link({ classParents: userId })
            );
        }

        // Link parent to organization
        if (orgId) {
            transactions.push(
                dbAdmin.tx.organizations[orgId].link({ orgParents: userId })
            );
        }

        // Link parent to each selected student
        for (const studentId of studentIds) {
            transactions.push(
                dbAdmin.tx.$users[userId].link({ children: studentId })
            );
        }

        // Mark token as used
        transactions.push(
            dbAdmin.tx.joinTokens[joinToken.id].update({ used: true })
        );

        await dbAdmin.transact(transactions);

        return {
            success: true,
            redirectUrl: `/class/${orgId}/${classId}/home`,
        };
    } catch (err) {
        console.error("Error joining class as parent:", err);
        return {
            success: false,
            error: "Failed to join class as parent",
        };
    }
}
