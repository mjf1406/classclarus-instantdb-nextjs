/** @format */

"use client";

import { useState } from "react";
import {
    MoreVertical,
    UserMinus,
    Shield,
    ShieldOff,
    GraduationCap,
    Users,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { db } from "@/lib/db/db";

export type ClassMemberRole = "student" | "parent" | "teacher";

interface ClassMemberActionMenuProps {
    userId: string;
    userName: string;
    currentRole: ClassMemberRole;
    isAdmin: boolean;
    classId: string;
    onRoleChange?: () => void;
    onAdminToggle?: () => void;
    onKick?: () => void;
}

export function ClassMemberActionMenu({
    userId,
    userName,
    currentRole,
    isAdmin,
    classId,
    onRoleChange,
    onAdminToggle,
    onKick,
}: ClassMemberActionMenuProps) {
    const [showKickDialog, setShowKickDialog] = useState(false);
    const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
    const [newRole, setNewRole] = useState<ClassMemberRole | null>(null);

    const handleKick = () => {
        const unlinkMap: Record<string, string[]> = {};
        if (currentRole === "student") {
            unlinkMap.classStudents = [userId];
        } else if (currentRole === "parent") {
            unlinkMap.classParents = [userId];
        } else if (currentRole === "teacher") {
            unlinkMap.classTeachers = [userId];
        }

        // Also unlink from admins if they are an admin
        if (isAdmin) {
            unlinkMap.classAdmins = [userId];
        }

        db.transact(db.tx.classes[classId].unlink(unlinkMap));
        setShowKickDialog(false);
        onKick?.();
    };

    const handleRoleChange = (role: ClassMemberRole) => {
        setNewRole(role);
        setShowRoleChangeDialog(true);
    };

    const confirmRoleChange = () => {
        if (!newRole) return;

        const unlinkMap: Record<string, string[]> = {};
        const linkMap: Record<string, string[]> = {};

        // Unlink from current role
        if (currentRole === "student") {
            unlinkMap.classStudents = [userId];
        } else if (currentRole === "parent") {
            unlinkMap.classParents = [userId];
        } else if (currentRole === "teacher") {
            unlinkMap.classTeachers = [userId];
        }

        // Link to new role
        if (newRole === "student") {
            linkMap.classStudents = [userId];
        } else if (newRole === "parent") {
            linkMap.classParents = [userId];
        } else if (newRole === "teacher") {
            linkMap.classTeachers = [userId];
        }

        const transactions = [];
        if (Object.keys(unlinkMap).length > 0) {
            transactions.push(db.tx.classes[classId].unlink(unlinkMap));
        }
        if (Object.keys(linkMap).length > 0) {
            transactions.push(db.tx.classes[classId].link(linkMap));
        }

        db.transact(transactions);
        setShowRoleChangeDialog(false);
        setNewRole(null);
        onRoleChange?.();
    };

    const handleAdminToggle = () => {
        if (isAdmin) {
            db.transact(
                db.tx.classes[classId].unlink({ classAdmins: [userId] })
            );
        } else {
            db.transact(db.tx.classes[classId].link({ classAdmins: [userId] }));
        }
        onAdminToggle?.();
    };

    const getRoleLabel = (role: ClassMemberRole) => {
        switch (role) {
            case "student":
                return "Student";
            case "parent":
                return "Parent";
            case "teacher":
                return "Teacher";
        }
    };

    const getRoleIcon = (role: ClassMemberRole) => {
        switch (role) {
            case "student":
                return Users;
            case "parent":
                return Users;
            case "teacher":
                return GraduationCap;
        }
    };

    const availableRoles: ClassMemberRole[] = ["student", "parent", "teacher"];

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="size-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Change Role */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <ArrowRight className="size-4" />
                            Change Role
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {availableRoles
                                .filter((role) => role !== currentRole)
                                .map((role) => {
                                    const Icon = getRoleIcon(role);
                                    return (
                                        <DropdownMenuItem
                                            key={role}
                                            onClick={() =>
                                                handleRoleChange(role)
                                            }
                                        >
                                            <Icon className="size-4" />
                                            {getRoleLabel(role)}
                                        </DropdownMenuItem>
                                    );
                                })}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Grant/Revoke Admin */}
                    <DropdownMenuItem onClick={handleAdminToggle}>
                        {isAdmin ? (
                            <>
                                <ShieldOff className="size-4" />
                                Revoke Admin
                            </>
                        ) : (
                            <>
                                <Shield className="size-4" />
                                Grant Admin
                            </>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Kick */}
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowKickDialog(true)}
                    >
                        <UserMinus className="size-4" />
                        Kick from Class
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Kick Confirmation Dialog */}
            <AlertDialog
                open={showKickDialog}
                onOpenChange={setShowKickDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kick Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <span className="font-semibold text-foreground">
                                {userName}
                            </span>{" "}
                            from this class? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleKick}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Kick
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Role Change Confirmation Dialog */}
            <AlertDialog
                open={showRoleChangeDialog}
                onOpenChange={setShowRoleChangeDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change{" "}
                            <span className="font-semibold text-foreground">
                                {userName}
                            </span>
                            &apos;s role from{" "}
                            <span className="font-semibold text-foreground">
                                {getRoleLabel(currentRole)}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-foreground">
                                {newRole ? getRoleLabel(newRole) : ""}
                            </span>
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setNewRole(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>
                            Change Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

