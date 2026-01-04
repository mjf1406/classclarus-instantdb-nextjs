/** @format */

"use client";

import { use, useState } from "react";
import { db } from "@/lib/db/db";
import { escapeHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Fullscreen } from "lucide-react";
import { cn } from "@/lib/utils";
import BlankBackgroundLoader from "@/components/loaders/blank-background-loader";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface JoinCodesPageProps {
    params: Promise<{ orgId: string }>;
}

// Format code with hyphen after first 3 characters for readability
function formatCodeForDisplay(code: string): string {
    if (code.length <= 3) return code;
    return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export default function JoinCodesPage({ params }: JoinCodesPageProps) {
    const { orgId } = use(params);
    const [copied, setCopied] = useState(false);
    const [showFullscreen, setShowFullscreen] = useState(false);

    // Query the organization with join code
    const { data, isLoading, error } = db.useQuery({
        organizations: {
            $: { where: { id: orgId } },
            joinCodeEntity: {},
        },
    });

    if (isLoading) {
        return <BlankBackgroundLoader />;
    }

    const organization = data?.organizations?.[0];
    const joinCode = organization?.joinCodeEntity?.code;

    const handleCopyJoinCode = async () => {
        if (!joinCode) return;
        try {
            await navigator.clipboard.writeText(joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    const handleOpenFullscreen = () => {
        if (!joinCode) return;
        setShowFullscreen(true);
    };

    const handleOpenInNewWindow = () => {
        if (!organization || !joinCode) return;
        const formattedCode = formatCodeForDisplay(joinCode);
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Join Code - ${escapeHtml(organization.name)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #6366f1 0%, #6366f199 100%);
            color: white;
        }
        .container {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 4rem;
            padding: 2rem;
            width: 100%;
        }
        .code-section {
            text-align: center;
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; opacity: 0.9; }
        .code-label { font-size: 1.5rem; opacity: 0.8; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; }
        .code-type { font-size: 1.25rem; opacity: 0.9; margin-bottom: 0.5rem; font-weight: 600; }
        .code {
            font-size: 10rem;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            letter-spacing: 1rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem 3rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
            border: 4px solid rgba(255, 255, 255, 0.3);
            display: inline-block;
        }
        .steps {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            padding: 2.5rem;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            text-align: left;
        }
        .steps h2 { font-size: 2.5rem; margin-bottom: 2rem; }
        .steps ol { list-style: none; counter-reset: step; }
        .steps li {
            display: flex;
            align-items: flex-start;
            gap: 1.25rem;
            margin-bottom: 1.5rem;
            font-size: 1.75rem;
        }
        .steps li::before {
            counter-increment: step;
            content: counter(step);
            flex-shrink: 0;
            width: 2.5rem;
            height: 2.5rem;
            background: white;
            color: #6366f1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.25rem;
        }
        .url { font-family: 'Courier New', monospace; font-weight: bold; }
        @media (max-width: 1200px) {
            .container { flex-direction: column; gap: 2rem; }
            .code { font-size: 6rem; letter-spacing: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="code-section">
            <h1>${escapeHtml(organization.name)}</h1>
            <div class="code-type">Organization Code</div>
            <div class="code-label">Join Code</div>
            <div class="code">${escapeHtml(formattedCode)}</div>
            <div style="font-size: 3rem; opacity: 0.8; margin-top: 1rem;">The hyphen is for readability only.</div>
        </div>
        <div class="steps">
            <h2>How to Join</h2>
            <ol>
                <li>Go to <span class="url">app.classclarus.com/join</span></li>
                <li>Input the code you see on the screen</li>
                <li>Click the <strong>Join Organization</strong> button</li>
                <li>All done!</li>
            </ol>
        </div>
    </div>
</body>
</html>`;
        const newWindow = window.open("", "_blank", "width=1400,height=700");
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive font-medium">
                        Failed to load organization
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error.message}
                    </p>
                </div>
            </div>
        );
    }

    // Not found state
    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center">
                    <Building2 className="size-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-semibold">Organization Not Found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The organization you&apos;re looking for doesn&apos;t
                        exist.
                    </p>
                </div>
            </div>
        );
    }

    if (!joinCode) {
        return (
            <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
                <main className="mx-auto max-w-6xl px-4 py-8">
                    <div className="rounded-2xl border bg-card p-8 text-center">
                        <p className="text-muted-foreground">
                            No join code available for this organization.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Join Code
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Share this code with others to join this
                            organization
                        </p>
                    </div>

                    {/* Join Code Display */}
                    <div className="rounded-2xl border bg-card p-8 md:p-12">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Code Label */}
                            <p className="text-lg md:text-xl uppercase tracking-wider font-semibold text-violet-500">
                                Organization Join Code
                            </p>

                            {/* Code Display */}
                            <div className="rounded-2xl border-4 border-violet-500 bg-muted/50 px-8 py-6 md:px-16 md:py-12 w-full max-w-2xl">
                                <p
                                    className="font-bold font-mono tracking-[0.15em] text-center"
                                    style={{
                                        fontSize: "clamp(2rem, 8vw, 6rem)",
                                    }}
                                >
                                    {formatCodeForDisplay(joinCode)}
                                </p>
                            </div>
                            <p className="text-2xl text-muted-foreground mt-2">
                                The hyphen is for readability only.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button
                                    onClick={handleCopyJoinCode}
                                    variant="outline"
                                    size="lg"
                                >
                                    {copied ? (
                                        <>
                                            <Copy className="size-5 mr-2" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-5 mr-2" />
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleOpenInNewWindow}
                                    variant="outline"
                                    size="lg"
                                >
                                    <ExternalLink className="size-5 mr-2" />
                                    Open in New Window
                                </Button>
                                <Button
                                    onClick={handleOpenFullscreen}
                                    variant="outline"
                                    size="lg"
                                >
                                    <Fullscreen className="size-5 mr-2" />
                                    Fullscreen
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-2xl border bg-card p-6 md:p-10">
                        <p className="text-2xl md:text-3xl font-semibold mb-6">
                            How to Join
                        </p>
                        <ol className="space-y-4 text-base md:text-lg">
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    1
                                </span>
                                <span>
                                    Go to{" "}
                                    <span className="font-mono font-semibold text-violet-500">
                                        app.classclarus.com/join
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    2
                                </span>
                                <span>
                                    Input the code you see on the screen
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    3
                                </span>
                                <span>
                                    Click the{" "}
                                    <span className="font-semibold">
                                        Join Organization
                                    </span>{" "}
                                    button
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    4
                                </span>
                                <span>All done!</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </main>

            {/* Fullscreen Join Code Dialog */}
            {organization && joinCode && (
                <OrgJoinCodeDialog
                    open={showFullscreen}
                    onOpenChange={setShowFullscreen}
                    organizationName={organization.name}
                    joinCode={joinCode}
                    onCopyJoinCode={handleCopyJoinCode}
                    onOpenInNewWindow={handleOpenInNewWindow}
                />
            )}
        </div>
    );
}

// Fullscreen dialog component for org join code
function OrgJoinCodeDialog({
    open,
    onOpenChange,
    organizationName,
    joinCode,
    onCopyJoinCode,
    onOpenInNewWindow,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationName: string;
    joinCode: string;
    onCopyJoinCode: () => void;
    onOpenInNewWindow: () => void;
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="max-w-none! w-screen! h-screen! m-0! rounded-none! top-0! left-0! translate-x-0! translate-y-0! flex flex-col p-8!">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-center text-3xl">
                        {organizationName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center justify-center flex-1 gap-8 lg:gap-16">
                    {/* Join Code */}
                    <div className="flex flex-col items-center">
                        <p className="text-lg md:text-xl mb-3 uppercase tracking-wider font-semibold text-violet-500">
                            Organization Join Code
                        </p>
                        <div className="rounded-2xl border-4 border-violet-500 bg-muted/50 px-8 py-6 md:px-16 md:py-12">
                            <p
                                className="font-bold font-mono tracking-[0.15em] text-center"
                                style={{
                                    fontSize: "clamp(3rem, 10vw, 12rem)",
                                }}
                            >
                                {formatCodeForDisplay(joinCode)}
                            </p>
                        </div>
                        <p className="text-4xl text-muted-foreground mt-2">
                            The hyphen is for readability only.
                        </p>
                    </div>

                    {/* Procedure Steps */}
                    <div className="flex flex-col items-start bg-muted/30 rounded-2xl p-6 md:p-10 border">
                        <p className="text-2xl md:text-3xl font-semibold mb-6">
                            How to Join
                        </p>
                        <ol className="space-y-4 text-xl md:text-2xl">
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    1
                                </span>
                                <span>
                                    Go to{" "}
                                    <span className="font-mono font-semibold text-violet-500">
                                        www.classclarus.com/join
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    2
                                </span>
                                <span>
                                    Input the code you see on the screen
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    3
                                </span>
                                <span>
                                    Click the{" "}
                                    <span className="font-semibold">
                                        Join Organization
                                    </span>{" "}
                                    button
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl bg-violet-500">
                                    4
                                </span>
                                <span>All done!</span>
                            </li>
                        </ol>
                    </div>
                </div>
                <div className="flex justify-center gap-3 pt-4">
                    <Button
                        onClick={onCopyJoinCode}
                        variant="outline"
                        size="lg"
                    >
                        <Copy className="size-5 mr-2" />
                        Copy Code
                    </Button>
                    <Button
                        onClick={onOpenInNewWindow}
                        variant="outline"
                        size="lg"
                    >
                        <ExternalLink className="size-5 mr-2" />
                        Open in New Window
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
