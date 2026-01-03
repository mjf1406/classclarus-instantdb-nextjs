/** @format */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Clock, Home, ArrowLeft, ChevronDown } from "lucide-react";
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
import { useAuthContext } from "@/components/auth/auth-provider";
import AppNavbar from "@/components/navbar/app-navbar";
import { SignedOutNavbar } from "@/components/navbar/signed-out-navbar";

export default function BlockedPage() {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md">
                    <Card className="border-destructive/50">
                        <CardHeader className="text-center space-y-4 pb-4">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <ShieldAlert className="size-16 text-destructive" />
                                    <Clock className="size-8 text-destructive absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold">
                                    429
                                </CardTitle>
                                <CardTitle className="text-xl">
                                    Too Many Requests
                                </CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                You've made too many requests in a short period
                                of time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Please wait a few moments before trying
                                    again. Rate limits help us ensure fair usage
                                    for all users.
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
                                            Why don&apos;t we tell you exactly
                                            how long you have to wait?
                                        </span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pt-2">
                                        <p className="text-sm text-muted-foreground pl-6">
                                            If we told you, then people could
                                            exploit that information to their
                                            advantage.
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
