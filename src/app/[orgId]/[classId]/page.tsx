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
    ExternalLink,
    Fullscreen,
    GraduationCap,
    Maximize2,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ClassPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

type JoinCodeType = "student" | "teacher" | "parent";

const codeLabels: Record<JoinCodeType, string> = {
    student: "Student",
    teacher: "Teacher",
    parent: "Parent",
};

const codeColors: Record<JoinCodeType, string> = {
    student: "text-blue-500",
    teacher: "text-emerald-500",
    parent: "text-amber-500",
};

export default function ClassPage({ params }: ClassPageProps) {
    const { orgId, classId } = use(params);
    const { user, isLoading: isUserLoading } = db.useAuth();
    const [copied, setCopied] = useState<JoinCodeType | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [selectedCodeType, setSelectedCodeType] =
        useState<JoinCodeType>("student");
    const [isRevealed, setIsRevealed] = useState(false);

    // Query the class with related data
    const { data, isLoading, error } = db.useQuery({
        classes: {
            $: { where: { id: classId } },
            owner: {},
            classAdmins: {},
            classTeachers: {},
            classStudents: {},
            joinCodeEntity: {},
            organization: {
                owner: {},
                admins: {},
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

        // Class admins (use linked relation if available, fall back to JSON array during migration)
        const linkedClassAdmins = classData.classAdmins ?? [];
        const classAdmins = Array.isArray(linkedClassAdmins)
            ? linkedClassAdmins.map((admin: any) => admin.id ?? admin)
            : (Array.isArray(classData.admins) ? classData.admins : []);
        if (classAdmins.includes(user.id)) return true;

        // Organization owner
        if (organization?.owner?.id === user.id) return true;

        // Organization admins (use linked relation if available, fall back to JSON array during migration)
        const linkedOrgAdmins = organization?.admins ?? [];
        const orgAdmins = Array.isArray(linkedOrgAdmins)
            ? linkedOrgAdmins.map((admin: any) => admin.id ?? admin)
            : (Array.isArray(organization?.adminIds) ? organization.adminIds : []);
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
    <title>${label} Join Code - ${classData.name}</title>
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
            <h1>${classData.name}</h1>
            <div class="code-type">${label} Code</div>
            <div class="code-label">Join Code</div>
            <div class="code">${code}</div>
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
                        <span>
                            Back to {organization?.name ?? "organization"}
                        </span>
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
                    selectedCodeType={selectedCodeType}
                    isRevealed={isRevealed}
                    onSelectCodeType={setSelectedCodeType}
                    onRevealCode={handleRevealCode}
                    onCopyJoinCode={handleCopyJoinCode}
                    onOpenFullscreen={handleOpenFullscreen}
                    onOpenInNewWindow={handleOpenInNewWindow}
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
                            Array.isArray(classData.classStudents)
                                ? classData.classStudents.map((student: any) => student.id ?? student)
                                : (Array.isArray(classData.students) ? classData.students : [])
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
                                Array.isArray(classData.classTeachers)
                                    ? classData.classTeachers.map((teacher: any) => teacher.id ?? teacher)
                                    : (Array.isArray(classData.teachers) ? classData.teachers : [])
                            }
                            emptyMessage="No teachers assigned yet"
                        />
                        <PeopleSection
                            title="Admins"
                            icon={ShieldCheck}
                            iconColor="text-violet-500"
                            bgColor="bg-violet-500/10"
                            userIds={
                                Array.isArray(classData.classAdmins)
                                    ? classData.classAdmins.map((admin: any) => admin.id ?? admin)
                                    : (Array.isArray(classData.admins) ? classData.admins : [])
                            }
                            emptyMessage="No class admins yet"
                        />
                    </div>
                </div>
            </main>

            {/* Fullscreen Join Code Dialog */}
            {classData && joinCodes && (
                <Dialog
                    open={showFullscreen}
                    onOpenChange={setShowFullscreen}
                >
                    <DialogContent className="max-w-none! w-screen! h-screen! m-0! rounded-none! top-0! left-0! translate-x-0! translate-y-0! flex flex-col p-8!">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-center text-3xl">
                                {classData.name}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-wrap items-center justify-center flex-1 gap-8 lg:gap-16">
                            {/* Join Code */}
                            <div className="flex flex-col items-center">
                                <p
                                    className={cn(
                                        "text-lg md:text-xl mb-3 uppercase tracking-wider font-semibold",
                                        codeColors[selectedCodeType]
                                    )}
                                >
                                    {codeLabels[selectedCodeType]} Join Code
                                </p>
                                <div
                                    className={cn(
                                        "rounded-2xl border-4 bg-muted/50 px-8 py-6 md:px-16 md:py-12",
                                        selectedCodeType === "student" &&
                                            "border-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "border-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "border-amber-500"
                                    )}
                                >
                                    <p
                                        className="font-bold font-mono tracking-[0.15em] text-center"
                                        style={{
                                            fontSize: "clamp(3rem, 10vw, 12rem)",
                                        }}
                                    >
                                        {joinCodes[selectedCodeType]}
                                    </p>
                                </div>
                            </div>

                            {/* Procedure Steps */}
                            <div className="flex flex-col items-start bg-muted/30 rounded-2xl p-6 md:p-10 border">
                                <p className="text-2xl md:text-3xl font-semibold mb-6">
                                    How to Join
                                </p>
                                <ol className="space-y-4 text-xl md:text-2xl">
                                    <li className="flex items-start gap-4">
                                        <span
                                            className={cn(
                                                "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                                selectedCodeType === "student" &&
                                                    "bg-blue-500",
                                                selectedCodeType === "teacher" &&
                                                    "bg-emerald-500",
                                                selectedCodeType === "parent" &&
                                                    "bg-amber-500"
                                            )}
                                        >
                                            1
                                        </span>
                                        <span>
                                            Go to{" "}
                                            <span
                                                className={cn(
                                                    "font-mono font-semibold",
                                                    codeColors[selectedCodeType]
                                                )}
                                            >
                                                www.classclarus.com/join
                                            </span>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <span
                                            className={cn(
                                                "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                                selectedCodeType === "student" &&
                                                    "bg-blue-500",
                                                selectedCodeType === "teacher" &&
                                                    "bg-emerald-500",
                                                selectedCodeType === "parent" &&
                                                    "bg-amber-500"
                                            )}
                                        >
                                            2
                                        </span>
                                        <span>
                                            Input the code you see on the screen
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <span
                                            className={cn(
                                                "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                                selectedCodeType === "student" &&
                                                    "bg-blue-500",
                                                selectedCodeType === "teacher" &&
                                                    "bg-emerald-500",
                                                selectedCodeType === "parent" &&
                                                    "bg-amber-500"
                                            )}
                                        >
                                            3
                                        </span>
                                        <span>
                                            Click the{" "}
                                            <span className="font-semibold">
                                                Join Class
                                            </span>{" "}
                                            button
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <span
                                            className={cn(
                                                "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                                selectedCodeType === "student" &&
                                                    "bg-blue-500",
                                                selectedCodeType === "teacher" &&
                                                    "bg-emerald-500",
                                                selectedCodeType === "parent" &&
                                                    "bg-amber-500"
                                            )}
                                        >
                                            4
                                        </span>
                                        <span>All done!</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3 pt-4">
                            <Button
                                onClick={() =>
                                    handleCopyJoinCode(selectedCodeType)
                                }
                                variant="outline"
                                size="lg"
                            >
                                <Copy className="size-5 mr-2" />
                                Copy Code
                            </Button>
                            <Button
                                onClick={() =>
                                    handleOpenInNewWindow(selectedCodeType)
                                }
                                variant="outline"
                                size="lg"
                            >
                                <ExternalLink className="size-5 mr-2" />
                                Open in New Window
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
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
    selectedCodeType,
    isRevealed,
    onSelectCodeType,
    onRevealCode,
    onCopyJoinCode,
    onOpenFullscreen,
    onOpenInNewWindow,
}: {
    classData: ClassDataType;
    canEdit: boolean;
    copied: JoinCodeType | null;
    selectedCodeType: JoinCodeType;
    isRevealed: boolean;
    onSelectCodeType: (type: JoinCodeType) => void;
    onRevealCode: () => void;
    onCopyJoinCode: (codeType: JoinCodeType) => void;
    onOpenFullscreen: () => void;
    onOpenInNewWindow: (codeType: JoinCodeType) => void;
}) {
    const {
        name,
        description,
        icon,
        owner,
        created,
        updated,
        joinCodeEntity,
        organization,
    } = classData;

    const joinCodes = joinCodeEntity
        ? {
              student: joinCodeEntity.studentCode,
              teacher: joinCodeEntity.teacherCode,
              parent: joinCodeEntity.parentCode,
          }
        : null;

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
                                                    Owner
                                                </span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            You are the owner of this class and
                                            therefor have absolute power over
                                            it.
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

                        {/* Join codes section */}
                        <div className="space-y-2">
                            {/* Code type tabs */}
                            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                                {(
                                    ["student", "teacher", "parent"] as const
                                ).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => onSelectCodeType(type)}
                                        className={cn(
                                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                                            selectedCodeType === type
                                                ? "bg-background shadow-sm"
                                                : "hover:bg-background/50 text-muted-foreground"
                                        )}
                                    >
                                        <span className={codeColors[type]}>
                                            {codeLabels[type]}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected code display */}
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => {
                                                if (!isRevealed) {
                                                    onRevealCode();
                                                } else {
                                                    onCopyJoinCode(
                                                        selectedCodeType
                                                    );
                                                }
                                            }}
                                            className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 transition-colors hover:bg-muted group relative overflow-hidden"
                                        >
                                            <span
                                                className={cn(
                                                    "text-sm transition-colors",
                                                    codeColors[selectedCodeType]
                                                )}
                                            >
                                                {codeLabels[selectedCodeType]}{" "}
                                                Code
                                            </span>
                                            <span className="flex items-center gap-2 font-mono text-lg font-bold relative">
                                                <span
                                                    className={cn(
                                                        "transition-all duration-500 ease-out",
                                                        !isRevealed &&
                                                            "blur-sm select-none"
                                                    )}
                                                >
                                                    {
                                                        joinCodes[
                                                            selectedCodeType
                                                        ]
                                                    }
                                                </span>
                                                {!isRevealed && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                                                        Click to reveal
                                                    </span>
                                                )}
                                                {isRevealed &&
                                                    (copied ===
                                                    selectedCodeType ? (
                                                        <Check className="size-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                    ))}
                                            </span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {!isRevealed
                                            ? "Click to reveal code"
                                            : copied === selectedCodeType
                                            ? "Copied!"
                                            : "Click to copy join code"}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onOpenFullscreen();
                                            }}
                                            className="h-10 w-10"
                                        >
                                            <Fullscreen className="size-4" />
                                            <span className="sr-only">
                                                Fullscreen
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        View in fullscreen
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onOpenInNewWindow(
                                                    selectedCodeType
                                                );
                                            }}
                                            className="h-10 w-10"
                                        >
                                            <ExternalLink className="size-4" />
                                            <span className="sr-only">
                                                Open in new window
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Open in new window
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

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
    // Use linked relations if available, fall back to JSON arrays during migration
    const linkedStudents = classData.classStudents ?? [];
    const linkedTeachers = classData.classTeachers ?? [];
    const linkedAdmins = classData.classAdmins ?? [];
    
    const studentCount = Array.isArray(linkedStudents)
        ? linkedStudents.length
        : (Array.isArray(classData.students) ? classData.students.length : 0);
    const teacherCount = Array.isArray(linkedTeachers)
        ? linkedTeachers.length
        : (Array.isArray(classData.teachers) ? classData.teachers.length : 0);
    const adminCount = Array.isArray(linkedAdmins)
        ? linkedAdmins.length
        : (Array.isArray(classData.admins) ? classData.admins.length : 0);

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
            label: "Admins",
            value: adminCount,
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
