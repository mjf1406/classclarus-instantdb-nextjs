/** @format */

"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
    Building2,
    Calendar,
    Clock,
    Crown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassActionMenu } from "@/components/classes/class-action-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClassQueryResult, JoinCodeType } from "../types";
import { JoinCodeSection } from "./join-code-section";

interface ClassHeroProps {
    classData: ClassQueryResult;
    canEdit: boolean;
    copied: JoinCodeType | null;
    selectedCodeType: JoinCodeType;
    isRevealed: boolean;
    onSelectCodeType: (type: JoinCodeType) => void;
    onRevealCode: () => void;
    onCopyJoinCode: (codeType: JoinCodeType) => void;
    onOpenFullscreen: () => void;
    onOpenInNewWindow: (codeType: JoinCodeType) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function ClassHero({
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
    onEdit,
    onDelete,
}: ClassHeroProps) {
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
            <div className="relative rounded-2xl border bg-card p-6 md:p-8">
                {canEdit && (
                    <ClassActionMenu
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
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
                        <JoinCodeSection
                            joinCodes={joinCodes}
                            selectedCodeType={selectedCodeType}
                            isRevealed={isRevealed}
                            copied={copied}
                            onSelectCodeType={onSelectCodeType}
                            onRevealCode={onRevealCode}
                            onCopyJoinCode={onCopyJoinCode}
                            onOpenFullscreen={onOpenFullscreen}
                            onOpenInNewWindow={onOpenInNewWindow}
                        />

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {organization && (
                                <Link
                                    href={`/org/${organization.id}`}
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
