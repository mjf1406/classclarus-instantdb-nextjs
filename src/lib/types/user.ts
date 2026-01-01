/** @format */

export type User = {
    app_id: string;
    created_at: Date;
    id: string;
    isGuest: boolean;
    polarCustomerId?: string;
    refresh_token?: string;
    type: "user" | "admin" | "guest";
};
