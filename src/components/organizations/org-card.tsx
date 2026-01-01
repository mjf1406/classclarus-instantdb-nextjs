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
import { EditOrgDialog } from "@/components/organizations/edit-org-dialog";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db/db";

// Type for organization data from useQuery
interface OrganizationData {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    memberIds?: string[];
    adminIds?: string[];
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
    classes?: { id: string }[];
}

interface OrgCardProps {
    organization: OrganizationData;
    isOwner?: boolean;
}

export default function OrgCard({ organization, isOwner }: OrgCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showEditDialog, setShowEditDialog] = React.useState(false);

    const {
        id,
        name,
        description,
        icon,
        memberIds,
        adminIds,
        created,
        updated,
        owner,
        classes,
    } = organization;

    const handleDelete = () => {
        db.transact(db.tx.organizations[id].delete());
        setShowDeleteDialog(false);
    };

    // Parse member and admin IDs (they're stored as JSON arrays)
    const members = Array.isArray(memberIds) ? memberIds : [];
    const admins = Array.isArray(adminIds) ? adminIds : [];
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

    return (
        <>
            <Link
                href={`/${id}`}
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
                                        className=""
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
                                    {isOwner && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => {
                                                    e.preventDefault();
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

                        {/* Stats section */}
                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted">
                                        <Users className="size-4 text-muted-foreground mb-1" />
                                        <span className="text-lg font-semibold tabular-nums">
                                            {members.length}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Members
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {members.length === 1
                                        ? "1 member"
                                        : `${members.length} members`}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted">
                                        <ShieldCheck className="size-4 text-muted-foreground mb-1" />
                                        <span className="text-lg font-semibold tabular-nums">
                                            {admins.length}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Admins
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {admins.length === 1
                                        ? "1 admin"
                                        : `${admins.length} admins`}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted">
                                        <GraduationCap className="size-4 text-muted-foreground mb-1" />
                                        <span className="text-lg font-semibold tabular-nums">
                                            {classCount}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Classes
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {classCount === 1
                                        ? "1 class"
                                        : `${classCount} classes`}
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
                                            Created{" "}
                                            {format(createdDate, "PPpp")}
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
            </Link>

            {/* Edit Organization Dialog - Outside Link to prevent navigation on submit */}
            <EditOrgDialog
                organizationId={id}
                initialName={name}
                initialDescription={description}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            {/* Delete Confirmation Dialog - Outside Link to prevent navigation on submit */}
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
            <div className="mt-5 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-18 rounded-lg bg-muted animate-pulse"
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
