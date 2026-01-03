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
import { Loader2 } from "lucide-react";
import BlankBackgroundLoader from "@/components/loaders/blank-background-loader";

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

    if (isLoading) {
        return <BlankBackgroundLoader />;
    }

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
