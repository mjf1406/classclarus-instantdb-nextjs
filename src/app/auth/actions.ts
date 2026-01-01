/** @format */

"use server";

import dbAdmin from "@/lib/db/db-admin";

interface UpdateUserProfileParams {
    userId: string;
    firstName: string;
    lastName: string;
    plan: string;
}

export async function updateUserProfileAfterOAuth({
    userId,
    firstName,
    lastName,
    plan,
}: UpdateUserProfileParams): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
        return { success: false, error: "User ID is required" };
    }

    try {
        await dbAdmin.transact(
            dbAdmin.tx.$users[userId].update({
                firstName,
                lastName,
                plan,
            })
        );

        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update user profile",
        };
    }
}

