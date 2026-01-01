/** @format */

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
    ArrowLeft,
    Building2,
    Calendar,
    Check,
    Clock,
    Copy,
    Crown,
    Edit,
    GraduationCap,
    MoreVertical,
    Settings,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
} from "lucide-react";

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

interface ClassPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default function ClassPage({ params }: ClassPageProps) {
    const { orgId, classId } = use(params);
    const { user, isLoading: isUserLoading } = db.useAuth();
    const [copied, setCopied] = useState(false);

    // Query the class with related data
    const { data, isLoading, error } = db.useQuery({
        classes: {
            $: { where: { id: classId } },
            owner: {},
            organization: {
                owner: {},
            },
        },
    });

    const classData = data?.classes?.[0];
    const organization = classData?.organization;

    // Determine if user can edit this class
    const canEdit = (() => {
        if (!user?.id || !classData) return false;

        // Class owner
        if (classData.owner?.id === user.id) return true;

        // Class admins
        const classAdmins = Array.isArray(classData.admins)
            ? classData.admins
            : [];
        if (classAdmins.includes(user.id)) return true;

        // Organization owner
        if (organization?.owner?.id === user.id) return true;

        // Organization admins
        const orgAdmins = Array.isArray(organization?.adminIds)
            ? organization.adminIds
            : [];
        if (orgAdmins.includes(user.id)) return true;

        return false;
    })();

