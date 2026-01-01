/** @format */

"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    Users,
    ShieldCheck,
    Calendar,
    Clock,
    GraduationCap,
    Crown,
    MoreVertical,
    Pencil,
    Trash2,
    ChevronDown,
    Copy,
    Check,
    Link2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EditOrgDialog } from "@/components/organizations/edit-org-dialog";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db/db";

// Type for organization data from useQuery
interface OrganizationData {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    joinCode?: string;
    adminIds?: string[]; // Deprecated - kept for backward compatibility during migration
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
    orgStudents?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    orgTeachers?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    orgParents?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    admins?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    classes?: { id: string; name: string; icon?: string }[];
}

interface OrgCardProps {
    organization: OrganizationData;
    isOwner?: boolean;
}

export default function OrgCard({ organization, isOwner }: OrgCardProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showEditDialog, setShowEditDialog] = React.useState(false);
    const [isClassesOpen, setIsClassesOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [copiedLink, setCopiedLink] = React.useState(false);
    const [isRevealed, setIsRevealed] = React.useState(false);

    const {
        id,
        name,
        description,
        icon,
        joinCode,
        adminIds, // Deprecated - fallback during migration
        created,
        updated,
        owner,
        orgStudents: linkedStudents,
        orgTeachers: linkedTeachers,
        orgParents: linkedParents,
        admins: linkedAdmins,
        classes,
    } = organization;

    const handleDelete = () => {
        db.transact(db.tx.organizations[id].delete());
        setShowDeleteDialog(false);
    };

    const handleCopyJoinCode = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!joinCode) return;
        try {
            await navigator.clipboard.writeText(joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    const handleCopyJoinLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!joinCode) return;
        try {
            const link = `app.classclarus.com/join?code=${joinCode}`;
            await navigator.clipboard.writeText(link);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error("Failed to copy join link:", err);
        }
    };

    const handleRevealCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRevealed(true);
    };

    // Use linked role arrays if available
    const students = linkedStudents ?? [];
    const teachers = linkedTeachers ?? [];
    const parents = linkedParents ?? [];
    const admins = linkedAdmins ?? (Array.isArray(adminIds) ? adminIds : []);
    const studentCount = Array.isArray(linkedStudents)
        ? linkedStudents.length
        : 0;
    const teacherCount = Array.isArray(linkedTeachers)
        ? linkedTeachers.length
        : 0;
    const parentCount = Array.isArray(linkedParents) ? linkedParents.length : 0;
    const adminCount = Array.isArray(linkedAdmins)
        ? linkedAdmins.length
        : Array.isArray(adminIds)
        ? adminIds.length
        : 0;
    const classCount = classes?.length ?? 0;

    // Get initials for fallback avatar
    const getInitials = (orgName: string) => {
        return orgName
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

    const handleCardClick = (e: React.MouseEvent) => {
        // Only navigate if the click target is not an interactive element
        const target = e.target as HTMLElement;
        const isInteractive =
            target.closest("button") ||
            target.closest("a") ||
            target.closest('[role="button"]');
        if (!isInteractive) {
            router.push(`/${id}`);
        }
    };

    return (
        <>
            <article
                onClick={handleCardClick}
                className={cn(
                    "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 cursor-pointer",
                    "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                    "dark:hover:shadow-primary/10",
                    "hover:-translate-y-0.5"
                )}
            >
                {/* Gradient accent bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Card content */}
                <div className="p-5">
                    {/* Header section */}
                    <div className="flex items-start gap-4">
                        {/* Organization icon/avatar */}
                        <Avatar className="size-14 rounded-xl border-2 border-border shadow-sm">
                            {icon ? (
                                <AvatarImage
                                    src={icon}
                                    alt={`${name} logo`}
                                    className="object-cover"
                                />
                            ) : null}
                            <AvatarFallback className="rounded-xl bg-linear-to-br from-primary/20 to-primary/5 text-lg font-semibold text-primary">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Title and description */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {name}
                                </h3>
                                {isOwner && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="flex items-center">
                                                <Crown className="size-4 text-amber-500" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            You own this organization
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => e.stopPropagation()}
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
                                        e.stopPropagation();
                                        setShowEditDialog(true);
                                    }}
                                >
                                    <Pencil className="size-4" />
                                    Edit
                                </DropdownMenuItem>
                                {isOwner && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDeleteDialog(true);
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                            Delete Organization
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Join code section */}
                    {joinCode && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={(e) => {
                                                if (!isRevealed) {
                                                    handleRevealCode(e);
                                                } else {
                                                    handleCopyJoinCode(e);
                                                }
                                            }}
                                            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted flex-1 justify-between group/code relative overflow-hidden"
                                        >
                                            <span className="text-muted-foreground">
                                                Join Code
                                            </span>
                                            <span className="flex items-center gap-2 font-mono font-semibold relative">
                                                <span
                                                    className={cn(
                                                        "transition-all duration-500 ease-out",
                                                        !isRevealed &&
                                                            "blur-sm select-none"
                                                    )}
                                                >
                                                    {joinCode}
                                                </span>
                                                {!isRevealed && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                                                        Click to reveal
                                                    </span>
                                                )}
                                                {isRevealed &&
                                                    (copied ? (
                                                        <Check className="size-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="size-4 text-muted-foreground group-hover/code:text-foreground transition-colors" />
                                                    ))}
                                            </span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {!isRevealed
                                            ? "Click to reveal code"
                                            : copied
                                            ? "Copied!"
                                            : "Click to copy join code"}
                                    </TooltipContent>
                                </Tooltip>
                                {isRevealed && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleCopyJoinLink}
                                                className="h-9 w-9"
                                            >
                                                {copiedLink ? (
                                                    <Check className="size-4 text-green-500" />
                                                ) : (
                                                    <Link2 className="size-4" />
                                                )}
                                                <span className="sr-only">
                                                    Copy join link
                                                </span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {copiedLink
                                                ? "Link copied!"
                                                : "Copy join link"}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats section */}
                    <div className="mt-5 grid grid-cols-3 gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-2 transition-colors hover:bg-muted">
                                    <Users className="size-4 text-blue-500 mb-1" />
                                    <span className="text-base font-semibold tabular-nums">
                                        {studentCount}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Students
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {studentCount === 1
                                    ? "1 student"
                                    : `${studentCount} students`}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-2 transition-colors hover:bg-muted">
                                    <GraduationCap className="size-4 text-emerald-500 mb-1" />
                                    <span className="text-base font-semibold tabular-nums">
                                        {teacherCount}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Teachers
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {teacherCount === 1
                                    ? "1 teacher"
                                    : `${teacherCount} teachers`}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-2 transition-colors hover:bg-muted">
                                    <ShieldCheck className="size-4 text-amber-500 mb-1" />
                                    <span className="text-base font-semibold tabular-nums">
                                        {parentCount}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Parents
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {parentCount === 1
                                    ? "1 parent"
                                    : `${parentCount} parents`}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Classes collapsible section */}
                    <Collapsible
                        className="mt-3"
                        open={isClassesOpen}
                        onOpenChange={setIsClassesOpen}
                    >
                        <CollapsibleTrigger asChild>
                            <button
                                className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted group/classes"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsClassesOpen(!isClassesOpen);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="size-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Classes
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
                                        {classCount}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "size-4 text-muted-foreground transition-transform duration-200",
                                        isClassesOpen && "rotate-180"
                                    )}
                                />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                            <div className="mt-2 space-y-1.5 pl-1">
                                {classes && classes.length > 0 ? (
                                    classes.map((cls) => (
                                        <Link
                                            key={cls.id}
                                            href={`/${id}/${cls.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                        >
                                            <Avatar className="size-5 rounded-md">
                                                {cls.icon ? (
                                                    <AvatarImage
                                                        src={cls.icon}
                                                        alt={`${cls.name} icon`}
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                                <AvatarFallback className="rounded-md bg-primary/10 text-[10px] font-medium text-primary">
                                                    {cls.name
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">
                                                {cls.name}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="px-3 py-2 text-sm italic text-muted-foreground/60">
                                        No classes yet
                                    </p>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

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
                                        {owner.email?.[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground truncate max-w-30">
                                    {owner.firstName && owner.lastName
                                        ? `${owner.firstName} ${owner.lastName}`
                                        : owner.email ?? "Guest"}
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
                                                {/* {format(
                                                        createdDate,
                                                        "MMM d, yyyy"
                                                    )} */}
                                                {createdDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Created {format(createdDate, "PPpp")}
                                        {/* {createdDate.toLocaleString()} */}
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

            {/* Edit Organization Dialog */}
            <EditOrgDialog
                organizationId={id}
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
                        <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {name}
                            </span>
                            ? This action cannot be undone. All classes and data
                            associated with this organization will be
                            permanently removed.
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
export function OrgCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-full rounded bg-muted animate-pulse" />
                </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-18 rounded-lg bg-muted animate-pulse"
                    />
                ))}
            </div>
            <div className="mt-3 h-12 rounded-lg bg-muted animate-pulse" />
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
