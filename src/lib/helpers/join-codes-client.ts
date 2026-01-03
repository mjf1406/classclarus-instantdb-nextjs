/** @format */

// Generate a random join code (6 characters, alphanumeric, uppercase)
export function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars: I, O, 0, 1
    // A 6-character code has 32^6 = 1,073,741,824 (1+ billion) possible combinations
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate a join code that's unique within the provided set
// Does not check database - relies on database uniqueness constraint to catch collisions
export function generateUniqueJoinCodeClient(
    existingCodes?: Set<string>
): string {
    const usedCodes = existingCodes ?? new Set<string>();
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateJoinCode();
        // Check against codes we're about to use in this batch
        if (!usedCodes.has(code)) {
            return code;
        }
    }
    
    throw new Error(
        "Failed to generate unique join code after maximum attempts"
    );
}

// Generate all three unique join codes for a class
// Does not check database - relies on database uniqueness constraint to catch collisions
export function generateAllJoinCodesClient(): {
    joinCodeStudent: string;
    joinCodeTeacher: string;
    joinCodeParent: string;
} {
    const usedCodes = new Set<string>();

    const joinCodeStudent = generateUniqueJoinCodeClient(usedCodes);
    usedCodes.add(joinCodeStudent);

    const joinCodeTeacher = generateUniqueJoinCodeClient(usedCodes);
    usedCodes.add(joinCodeTeacher);

    const joinCodeParent = generateUniqueJoinCodeClient(usedCodes);

    return { joinCodeStudent, joinCodeTeacher, joinCodeParent };
}

// Check if an error is a uniqueness constraint violation
export function isUniquenessError(error: unknown): boolean {
    if (!error) return false;
    
    const errorMessage = 
        error instanceof Error 
            ? error.message 
            : typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : String(error);
    
    // Check for common uniqueness constraint error patterns
    const uniquenessPatterns = [
        /unique/i,
        /duplicate/i,
        /already exists/i,
        /constraint/i,
    ];
    
    return uniquenessPatterns.some(pattern => pattern.test(errorMessage));
}


