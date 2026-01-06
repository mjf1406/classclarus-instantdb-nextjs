/** @format */

"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function JoinOrgClassButton() {
    return (
        <Button
            asChild
            variant={"outline"}
        >
            <Link href="/join">
                <UserPlus className="size-4" />
                <span className="hidden md:inline">Join Org/Class</span>
            </Link>
        </Button>
    );
}

