/** @format */

"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

interface ClassNotFoundStateProps {
    orgId: string;
}

export function ClassNotFoundState({ orgId }: ClassNotFoundStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Empty className="border bg-card rounded-xl p-8 max-w-md">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <GraduationCap className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>Class not found</EmptyTitle>
                    <EmptyDescription>
                        The class you&apos;re looking for doesn&apos;t exist or
                        you don&apos;t have access to it.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Link href={`/org/${orgId}`}>
                        <Button>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                    </Link>
                </EmptyContent>
            </Empty>
        </div>
    );
}