    const handleCopyJoinCode = async () => {
        if (!classData?.joinCode) return;
        try {
            await navigator.clipboard.writeText(classData.joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    // Loading state
    if (isLoading || isUserLoading) {
        return <ClassPageSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive font-medium">
                        Failed to load class
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error.message}
                    </p>
                    <Link href={`/${orgId}`}>
                        <Button
                            variant="outline"
                            className="mt-4"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Organization
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Not found state
    if (!classData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Empty className="border bg-card rounded-xl p-8 max-w-md">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <GraduationCap className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>Class not found</EmptyTitle>
                        <EmptyDescription>
                            The class you&apos;re looking for doesn&apos;t exist
                            or you don&apos;t have access to it.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link href={`/${orgId}`}>
                            <Button>
                                <ArrowLeft className="size-4" />
                                Back to organization
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
                        href={`/${orgId}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Back to {organization?.name ?? "organization"}</span>
                    </Link>

                    {canEdit && (
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
                                    Edit class
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="size-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="size-4" />
                                    Delete class
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* Class hero section */}
                <ClassHero
                    classData={classData}
                    canEdit={canEdit}
                    copied={copied}
                    onCopyJoinCode={handleCopyJoinCode}
                />

                {/* Stats cards */}
                <ClassStats classData={classData} />

                {/* People sections */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <PeopleSection
                        title="Students"
                        icon={Users}
                        iconColor="text-blue-500"
                        bgColor="bg-blue-500/10"
                        userIds={
                            Array.isArray(classData.students)
                                ? classData.students
                                : []
                        }
                        emptyMessage="No students enrolled yet"
                    />
                    <div className="space-y-6">
                        <PeopleSection
                            title="Teachers"
                            icon={GraduationCap}
                            iconColor="text-emerald-500"
                            bgColor="bg-emerald-500/10"
                            userIds={
                                Array.isArray(classData.teachers)
                                    ? classData.teachers
                                    : []
                            }
                            emptyMessage="No teachers assigned yet"
                        />
                        <PeopleSection
                            title="Admins"
                            icon={ShieldCheck}
                            iconColor="text-violet-500"
                            bgColor="bg-violet-500/10"
                            userIds={
                                Array.isArray(classData.admins)
                                    ? classData.admins
                                    : []
                            }
                            emptyMessage="No class admins yet"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

// Type helper for class data
type ClassDataType = NonNullable<
    Awaited<
        ReturnType<
            typeof db.queryOnce<{
                classes: {
                    owner: {};
                    organization: { owner: {} };
                };
            }>
        >
    >["data"]["classes"]
>[0];

// Class hero component
function ClassHero({
    classData,
    canEdit,
    copied,
    onCopyJoinCode,
}: {
    classData: ClassDataType;
    canEdit: boolean;
    copied: boolean;
    onCopyJoinCode: () => void;
}) {
    const { name, description, icon, owner, created, updated, joinCode, organization } =
        classData;

    const getInitials = (className: string) => {
        return className
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
                    {/* Class icon */}
                    <Avatar className="size-24 rounded-2xl border-2 border-border shadow-lg md:size-32">
                        {icon ? (
                            <AvatarImage
                                src={icon}
                                alt={`${name} icon`}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-2xl bg-linear-to-br from-violet-500/20 to-violet-500/5 text-3xl font-bold text-violet-600 dark:text-violet-400 md:text-4xl">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Class info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                    {name}
                                </h1>
                                {canEdit && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="flex items-center rounded-full bg-amber-500/10 px-2 py-1">
                                                <Crown className="size-4 text-amber-500" />
                                                <span className="ml-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                    Manager
                                                </span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            You can manage this class
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

                        {/* Join code */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={onCopyJoinCode}
                                    className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 transition-colors hover:bg-muted group"
                                >
                                    <span className="text-sm text-muted-foreground">
                                        Join Code
                                    </span>
                                    <span className="flex items-center gap-2 font-mono text-lg font-bold">
                                        {joinCode}
                                        {copied ? (
                                            <Check className="size-4 text-green-500" />
                                        ) : (
                                            <Copy className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        )}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {copied ? "Copied!" : "Click to copy join code"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {organization && (
                                <Link
                                    href={`/${organization.id}`}
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                >
                                    <Building2 className="size-4" />
                                    <span>{organization.name}</span>
                                </Link>
                            )}

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
                                            : owner.email ?? "Unknown owner"}
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

// Class stats component
function ClassStats({ classData }: { classData: ClassDataType }) {
    const students = Array.isArray(classData.students) ? classData.students : [];
    const teachers = Array.isArray(classData.teachers) ? classData.teachers : [];
    const admins = Array.isArray(classData.admins) ? classData.admins : [];

    const stats = [
        {
            label: "Students",
            value: students.length,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Teachers",
            value: teachers.length,
            icon: GraduationCap,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "Admins",
            value: admins.length,
            icon: ShieldCheck,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
        },
    ];

    return (
        <section className="mb-8">
            <div className="grid gap-4 sm:grid-cols-3">
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

// People section component
function PeopleSection({
    title,
    icon: Icon,
    iconColor,
    bgColor,
    userIds,
    emptyMessage,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
    userIds: string[];
    emptyMessage: string;
}) {
    // Query users by their IDs
    // Note: This shows user IDs/emails for now. In production, you might want to resolve these to actual user data
    
    return (
        <section className="rounded-xl border bg-card">
            <div className="flex items-center gap-3 border-b p-4">
                <div
                    className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        bgColor
                    )}
                >
                    <Icon className={cn("size-4", iconColor)} />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium tabular-nums">
                    {userIds.length}
                </span>
            </div>

            <div className="p-4">
                {userIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 italic text-center py-4">
                        {emptyMessage}
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {userIds.map((userId) => (
                            <li
                                key={userId}
                                className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                            >
                                <Avatar className="size-8">
                                    <AvatarFallback className="text-xs">
                                        {userId.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate flex-1 font-mono text-muted-foreground">
                                    {userId}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

// Loading skeleton
function ClassPageSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            {/* Header skeleton */}
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Skeleton className="h-5 w-48" />
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
                                <Skeleton className="h-10 w-48 rounded-lg" />
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
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-20 rounded-xl"
                            />
                        ))}
                    </div>
                </section>

                {/* People sections skeleton */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-64 rounded-xl" />
                    <div className="space-y-6">
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    );
}

