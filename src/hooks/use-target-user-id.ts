/** @format */

"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useClassRole } from "./use-class-role";
import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";

/**
 * Hook that returns the target user ID for data filtering based on role:
 * - Students: their own user ID
 * - Parents: selected child's user ID (from URL param)
 * - Teachers/Admins: null (show all data)
 */
export function useTargetUserId(): {
    targetUserId: string | null;
    isLoading: boolean;
} {
    const { user } = useAuthContext();
    const { role, isLoading: roleLoading } = useClassRole();
    const searchParams = useSearchParams();
    const selectedChildId = searchParams.get("childId");

    // Query children if user is a parent
    const { data: childrenData, isLoading: childrenLoading } = db.useQuery(
        user?.id && role === "parent"
            ? {
                  $users: {
                      $: { where: { id: user.id } },
                      children: {},
                  },
              }
            : null
    );

    const targetUserId = useMemo(() => {
        if (roleLoading || childrenLoading) {
            return null;
        }

        // Students see their own data
        if (role === "student") {
            return user?.id || null;
        }

        // Parents see selected child's data
        if (role === "parent") {
            if (selectedChildId) {
                // Verify the selected child is actually a child of this parent
                const children = childrenData?.$users?.[0]?.children ?? [];
                const childExists = children.some(
                    (c: any) => c.id === selectedChildId
                );
                if (childExists) {
                    return selectedChildId;
                }
            }
            // Default to first child if no selection
            const firstChild = childrenData?.$users?.[0]?.children?.[0];
            return firstChild?.id || null;
        }

        // Teachers and admins see all data (return null to indicate no filtering)
        return null;
    }, [role, roleLoading, user?.id, selectedChildId, childrenData, childrenLoading]);

    return {
        targetUserId,
        isLoading: roleLoading || childrenLoading,
    };
}

