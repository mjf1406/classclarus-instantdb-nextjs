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
    Maximize2,
    ExternalLink,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";

// Type for class data from useQuery
interface ClassData {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    joinCodeStudent: string;
    joinCodeTeacher: string;
    joinCodeParent: string;
    organizationId?: string;
    students?: string[]; // Deprecated - kept for backward compatibility during migration
    admins?: string[]; // Deprecated - kept for backward compatibility during migration
    teachers?: string[]; // Deprecated - kept for backward compatibility during migration
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
    classAdmins?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    classTeachers?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    classStudents?: Array<{
        id: string;
        email?: string;
        imageURL?: string;
        avatarURL?: string;
        firstName?: string;
        lastName?: string;
    }>;
    organization?: {
        id: string;
        name: string;
        adminIds?: string[]; // Deprecated - kept for backward compatibility during migration
        admins?: Array<{
            id: string;
        }>;
        owner?: {
            id: string;
        };
    };
}

type JoinCodeType = "student" | "teacher" | "parent";

interface ClassCardProps {
    classData: ClassData;
    canEdit?: boolean;
}

export default function ClassCard({ classData, canEdit }: ClassCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showEditDialog, setShowEditDialog] = React.useState(false);
    const [showFullscreen, setShowFullscreen] = React.useState(false);
    const [copied, setCopied] = React.useState<JoinCodeType | null>(null);
    const [selectedCodeType, setSelectedCodeType] =
        React.useState<JoinCodeType>("student");
    const [isRevealed, setIsRevealed] = React.useState(false);

    const {
        id,
        name,
        description,
        icon,
        joinCodeStudent,
        joinCodeTeacher,
        joinCodeParent,
        organizationId,
        students,
        admins,
        teachers,
        created,
        updated,
        owner,
    } = classData;

    const joinCodes = {
        student: joinCodeStudent,
        teacher: joinCodeTeacher,
        parent: joinCodeParent,
    };

    const codeLabels = {
        student: "Student",
        teacher: "Teacher",
        parent: "Parent",
    };

    const codeColors = {
        student: "text-blue-500",
        teacher: "text-emerald-500",
        parent: "text-amber-500",
    };

    const handleDelete = () => {
        db.transact(db.tx.classes[id].delete());
        setShowDeleteDialog(false);
    };

    const handleCopyJoinCode = async (
        e: React.MouseEvent,
        codeType: JoinCodeType
    ) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(joinCodes[codeType]);
            setCopied(codeType);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    const handleRevealCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRevealed(true);
    };

    const handleOpenFullscreen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowFullscreen(true);
    };

    const handleOpenInNewWindow = (
        e: React.MouseEvent,
        codeType: JoinCodeType
    ) => {
        e.preventDefault();
        e.stopPropagation();
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
    <title>${label} Join Code - ${name}</title>
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
            <h1>${name}</h1>
            <div class="code-type">${label} Code</div>
            <div class="code-label">Join Code</div>
            <div class="code">${code}</div>
        </div>
        <div class="steps">
            <h2>How to Join</h2>
            <ol>
                <li>Go to <span class="url">app.classclarus.com/join</span></li>
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

                        {/* Join codes section */}
                        <div className="mt-4 space-y-2">
                            {/* Code type tabs */}
                            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                                {(
                                    ["student", "teacher", "parent"] as const
                                ).map((type) => (
                                    <button
                                        key={type}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedCodeType(type);
                                        }}
                                        className={cn(
                                            "flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
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
                                            onClick={(e) => {
                                                if (!isRevealed) {
                                                    handleRevealCode(e);
                                                } else {
                                                    handleCopyJoinCode(
                                                        e,
                                                        selectedCodeType
                                                    );
                                                }
                                            }}
                                            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted flex-1 justify-between group/code relative overflow-hidden"
                                        >
                                            <span
                                                className={cn(
                                                    "text-muted-foreground transition-colors",
                                                    codeColors[selectedCodeType]
                                                )}
                                            >
                                                {codeLabels[selectedCodeType]}{" "}
                                                Code
                                            </span>
                                            <span className="flex items-center gap-2 font-mono font-semibold relative">
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
                                                        <Copy className="size-4 text-muted-foreground group-hover/code:text-foreground transition-colors" />
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
                                            onClick={handleOpenFullscreen}
                                            className="h-9 w-9"
                                        >
                                            <Maximize2 className="size-4" />
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
                                            onClick={(e) =>
                                                handleOpenInNewWindow(
                                                    e,
                                                    selectedCodeType
                                                )
                                            }
                                            className="h-9 w-9"
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

            {/* Fullscreen Join Code Dialog */}
            <Dialog
                open={showFullscreen}
                onOpenChange={setShowFullscreen}
            >
                <DialogContent className="max-w-none! w-screen! h-screen! m-0! rounded-none! top-0! left-0! translate-x-0! translate-y-0! flex flex-col p-8!">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-center text-3xl">
                            {name}
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
                                            app.classclarus.com/join
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
                            onClick={(e) => {
                                e.preventDefault();
                                handleCopyJoinCode(e, selectedCodeType);
                            }}
                            variant="outline"
                            size="lg"
                        >
                            <Copy className="size-5 mr-2" />
                            Copy Code
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                handleOpenInNewWindow(e, selectedCodeType);
                            }}
                            variant="outline"
                            size="lg"
                        >
                            <ExternalLink className="size-5 mr-2" />
                            Open in New Window
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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
