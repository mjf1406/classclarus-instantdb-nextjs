/** @format */

"use client";

import React, { createContext, useContext } from "react";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type UserData = InstaQLEntity<AppSchema, "$users"> | undefined;

interface AuthContextValue {
    user: {
        created_at: Date | null | string;
        email: string;
        id: string;
        imageURL: string | null;
        avatarURL: string | null;
        isGuest: boolean;
        polarCustomerId: string | null;
        refresh_token: string | null;
        updated_at: Date | null | string;
        type: string;
        firstName: string | null;
        lastName: string | null;
        plan: string;
    };
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading: authLoading } = db.useAuth();

    const { data, isLoading: dataLoading } = db.useQuery(
        user?.id
            ? {
                  $users: {
                      $: { where: { id: user.id } },
                  },
              }
            : null
    );

    const userData = data?.$users?.[0];

    const value: AuthContextValue = {
        user: {
            created_at: userData?.created || "",
            email: user?.email || "",
            id: user?.id || "",
            imageURL: user?.imageURL || null,
            avatarURL: userData?.avatarURL || null,
            isGuest: user?.isGuest || false,
            polarCustomerId: userData?.polarCustomerId || null,
            refresh_token: user?.refresh_token || null,
            updated_at: userData?.updated || null,
            type: userData?.type || "guest",
            firstName: userData?.firstName || null,
            lastName: userData?.lastName || null,
            plan: userData?.plan || "free",
        },
        isLoading: authLoading || dataLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
