/** @format */

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClassErrorStateProps {
    error: Error;
    orgId: string;
}

export function ClassErrorState({ error, orgId }: ClassErrorStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
                <p className="text-destructive font-medium">
                    Failed to load class
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {error.message}
                </p>
                <Link href={`/${orgId}`}>
                    <Button
                        variant="outline"
                        className="mt-4"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Organization
                    </Button>
                </Link>
            </div>
        </div>
    );
}

