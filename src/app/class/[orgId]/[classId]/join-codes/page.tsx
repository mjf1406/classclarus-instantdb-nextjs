/** @format */

"use client";

import { use, useState } from "react";
import { db } from "@/lib/db/db";
import { escapeHtml } from "@/lib/utils";
import { JoinCodeDialog } from "../home/components/join-code-dialog";
import { ClassErrorState } from "../home/components/class-error-state";
import { ClassNotFoundState } from "../home/components/class-not-found-state";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Fullscreen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ClassQueryResult,
    JoinCodeType,
    codeLabels,
    codeColors,
} from "../home/types";

interface JoinCodesPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function JoinCodesPage({ params }: JoinCodesPageProps) {
    const { orgId, classId } = use(params);
    const [selectedCodeType, setSelectedCodeType] =
        useState<JoinCodeType>("student");
    const [copied, setCopied] = useState<JoinCodeType | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);

    // Query the class with related data
    const { data, isLoading, error } = db.useQuery({
        classes: {
            $: { where: { id: classId } },
            joinCodeEntity: {},
        },
    });

    const classData = data?.classes?.[0] as ClassQueryResult | undefined;

    const joinCodes = classData?.joinCodeEntity
        ? {
              student: classData.joinCodeEntity.studentCode,
              teacher: classData.joinCodeEntity.teacherCode,
              parent: classData.joinCodeEntity.parentCode,
          }
        : null;

    const handleCopyJoinCode = async (codeType: JoinCodeType) => {
        if (!joinCodes) return;
        try {
            await navigator.clipboard.writeText(joinCodes[codeType]);
            setCopied(codeType);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    const handleOpenFullscreen = () => {
        if (!joinCodes) return;
        setShowFullscreen(true);
    };

    const handleOpenInNewWindow = (codeType: JoinCodeType) => {
        if (!classData || !joinCodes) return;
        const code = joinCodes[codeType];
        const label = codeLabels[codeType];
        const colorMap = {
            student: "#3b82f6",
            teacher: "#10b981",
            parent: "#f59e0b",
        };
        const color = colorMap[codeType];
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${escapeHtml(label)} Join Code - ${escapeHtml(
            classData.name
        )}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, ${color} 0%, ${color}99 100%);
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
            color: ${color};
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
            <h1>${escapeHtml(classData.name)}</h1>
            <div class="code-type">${escapeHtml(label)} Code</div>
            <div class="code-label">Join Code</div>
            <div class="code">${escapeHtml(code)}</div>
        </div>
        <div class="steps">
            <h2>How to Join</h2>
            <ol>
                <li>Go to <span class="url">www.classclarus.com/join</span></li>
                <li>Input the code you see on the screen</li>
                <li>Click the <strong>Join Class</strong> button</li>
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
            <ClassErrorState
                error={
                    error instanceof Error
                        ? error
                        : new Error(error.message || "Unknown error")
                }
                orgId={orgId}
            />
        );
    }

    // Not found state
    if (!classData) {
        return <ClassNotFoundState orgId={orgId} />;
    }

    if (!joinCodes) {
        return (
            <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
                <main className="mx-auto max-w-6xl px-4 py-8">
                    <div className="rounded-2xl border bg-card p-8 text-center">
                        <p className="text-muted-foreground">
                            No join codes available for this class.
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
                            Join Codes
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Share these codes with students, teachers, and
                            parents to join this class
                        </p>
                    </div>

                    {/* Full-width Tabs */}
                    <div className="w-full rounded-lg border bg-card p-1">
                        <div className="grid grid-cols-3 gap-1">
                            {(["student", "teacher", "parent"] as const).map(
                                (type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedCodeType(type)}
                                        className={cn(
                                            "px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                                            selectedCodeType === type
                                                ? "bg-background shadow-sm"
                                                : "hover:bg-background/50 text-muted-foreground"
                                        )}
                                    >
                                        <span className={codeColors[type]}>
                                            {codeLabels[type]}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Join Code Display */}
                    <div className="rounded-2xl border bg-card p-8 md:p-12">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Code Label */}
                            <p
                                className={cn(
                                    "text-lg md:text-xl uppercase tracking-wider font-semibold",
                                    codeColors[selectedCodeType]
                                )}
                            >
                                {codeLabels[selectedCodeType]} Join Code
                            </p>

                            {/* Code Display */}
                            <div
                                className={cn(
                                    "rounded-2xl border-4 bg-muted/50 px-8 py-6 md:px-16 md:py-12 w-full max-w-2xl",
                                    selectedCodeType === "student" &&
                                        "border-blue-500",
                                    selectedCodeType === "teacher" &&
                                        "border-emerald-500",
                                    selectedCodeType === "parent" &&
                                        "border-amber-500"
                                )}
                            >
                                <p
                                    className="font-bold font-mono tracking-[0.15em] text-center"
                                    style={{
                                        fontSize: "clamp(2rem, 8vw, 6rem)",
                                    }}
                                >
                                    {joinCodes[selectedCodeType]}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button
                                    onClick={() =>
                                        handleCopyJoinCode(selectedCodeType)
                                    }
                                    variant="outline"
                                    size="lg"
                                >
                                    {copied === selectedCodeType ? (
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
                                    onClick={() =>
                                        handleOpenInNewWindow(selectedCodeType)
                                    }
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
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    1
                                </span>
                                <span>
                                    Go to{" "}
                                    <span
                                        className={cn(
                                            "font-mono font-semibold",
                                            codeColors[selectedCodeType]
                                        )}
                                    >
                                        www.classclarus.com/join
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    2
                                </span>
                                <span>
                                    Input the code you see on the screen
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    3
                                </span>
                                <span>
                                    Click the{" "}
                                    <span className="font-semibold">
                                        Join Class
                                    </span>{" "}
                                    button
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    4
                                </span>
                                <span>All done!</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </main>

            {/* Fullscreen Join Code Dialog */}
            {classData && joinCodes && (
                <JoinCodeDialog
                    open={showFullscreen}
                    onOpenChange={setShowFullscreen}
                    className={classData.name}
                    selectedCodeType={selectedCodeType}
                    joinCodes={joinCodes}
                    onCopyJoinCode={handleCopyJoinCode}
                    onOpenInNewWindow={handleOpenInNewWindow}
                />
            )}
        </div>
    );
}

