/** @format */

"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    Users,
    Calendar,
    Clock,
    Crown,
    MoreVertical,
    Pencil,
    Trash2,
    GraduationCap,
    Copy,
    Check,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";

// Type for class data from useQuery
interface ClassData {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    joinCode: string;
    organizationId?: string;
    students?: string[];
    admins?: string[];
    teachers?: string[];
    created: Date | string | number;
    updated: Date | string | number;
    owner?: {
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    };
    organization?: {
        id: string;
        name: string;
        adminIds?: string[];
        owner?: {
            id: string;
        };
    };
}

interface ClassCardProps {
    classData: ClassData;
    canEdit?: boolean;
}

export default function ClassCard({ classData, canEdit }: ClassCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showEditDialog, setShowEditDialog] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const {
        id,
        name,
        description,
        icon,
        joinCode,
        organizationId,
        students,
        admins,
        teachers,
        created,
        updated,
        owner,
    } = classData;

    const handleDelete = () => {
        db.transact(db.tx.classes[id].delete());
        setShowDeleteDialog(false);
    };

    const handleCopyJoinCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    // Parse arrays (they're stored as JSON)
    const studentList = Array.isArray(students) ? students : [];
    const adminList = Array.isArray(admins) ? admins : [];
    const teacherList = Array.isArray(teachers) ? teachers : [];

    // Get initials for fallback avatar
    const getInitials = (className: string) => {
        return className
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper to parse dates from various formats
    const parseDate = (
        value: Date | string | number | undefined | null
    ): Date | null => {
        if (!value) return null;
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Format dates
    const createdDate = parseDate(created);
    const updatedDate = parseDate(updated);

    return (
        <>
            <Link
                href={`/${organizationId}/${id}`}
                className="group block"
            >
                <article
                    className={cn(
                        "relative overflow-hidden rounded-xl border bg-card transition-all duration-300",
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                        "dark:hover:shadow-primary/10",
                        "hover:-translate-y-0.5"
                    )}
                >
                    {/* Gradient accent bar */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 via-violet-400 to-violet-300 opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Card content */}
                    <div className="p-5">
                        {/* Header section */}
                        <div className="flex items-start gap-4">
                            {/* Class icon/avatar */}
                            <Avatar className="size-14 rounded-xl border-2 border-border shadow-sm">
                                {icon ? (
                                    <AvatarImage
                                        src={icon}
                                        alt={`${name} icon`}
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback className="rounded-xl bg-linear-to-br from-violet-500/20 to-violet-500/5 text-lg font-semibold text-violet-600 dark:text-violet-400">
                                    {getInitials(name)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Title and description */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {name}
                                    </h3>
                                    {canEdit && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="flex items-center">
                                                    <Crown className="size-4 text-amber-500" />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                You can manage this class
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                {description ? (
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-sm italic text-muted-foreground/60">
                                        No description
                                    </p>
                                )}
                            </div>

                            {/* Actions menu */}
                            {canEdit && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <MoreVertical className="size-4" />
                                            <span className="sr-only">
                                                More options
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setShowEditDialog(true);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setShowDeleteDialog(true);
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                            Delete Class
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Join code section */}
                        <div className="mt-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleCopyJoinCode}
                                        className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted w-full justify-between group/code"
                                    >
                                        <span className="text-muted-foreground">
                                            Join Code
                                        </span>
                                        <span className="flex items-center gap-2 font-mono font-semibold">
                                            {joinCode}
                                            {copied ? (
                                                <Check className="size-4 text-green-500" />
                                            ) : (
                                                <Copy className="size-4 text-muted-foreground group-hover/code:text-foreground transition-colors" />
                                            )}
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {copied
                                        ? "Copied!"
                                        : "Click to copy join code"}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Stats section */}
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-2 transition-colors hover:bg-muted">
                                        <Users className="size-4 text-blue-500 mb-1" />
                                        <span className="text-base font-semibold tabular-nums">
                                            {studentList.length}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Students
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {studentList.length === 1
                                        ? "1 student"
                                        : `${studentList.length} students`}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-2 transition-colors hover:bg-muted">
                                        <GraduationCap className="size-4 text-emerald-500 mb-1" />
                                        <span className="text-base font-semibold tabular-nums">
                                            {teacherList.length}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Teachers
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {teacherList.length === 1
                                        ? "1 teacher"
                                        : `${teacherList.length} teachers`}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-2 transition-colors hover:bg-muted">
                                        <ShieldCheck className="size-4 text-violet-500 mb-1" />
                                        <span className="text-base font-semibold tabular-nums">
                                            {adminList.length}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Admins
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {adminList.length === 1
                                        ? "1 admin"
                                        : `${adminList.length} admins`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Footer section with dates and owner */}
                        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                            {/* Owner info */}
                            {owner && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-6">
                                        {owner.imageURL || owner.avatarURL ? (
                                            <AvatarImage
                                                src={
                                                    owner.imageURL ??
                                                    owner.avatarURL ??
                                                    undefined
                                                }
                                                alt={owner.email ?? "Owner"}
                                            />
                                        ) : null}
                                        <AvatarFallback className="text-xs">
                                            {owner.email?.[0]?.toUpperCase() ??
                                                "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground truncate max-w-24">
                                        {owner.firstName && owner.lastName
                                            ? `${owner.firstName} ${owner.lastName}`
                                            : owner.email ?? "?"}
                                    </span>
                                </div>
                            )}

                            {/* Date info */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {createdDate && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                <span>
                                                    {createdDate.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Created{" "}
                                            {format(createdDate, "PPpp")}
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                {updatedDate &&
                                    updatedDate.getTime() !==
                                        createdDate?.getTime() && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    <span>
                                                        {formatDistanceToNow(
                                                            updatedDate,
                                                            {
                                                                addSuffix: true,
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Last updated{" "}
                                                {format(updatedDate, "PPpp")}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                            </div>
                        </div>
                    </div>
                </article>
            </Link>

            {/* Edit Class Dialog */}
            <EditClassDialog
                classId={id}
                initialName={name}
                initialDescription={description}
                initialIcon={icon}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            {/* Delete Confirmation Dialog */}
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
                                {name}
                            </span>
                            ? This action cannot be undone. All data associated
                            with this class will be permanently removed.
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
        </>
    );
}

// Loading skeleton for the card
export function ClassCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-full rounded bg-muted animate-pulse" />
                </div>
            </div>
            <div className="mt-4 h-10 rounded-lg bg-muted animate-pulse" />
            <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-16 rounded-lg bg-muted animate-pulse"
                    />
                ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
        </div>
    );
}
