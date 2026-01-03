/** @format */

"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import AppNavbar from "@/components/navbar/app-navbar";
import { SignedOutNavbar } from "@/components/navbar/signed-out-navbar";
import { SignedOutView } from "../page";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasteCodeButton } from "@/components/ui/paste-code-button";
import {
    lookupJoinCode,
    joinOrganization,
    joinClassAsStudent,
    joinClassAsTeacher,
    getClassStudents,
    joinClassAsParent,
} from "./actions";
import { StudentSelection } from "@/components/join-codes";

type PageState = "idle" | "loading" | "studentSelection" | "success" | "error";

function JoinPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: isUserLoading } = useAuthContext();
    const [code, setCode] = useState("");
    const [state, setState] = useState<PageState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [classId, setClassId] = useState<string | null>(null);
    const [students, setStudents] = useState<
        Array<{ id: string; email?: string }>
    >([]);
    const [hasProcessedUrlCode, setHasProcessedUrlCode] = useState(false);
    const [joinToken, setJoinToken] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState<string | null>(null);

    const handleCodeComplete = useCallback(
        async (value: string) => {
            if (!user?.id) {
                setError("You must be logged in to join");
                setState("error");
                return;
            }

            if (value.length !== 6) {
                return;
            }

            setState("loading");
            setError(null);

            try {
                // Early guest check - prevent server action call entirely for guests
                if (user?.isGuest) {
                    setError(
                        "Guest users cannot join organizations or classes. Please sign in with a full account."
                    );
                    setState("error");
                    setCode("");
                    return;
                }

                // Lookup the join code
                const lookupResult = await lookupJoinCode(value, user.id);

                if (!lookupResult.success || !lookupResult.data) {
                    setError(lookupResult.error || "Invalid join code");
                    setState("error");
                    setCode("");
                    return;
                }

                const {
                    type,
                    entityId,
                    organizationId,
                    classId: lookupClassId,
                    token,
                } = lookupResult.data;

                if (!token) {
                    setError("Failed to generate join token");
                    setState("error");
                    setCode("");
                    return;
                }

                // Store token and code for later use
                setJoinToken(token);
                setJoinCode(value);

                // Handle parent join code - show student selection
                if (type === "classParent") {

                    if (!lookupClassId) {
                        setError("Class not found");
                        setState("error");
                        setCode("");
                        return;
                    }

                    // Get students for this class
                    const studentsResult = await getClassStudents(
                        lookupClassId
                    );

                    if (!studentsResult.success || !studentsResult.students) {
                        setError(
                            studentsResult.error || "Failed to load students"
                        );
                        setState("error");
                        setCode("");
                        return;
                    }

                    setClassId(lookupClassId);
                    setStudents(studentsResult.students);
                    setState("studentSelection");
                    return;
                }

                // Handle other join code types - join immediately
                let joinResult;
                if (type === "organization") {
                    joinResult = await joinOrganization(
                        user.id,
                        entityId,
                        value,
                        token
                    );
                } else if (type === "classStudent") {
                    joinResult = await joinClassAsStudent(
                        user.id,
                        entityId,
                        value,
                        token
                    );
                } else if (type === "classTeacher") {
                    joinResult = await joinClassAsTeacher(
                        user.id,
                        entityId,
                        value,
                        token
                    );
                } else {
                    setError("Unknown join code type");
                    setState("error");
                    setCode("");
                    return;
                }

                if (!joinResult.success) {
                    setError(joinResult.error || "Failed to join");
                    setState("error");
                    setCode("");
                    return;
                }

                // Redirect on success
                if (joinResult.redirectUrl) {
                    router.push(joinResult.redirectUrl);
                } else {
                    setState("success");
                }
            } catch (err) {
                console.error("Error processing join code:", err);
                setError("An unexpected error occurred");
                setState("error");
                setCode("");
            }
        },
        [user?.id, user?.isGuest, router]
    );

    const handleStudentSelection = useCallback(
        async (selectedStudentIds: string[]) => {
            if (!user?.id || !classId || !joinToken || !joinCode) {
                setError("Missing required information");
                setState("error");
                return;
            }

            setState("loading");

            try {
                const joinResult = await joinClassAsParent(
                    user.id,
                    classId,
                    selectedStudentIds,
                    joinCode,
                    joinToken
                );

                if (!joinResult.success) {
                    setError(joinResult.error || "Failed to join as parent");
                    setState("error");
                    return;
                }

                // Redirect on success
                if (joinResult.redirectUrl) {
                    router.push(joinResult.redirectUrl);
                } else {
                    setState("success");
                }
            } catch (err) {
                console.error("Error joining as parent:", err);
                setError("An unexpected error occurred");
                setState("error");
            }
        },
        [user?.id, classId, joinToken, joinCode, router]
    );

    const handleReset = () => {
        setCode("");
        setState("idle");
        setError(null);
        setClassId(null);
        setStudents([]);
        setHasProcessedUrlCode(false);
        setJoinToken(null);
        setJoinCode(null);
        // Clear query parameter
        router.replace("/join");
    };

    // Handle code from URL query parameter
    useEffect(() => {
        if (hasProcessedUrlCode || isUserLoading || !user) {
            return;
        }

        const urlCode = searchParams.get("code");
        if (urlCode && urlCode.length === 6) {
            setCode(urlCode);
            setHasProcessedUrlCode(true);
            // Auto-trigger the join process
            handleCodeComplete(urlCode).catch((err) => {
                console.error("Error processing URL code:", err);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, hasProcessedUrlCode, isUserLoading, user]);

    // Show loading state while checking auth
    if (isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Show signed out view if not authenticated
    if (!user) {
        return (
            <>
                <SignedOutNavbar />
                <div className="min-h-screen flex items-center justify-center p-4">
                    <SignedOutView />
                </div>
            </>
        );
    }

    return (
        <>
            <AppNavbar />
            <div className="min-h-screen flex flex-col items-center justify-start p-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">Join with Code</h1>
                        <p className="text-muted-foreground">
                            Enter a 6-character join code to join an
                            organization or class
                        </p>
                    </div>

                    {state === "idle" && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center space-y-2">
                                <Card className="p-8">
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            value={code}
                                            onChange={(value) => {
                                                // Convert to uppercase (pattern prop handles alphanumeric filtering)
                                                const upperValue =
                                                    value.toUpperCase();
                                                setCode(upperValue);
                                                if (upperValue.length === 6) {
                                                    handleCodeComplete(
                                                        upperValue
                                                    );
                                                }
                                            }}
                                        >
                                            <InputOTPGroup>
                                                {Array.from({ length: 3 }).map(
                                                    (_, i) => (
                                                        <InputOTPSlot
                                                            key={i}
                                                            index={i}
                                                            className="h-10 w-10 text-lg sm:h-12 sm:w-12 sm:text-xl md:h-16 md:w-16 md:text-2xl"
                                                        />
                                                    )
                                                )}
                                            </InputOTPGroup>
                                            <InputOTPSeparator className="mx-1 [&>svg]:size-4 sm:mx-2 sm:[&>svg]:size-6 md:[&>svg]:size-8" />
                                            <InputOTPGroup>
                                                {Array.from({ length: 3 }).map(
                                                    (_, i) => (
                                                        <InputOTPSlot
                                                            key={i + 3}
                                                            index={i + 3}
                                                            className="h-10 w-10 text-lg sm:h-12 sm:w-12 sm:text-xl md:h-16 md:w-16 md:text-2xl"
                                                        />
                                                    )
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                </Card>
                                <PasteCodeButton
                                    onPaste={(pastedCode) => {
                                        setCode(pastedCode);
                                        if (pastedCode.length === 6) {
                                            handleCodeComplete(pastedCode);
                                        }
                                    }}
                                    codeLength={6}
                                    codeType="alphanumeric"
                                    disabled={state !== "idle"}
                                />
                                <p className="text-sm text-muted-foreground">
                                    The hyphen is only for readability
                                </p>
                            </div>
                        </div>
                    )}

                    {state === "loading" && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-8">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Processing join code...
                            </p>
                        </div>
                    )}

                    {state === "studentSelection" && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-2">
                                    Select Your Students
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose which students you want to link to
                                    your account
                                </p>
                            </div>
                            <StudentSelection
                                students={students}
                                onSelect={handleStudentSelection}
                                isLoading={false}
                            />
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {state === "error" && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                                <p className="text-destructive font-medium">
                                    {error || "An error occurred"}
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <Button onClick={handleReset}>
                                    Try Another Code
                                </Button>
                            </div>
                        </div>
                    )}

                    {state === "success" && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-center">
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    Successfully joined!
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <Button onClick={() => router.push("/")}>
                                    Go to Home
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function JoinPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <JoinPageContent />
        </Suspense>
    );
}
