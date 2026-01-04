/** @format */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FileQuestion,
    SearchX,
    Home,
    ArrowLeft,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "@/components/ui/collapsible";

export default function NotFound() {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md">
                    <Card className="border-muted-foreground/50">
                        <CardHeader className="text-center space-y-4 pb-4">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <FileQuestion className="size-16 text-muted-foreground" />
                                    <SearchX className="size-8 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold">
                                    404
                                </CardTitle>
                                <CardTitle className="text-xl">
                                    Page Not Found
                                </CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                The page you&apos;re looking for doesn&apos;t
                                exist or has been moved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-muted-foreground/20 bg-muted/50 p-4 space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    This page may have been deleted, moved, or
                                    the URL might be incorrect. Please check the
                                    address and try again.
                                </p>
                                <Collapsible
                                    open={isOpen}
                                    onOpenChange={setIsOpen}
                                >
                                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                                        <ChevronDown
                                            className={`size-4 transition-transform duration-200 ${
                                                isOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                        <span>
                                            What should I do if I keep seeing
                                            this page?
                                        </span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pt-2">
                                        <p className="text-sm text-muted-foreground pl-6">
                                            Try navigating from the home page or
                                            using the navigation menu. If you
                                            believe this is an error, please
                                            contact support.
                                        </p>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    asChild
                                    variant="default"
                                    className="w-full"
                                >
                                    <Link href="/">
                                        <Home className="size-4" />
                                        Go to Home
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="w-full"
                                >
                                    <Link href="/">
                                        <ArrowLeft className="size-4" />
                                        Back
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
