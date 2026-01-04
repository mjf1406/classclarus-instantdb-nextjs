/** @format */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/db/db";
import type { StatMember } from "@/app/org/[orgId]/components/member-list";
import { ClassMemberActionMenu } from "./class-member-action-menu";

interface ClassStudentParentManagerProps {
    students: StatMember[];
    parents: StatMember[];
    classId: string;
    adminIds: string[];
    onChange?: () => void;
}

interface StudentWithParents extends StatMember {
    parents?: StatMember[];
}

export function ClassStudentParentManager({
    students,
    parents,
    classId,
    adminIds,
    onChange,
}: ClassStudentParentManagerProps) {
    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
        new Set()
    );
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [removalTarget, setRemovalTarget] = useState<{
        parentId: string;
        studentId: string;
        parentName: string;
        studentName: string;
    } | null>(null);

    // Query to get student-parent relationships
    const { data } = db.useQuery({
        $users: {
            $: {
                where: {
                    id: {
                        $in: students.map((s) => s.id),
                    },
                },
            },
            parents: {},
        },
    });

    // Build student with parents map
    const studentsWithParents: StudentWithParents[] = students.map((student) => {
        const studentData = data?.$users?.find((u) => u.id === student.id);
        const linkedParentIds = studentData?.parents?.map((p) => p.id) || [];
        const studentParents = parents.filter((p) =>
            linkedParentIds.includes(p.id)
        );
        return { ...student, parents: studentParents };
    });

    const toggleStudent = (studentId: string) => {
        setExpandedStudents((prev) => {
            const next = new Set(prev);
            if (next.has(studentId)) {
                next.delete(studentId);
            } else {
                next.add(studentId);
            }
            return next;
        });
    };

    const handleAddParent = (studentId: string, parentId: string) => {
        // Link parent to student AND ensure parent is added to the class
        db.transact([
            db.tx.$users[parentId].link({ children: [studentId] }),
            db.tx.classes[classId].link({ classParents: parentId }),
        ]);
        onChange?.();
    };

    const handleRemoveParent = (
        parentId: string,
        studentId: string,
        parentName: string,
        studentName: string
    ) => {
        setRemovalTarget({
            parentId,
            studentId,
            parentName,
            studentName,
        });
        setShowRemoveDialog(true);
    };

    const confirmRemoveParent = () => {
        if (!removalTarget) return;
        db.transact(
            db.tx.$users[removalTarget.parentId].unlink({
                children: [removalTarget.studentId],
            })
        );
        setShowRemoveDialog(false);
        setRemovalTarget(null);
        onChange?.();
    };

    const getAvailableParents = (student: StudentWithParents) => {
        const linkedIds = student.parents?.map((p) => p.id) || [];
        return parents.filter((p) => !linkedIds.includes(p.id));
    };

    const getUserDisplayName = (member: StatMember) => {
        if (member.firstName && member.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }
        if (member.firstName) return member.firstName;
        if (member.email) return member.email;
        return "Unknown";
    };

    const getUserInitials = (member: StatMember) => {
        if (member.firstName && member.lastName) {
            return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
        }
        if (member.firstName) return member.firstName[0].toUpperCase();
        if (member.email) return member.email[0].toUpperCase();
        return "?";
    };

    if (students.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground/60 italic">
                    No students to manage
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {studentsWithParents.map((student) => {
                    const isExpanded = expandedStudents.has(student.id);
                    const availableParents = getAvailableParents(student);
                    const studentParents = student.parents || [];
                    const displayName = getUserDisplayName(student);
                    const initials = getUserInitials(student);
                    const avatarUrl =
                        student.imageURL || student.avatarURL || undefined;

                    const isAdmin = adminIds.includes(student.id);

                    return (
                        <Collapsible
                            key={student.id}
                            open={isExpanded}
                            onOpenChange={() => toggleStudent(student.id)}
                        >
                            <div className="rounded-lg border bg-card">
                                <div className="flex items-center gap-2 p-3">
                                    <CollapsibleTrigger asChild>
                                        <button className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-muted/50 transition-colors rounded-lg -m-1 p-1">
                                            <Avatar className="size-10">
                                                {avatarUrl ? (
                                                    <AvatarImage
                                                        src={avatarUrl}
                                                        alt={displayName}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-sm font-medium">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">
                                                    {displayName}
                                                </p>
                                                {student.email && student.firstName && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {student.email}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Users className="size-3" />
                                                    {studentParents.length} parent
                                                    {studentParents.length !== 1
                                                        ? "s"
                                                        : ""}
                                                </p>
                                            </div>
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleTrigger asChild>
                                        <button className="h-8 w-8 flex items-center justify-center shrink-0 hover:bg-muted/50 transition-colors rounded-md">
                                            {isExpanded ? (
                                                <ChevronUp className="size-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="size-4 text-muted-foreground" />
                                            )}
                                        </button>
                                    </CollapsibleTrigger>
                                    <div className="shrink-0">
                                        <ClassMemberActionMenu
                                            userId={student.id}
                                            userName={displayName}
                                            currentRole="student"
                                            isAdmin={isAdmin}
                                            classId={classId}
                                            onRoleChange={onChange}
                                            onAdminToggle={onChange}
                                            onKick={onChange}
                                        />
                                    </div>
                                </div>

                                <CollapsibleContent>
                                    <div className="border-t px-3 py-3 space-y-3">
                                        {/* Parents list */}
                                        {studentParents.length > 0 && (
                                            <div className="space-y-2">
                                                {studentParents.map((parent) => {
                                                    const parentDisplayName =
                                                        getUserDisplayName(parent);
                                                    const parentInitials =
                                                        getUserInitials(parent);
                                                    const parentAvatarUrl =
                                                        parent.imageURL ||
                                                        parent.avatarURL ||
                                                        undefined;

                                                    return (
                                                        <div
                                                            key={parent.id}
                                                            className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
                                                        >
                                                            <Avatar className="size-8">
                                                                {parentAvatarUrl ? (
                                                                    <AvatarImage
                                                                        src={parentAvatarUrl}
                                                                        alt={parentDisplayName}
                                                                    />
                                                                ) : null}
                                                                <AvatarFallback className="text-xs">
                                                                    {parentInitials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium truncate">
                                                                    {parentDisplayName}
                                                                </p>
                                                                {parent.email && (
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {parent.email}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() =>
                                                                    handleRemoveParent(
                                                                        parent.id,
                                                                        student.id,
                                                                        parentDisplayName,
                                                                        displayName
                                                                    )
                                                                }
                                                            >
                                                                <UserMinus className="size-4" />
                                                                <span className="sr-only">
                                                                    Remove
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Add parent selector */}
                                        {availableParents.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    onValueChange={(value) =>
                                                        handleAddParent(
                                                            student.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <Plus className="size-4 mr-2" />
                                                        <SelectValue placeholder="Add parent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableParents.map(
                                                            (parent) => {
                                                                const parentDisplayName =
                                                                    getUserDisplayName(parent);
                                                                return (
                                                                    <SelectItem
                                                                        key={parent.id}
                                                                        value={parent.id}
                                                                    >
                                                                        {parentDisplayName}
                                                                    </SelectItem>
                                                                );
                                                            }
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {studentParents.length === 0 &&
                                            availableParents.length === 0 && (
                                                <p className="text-xs text-muted-foreground/60 italic text-center py-2">
                                                    No parents available to link
                                                </p>
                                            )}
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Remove parent confirmation dialog */}
            <AlertDialog
                open={showRemoveDialog}
                onOpenChange={setShowRemoveDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Parent</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unlink{" "}
                            <span className="font-semibold text-foreground">
                                {removalTarget?.parentName}
                            </span>{" "}
                            from{" "}
                            <span className="font-semibold text-foreground">
                                {removalTarget?.studentName}
                            </span>
                            ? This will remove the parent-student relationship.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setRemovalTarget(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveParent}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

