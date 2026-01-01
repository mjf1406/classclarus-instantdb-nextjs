/** @format */

"use server";

import dbAdmin from "@/lib/db/db-admin";

// Generate a random join code (8 characters, alphanumeric, uppercase)
function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars: I, O, 0, 1
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Check if a code exists in any join code entity
// Uses admin SDK to bypass permissions and check all codes
async function isJoinCodeInUse(code: string): Promise<boolean> {
    const { data } = await dbAdmin.query({
        orgJoinCodes: {
            $: {
                where: { code: code },
            },
        },
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
        },
    });
    return (
        (data?.orgJoinCodes?.length ?? 0) > 0 ||
        (data?.classJoinCodes?.length ?? 0) > 0
    );
}

// Generate a unique join code that doesn't exist in any code field
export async function generateUniqueJoinCode(
    existingCodes?: Set<string>
): Promise<string> {
    const usedCodes = existingCodes ?? new Set<string>();
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateJoinCode();
        // Check against codes we're about to use in this batch
        if (usedCodes.has(code)) {
            continue;
        }
        // Check against codes in the database
        const inUse = await isJoinCodeInUse(code);
        if (!inUse) {
            return code;
        }
    }
    throw new Error(
        "Failed to generate unique join code after maximum attempts"
    );
}

// Generate all three unique join codes for a class
export async function generateAllJoinCodes(): Promise<{
    joinCodeStudent: string;
    joinCodeTeacher: string;
    joinCodeParent: string;
}> {
    const usedCodes = new Set<string>();

    const joinCodeStudent = await generateUniqueJoinCode(usedCodes);
    usedCodes.add(joinCodeStudent);

    const joinCodeTeacher = await generateUniqueJoinCode(usedCodes);
    usedCodes.add(joinCodeTeacher);

    const joinCodeParent = await generateUniqueJoinCode(usedCodes);

    return { joinCodeStudent, joinCodeTeacher, joinCodeParent };
}

