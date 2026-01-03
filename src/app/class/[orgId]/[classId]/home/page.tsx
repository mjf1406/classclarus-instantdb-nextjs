/** @format */

"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import { escapeHtml } from "@/lib/utils";
import { ClassHero } from "./components/class-hero";
import { ClassStats } from "./components/class-stats";
import { JoinCodeDialog } from "./components/join-code-dialog";
import { ClassErrorState } from "./components/class-error-state";
import { ClassNotFoundState } from "./components/class-not-found-state";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ClassQueryShape,
    ClassQueryResult,
    JoinCodeType,
    codeLabels,
} from "./types";

interface ClassHomePageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function ClassHomePage({ params }: ClassHomePageProps) {
    const { orgId, classId } = use(params);
    const router = useRouter();
    const { user } = useAuthContext();
    const [copied, setCopied] = useState<JoinCodeType | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [selectedCodeType, setSelectedCodeType] =
        useState<JoinCodeType>("student");
    const [isRevealed, setIsRevealed] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Query the class with related data
    const { data, isLoading, error } = db.useQuery({
        classes: {
            $: { where: { id: classId } },
            owner: {},
            classAdmins: {},
            classTeachers: {},
            classStudents: {},
            classParents: {},
            joinCodeEntity: {},
            organization: {
                owner: {},
                admins: {},
            },
        },
    });

    const classData = data?.classes?.[0] as ClassQueryResult | undefined;
    const organization = classData?.organization;

    // Determine if user can edit this class
    const canEdit = (() => {
        if (!user?.id || !classData) return false;

        // Class owner
        if (classData.owner?.id === user.id) return true;

        // Class admins
        const classAdmins = (classData.classAdmins ?? []).map(
            (admin: any) => admin.id ?? admin
        );
        if (classAdmins.includes(user.id)) return true;

        // Organization owner
        if (organization?.owner?.id === user.id) return true;

        // Organization admins
        const orgAdmins = (organization?.admins ?? []).map(
            (admin: any) => admin.id ?? admin
        );
        if (orgAdmins.includes(user.id)) return true;

        return false;
    })();

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

    const handleRevealCode = () => {
        setIsRevealed(true);
    };

    const handleOpenFullscreen = () => {
        if (!joinCodes) return;
        setShowFullscreen(true);
    };

    const handleDelete = () => {
        if (!classData) return;
        db.transact(db.tx.classes[classData.id].delete());
        setShowDeleteDialog(false);
        router.push(`/org/${orgId}`);
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

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* Class hero section */}
                <ClassHero
                    classData={classData}
                    canEdit={canEdit}
                    onEdit={() => setShowEditDialog(true)}
                    onDelete={() => setShowDeleteDialog(true)}
                />

                {/* Stats cards with collapsible member lists */}
                <ClassStats classData={classData} />
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

            {/* Edit Class Dialog */}
            {classData && (
                <EditClassDialog
                    classId={classData.id}
                    initialName={classData.name}
                    initialDescription={classData.description}
                    initialIcon={classData.icon}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {classData && (
                <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Class</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-foreground">
                                    {classData.name}
                                </span>
                                ? This action cannot be undone. All data
                                associated with this class will be permanently
                                removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
