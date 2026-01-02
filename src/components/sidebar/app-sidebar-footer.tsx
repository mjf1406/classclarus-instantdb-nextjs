/** @format */

"use client";

import { Loader } from "lucide-react";
import { useAuthContext } from "../auth/auth-provider";
import GuestUpgradeCard from "../guest/guest-upgrade-card";
import { SidebarFooter } from "../ui/sidebar";
import { NavUser } from "./nav-user";

export default function AppSidebarFooter() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div>
                <Loader className="animate-spin" />
            </div>
        );
    }

    return (
        <SidebarFooter>
            {user?.isGuest && <GuestUpgradeCard />}
            <NavUser />
        </SidebarFooter>
    );
}
