/** @format */

"use client";

import { use } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
    ArrowLeft,
    Building2,
    Calendar,
    Clock,
    Crown,
    Edit,
    GraduationCap,
    MoreVertical,
    Settings,
    ShieldCheck,
    Trash2,
    Users,
} from "lucide-react";
import ClassList from "@/components/classes/class-list";

import { db } from "@/lib/db/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OrgPageProps {
    params: Promise<{ orgId: string }>;
}

export default function OrgPage({ params }: OrgPageProps) {
    const { orgId } = use(params);
    const { user, isLoading: isUserLoading } = db.useAuth();

    // Query the organization with related data
    const { data, isLoading, error } = db.useQuery({
        organizations: {
            $: { where: { id: orgId } },
            owner: {},
            orgStudents: {},
            orgTeachers: {},
            orgParents: {},
            admins: {},
        },
    });

    const organization = data?.organizations?.[0];
    const isOwner = user?.id === organization?.owner?.id;

    // Loading state
    if (isLoading || isUserLoading) {
        return <OrgPageSkeleton />;
    }

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
                    <Link href="/">
                        <Button
                            variant="outline"
                            className="mt-4"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Organizations
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Not found state
    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Empty className="border bg-card rounded-xl p-8 max-w-md">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2 className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>Organization not found</EmptyTitle>
                        <EmptyDescription>
                            The organization you&apos;re looking for
                            doesn&apos;t exist or you don&apos;t have access to
                            it.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link href="/">
                            <Button>
                                <ArrowLeft className="size-4" />
                                Back to Organizations
                            </Button>
                        </Link>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            {/* Header with back button and actions */}
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Back to Organizations</span>
                    </Link>

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                >
                                    <MoreVertical className="size-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Edit className="size-4" />
                                    Edit organization
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="size-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="size-4" />
                                    Delete organization
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* Organization hero section */}
                <OrgHero
                    organization={organization}
                    isOwner={isOwner}
                />

                {/* Stats cards */}
                <OrgStats organization={organization} />

                {/* Classes section */}
                <ClassList organizationId={organization.id} />
            </main>
        </div>
    );
}

// Organization hero component
function OrgHero({
    organization,
    isOwner,
}: {
    organization: NonNullable<ReturnType<typeof useOrgData>>;
    isOwner: boolean;
}) {
    const { name, description, icon, owner, created, updated } = organization;

    const getInitials = (orgName: string) => {
        return orgName
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const parseDate = (
        value: Date | string | number | undefined | null
    ): Date | null => {
        if (!value) return null;
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const createdDate = parseDate(created);
    const updatedDate = parseDate(updated);

    return (
        <section className="mb-8">
            <div className="rounded-2xl border bg-card p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    {/* Organization icon */}
                    <Avatar className="size-24 rounded-2xl border-2 border-border shadow-lg md:size-32">
                        {icon ? (
                            <AvatarImage
                                src={icon}
                                alt={`${name} logo`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-3xl font-bold text-primary md:text-4xl">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Organization info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                    {name}
                                </h1>
                                {isOwner && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="flex items-center rounded-full bg-amber-500/10 px-2 py-1">
                                                <Crown className="size-4 text-amber-500" />
                                                <span className="ml-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                    Owner
                                                </span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            You own this organization
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                            {description ? (
                                <p className="mt-2 text-muted-foreground max-w-2xl">
                                    {description}
                                </p>
                            ) : (
                                <p className="mt-2 text-muted-foreground/60 italic">
                                    No description provided
                                </p>
                            )}
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {owner && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-5">
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
                                    <span>
                                        {owner.firstName && owner.lastName
                                            ? `${owner.firstName} ${owner.lastName}`
                                            : owner.email ?? "Guest"}
                                    </span>
                                </div>
                            )}

                            {createdDate && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="size-4" />
                                            <span>
                                                Created{" "}
                                                {format(
                                                    createdDate,
                                                    "MMM d, yyyy"
                                                )}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {format(createdDate, "PPpp")}
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {updatedDate &&
                                createdDate &&
                                updatedDate.getTime() !==
                                    createdDate.getTime() && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-4" />
                                                <span>
                                                    Updated{" "}
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
                                            {format(updatedDate, "PPpp")}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Organization stats component
function OrgStats({
    organization,
}: {
    organization: NonNullable<ReturnType<typeof useOrgData>>;
}) {
    // Use linked role arrays
    const linkedStudents = organization.orgStudents ?? [];
    const linkedTeachers = organization.orgTeachers ?? [];
    const linkedParents = organization.orgParents ?? [];
    const linkedAdmins = organization.admins ?? [];

    const studentCount = Array.isArray(linkedStudents)
        ? linkedStudents.length
        : 0;
    const teacherCount = Array.isArray(linkedTeachers)
        ? linkedTeachers.length
        : 0;
    const parentCount = Array.isArray(linkedParents) ? linkedParents.length : 0;
    const adminCount = Array.isArray(linkedAdmins) ? linkedAdmins.length : 0;

    const stats = [
        {
            label: "Students",
            value: studentCount,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Teachers",
            value: teacherCount,
            icon: GraduationCap,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "Parents",
            value: parentCount,
            icon: Users,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            label: "Admins",
            value: adminCount,
            icon: ShieldCheck,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
        },
    ];

    return (
        <section className="mb-8">
            <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "flex size-10 items-center justify-center rounded-lg",
                                    stat.bgColor
                                )}
                            >
                                <stat.icon
                                    className={cn("size-5", stat.color)}
                                />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Loading skeleton
function OrgPageSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            {/* Header skeleton */}
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="size-8 rounded-md" />
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* Hero skeleton */}
                <section className="mb-8">
                    <div className="rounded-2xl border bg-card p-6 md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start">
                            <Skeleton className="size-24 rounded-2xl md:size-32" />
                            <div className="flex-1 space-y-4">
                                <div>
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="mt-2 h-5 w-96 max-w-full" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats skeleton */}
                <section className="mb-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-20 rounded-xl"
                            />
                        ))}
                    </div>
                </section>

                {/* Classes section skeleton */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="mt-1 h-5 w-16" />
                        </div>
                        <Skeleton className="h-9 w-28 rounded-md" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-56 rounded-xl"
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

// Type helper for organization data
function useOrgData() {
    const { data } = db.useQuery({
        organizations: {
            owner: {},
            orgStudents: {},
            orgTeachers: {},
            orgParents: {},
            admins: {},
        },
    });
    return data?.organizations?.[0];
}
