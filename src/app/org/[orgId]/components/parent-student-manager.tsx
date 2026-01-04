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
import { cn } from "@/lib/utils";
import type { StatMember } from "./member-list";
import { MemberActionMenu, type MemberRole } from "./member-action-menu";

interface ParentStudentManagerProps {
    parents: StatMember[];
    students: StatMember[];
    organizationId: string;
    adminIds: string[];
    onChange?: () => void;
}

interface ParentWithChildren extends StatMember {
    children?: StatMember[];
}

export function ParentStudentManager({
    parents,
    students,
    organizationId,
    adminIds,
    onChange,
}: ParentStudentManagerProps) {
    const [expandedParents, setExpandedParents] = useState<Set<string>>(
        new Set()
    );
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [removalTarget, setRemovalTarget] = useState<{
        parentId: string;
        studentId: string;
        parentName: string;
        studentName: string;
    } | null>(null);

    // Query to get parent-student relationships and student's classes
    const { data } = db.useQuery({
        $users: {
            $: {
                where: {
                    id: {
                        $in: [...parents.map((p) => p.id), ...students.map((s) => s.id)],
                    },
                },
            },
            children: {},
            studentClasses: {},
        },
    });

    // Build parent with children map
    const parentsWithChildren: ParentWithChildren[] = parents.map((parent) => {
        const parentData = data?.$users?.find((u) => u.id === parent.id);
        const linkedChildrenIds = parentData?.children?.map((c) => c.id) || [];
        const children = students.filter((s) =>
            linkedChildrenIds.includes(s.id)
        );
        return { ...parent, children };
    });

    const toggleParent = (parentId: string) => {
        setExpandedParents((prev) => {
            const next = new Set(prev);
            if (next.has(parentId)) {
                next.delete(parentId);
            } else {
                next.add(parentId);
            }
            return next;
        });
    };

    const handleAddChild = (parentId: string, studentId: string) => {
        // Get the student's classes to add the parent to them
        const studentData = data?.$users?.find((u) => u.id === studentId);
        const studentClassIds = studentData?.studentClasses?.map((c) => c.id) || [];
        
        // Link parent to student AND add parent to all student's classes
        const transactions = [
            db.tx.$users[parentId].link({ children: [studentId] }),
            ...studentClassIds.map((classId) =>
                db.tx.classes[classId].link({ classParents: parentId })
            ),
        ];
        
        db.transact(transactions);
        onChange?.();
    };

    const handleRemoveChild = (
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

    const confirmRemoveChild = () => {
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

    const getAvailableStudents = (parent: ParentWithChildren) => {
        const linkedIds = parent.children?.map((c) => c.id) || [];
        return students.filter((s) => !linkedIds.includes(s.id));
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

    if (parents.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground/60 italic">
                    No parents to manage
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {parentsWithChildren.map((parent) => {
                    const isExpanded = expandedParents.has(parent.id);
                    const availableStudents = getAvailableStudents(parent);
                    const children = parent.children || [];
                    const displayName = getUserDisplayName(parent);
                    const initials = getUserInitials(parent);
                    const avatarUrl =
                        parent.imageURL || parent.avatarURL || undefined;

                    const isAdmin = adminIds.includes(parent.id);

                    return (
                        <Collapsible
                            key={parent.id}
                            open={isExpanded}
                            onOpenChange={() => toggleParent(parent.id)}
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
                                                {parent.email && parent.firstName && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {parent.email}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Users className="size-3" />
                                                    {children.length} child
                                                    {children.length !== 1
                                                        ? "ren"
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
                                        <MemberActionMenu
                                            userId={parent.id}
                                            userName={displayName}
                                            currentRole="parent"
                                            isAdmin={isAdmin}
                                            organizationId={organizationId}
                                            onRoleChange={onChange}
                                            onAdminToggle={onChange}
                                            onKick={onChange}
                                        />
                                    </div>
                                </div>

                                <CollapsibleContent>
                                    <div className="border-t px-3 py-3 space-y-3">
                                        {/* Children list */}
                                        {children.length > 0 && (
                                            <div className="space-y-2">
                                                {children.map((child) => {
                                                    const childDisplayName =
                                                        getUserDisplayName(
                                                            child
                                                        );
                                                    const childInitials =
                                                        getUserInitials(child);
                                                    const childAvatarUrl =
                                                        child.imageURL ||
                                                        child.avatarURL ||
                                                        undefined;

                                                    return (
                                                        <div
                                                            key={child.id}
                                                            className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
                                                        >
                                                            <Avatar className="size-8">
                                                                {childAvatarUrl ? (
                                                                    <AvatarImage
                                                                        src={
                                                                            childAvatarUrl
                                                                        }
                                                                        alt={
                                                                            childDisplayName
                                                                        }
                                                                    />
                                                                ) : null}
                                                                <AvatarFallback className="text-xs">
                                                                    {
                                                                        childInitials
                                                                    }
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium truncate">
                                                                    {
                                                                        childDisplayName
                                                                    }
                                                                </p>
                                                                {child.email && (
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {
                                                                            child.email
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() =>
                                                                    handleRemoveChild(
                                                                        parent.id,
                                                                        child.id,
                                                                        displayName,
                                                                        childDisplayName
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

                                        {/* Add child selector */}
                                        {availableStudents.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    onValueChange={(value) =>
                                                        handleAddChild(
                                                            parent.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <Plus className="size-4 mr-2" />
                                                        <SelectValue placeholder="Add child" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableStudents.map(
                                                            (student) => {
                                                                const studentDisplayName =
                                                                    getUserDisplayName(
                                                                        student
                                                                    );
                                                                return (
                                                                    <SelectItem
                                                                        key={
                                                                            student.id
                                                                        }
                                                                        value={
                                                                            student.id
                                                                        }
                                                                    >
                                                                        {
                                                                            studentDisplayName
                                                                        }
                                                                    </SelectItem>
                                                                );
                                                            }
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {children.length === 0 &&
                                            availableStudents.length === 0 && (
                                                <p className="text-xs text-muted-foreground/60 italic text-center py-2">
                                                    No students available to
                                                    link
                                                </p>
                                            )}
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Remove child confirmation dialog */}
            <AlertDialog
                open={showRemoveDialog}
                onOpenChange={setShowRemoveDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Child</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unlink{" "}
                            <span className="font-semibold text-foreground">
                                {removalTarget?.studentName}
                            </span>{" "}
                            from{" "}
                            <span className="font-semibold text-foreground">
                                {removalTarget?.parentName}
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
                            onClick={confirmRemoveChild}
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
