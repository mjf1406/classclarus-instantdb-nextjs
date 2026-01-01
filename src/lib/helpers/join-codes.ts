/** @format */

import { db } from "@/lib/db/db";

// Generate a random join code (8 characters, alphanumeric, uppercase)
export function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars: I, O, 0, 1
    // An 8-character code has 32^8 = 1,099,511,627,776 (1+ trillion) possible combinations
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Check if a code exists in any join code field across organizations and classes
export async function isJoinCodeInUse(code: string): Promise<boolean> {
    const { data } = await db.queryOnce({
        organizations: {
            $: {
                where: { joinCode: code },
            },
        },
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
        },
    });
    return (
        (data?.organizations?.length ?? 0) > 0 ||
        (data?.classes?.length ?? 0) > 0
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
