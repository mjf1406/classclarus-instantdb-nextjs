/** @format */

"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Crown,
    GraduationCap,
    ShieldCheck,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/db/db";
import type { StatMember } from "./member-list";
import { MemberActionMenu } from "./member-action-menu";

interface TeacherClassManagerProps {
    teachers: StatMember[];
    organizationId: string;
    adminIds: string[];
    onChange?: () => void;
}

type ClassRole = "owner" | "admin" | "teacher";

interface ClassInfo {
    id: string;
    name: string;
    icon?: string;
    role: ClassRole;
}

interface TeacherWithClasses extends StatMember {
    classes: ClassInfo[];
}

export function TeacherClassManager({
    teachers,
    organizationId,
    adminIds,
    onChange,
}: TeacherClassManagerProps) {
    const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(
        new Set()
    );

    // Query to get teacher-class relationships and class details
    const { data } = db.useQuery({
        $users: {
            $: {
                where: {
                    id: {
                        $in: teachers.map((t) => t.id),
                    },
                },
            },
            teacherClasses: {
                owner: {},
                classAdmins: {},
                organization: {},
            },
            classes: {
                organization: {},
                classAdmins: {},
            },
            adminClasses: {
                owner: {},
                classTeachers: {},
                organization: {},
            },
        },
    });

    // Build teacher with classes map
    const teachersWithClasses: TeacherWithClasses[] = teachers.map((teacher) => {
        const teacherData = data?.$users?.find((u) => u.id === teacher.id);
        const classesMap = new Map<string, ClassInfo>();

        // Classes they own (highest priority role)
        teacherData?.classes?.forEach((cls) => {
            // Only include classes from this organization
            if (cls.organization?.id === organizationId) {
                classesMap.set(cls.id, {
                    id: cls.id,
                    name: cls.name,
                    icon: cls.icon ?? undefined,
                    role: "owner",
                });
            }
        });

        // Classes they are admin of
        teacherData?.adminClasses?.forEach((cls) => {
            if (cls.organization?.id === organizationId && !classesMap.has(cls.id)) {
                classesMap.set(cls.id, {
                    id: cls.id,
                    name: cls.name,
                    icon: cls.icon ?? undefined,
                    role: "admin",
                });
            }
        });

        // Classes they teach
        teacherData?.teacherClasses?.forEach((cls) => {
            if (cls.organization?.id === organizationId && !classesMap.has(cls.id)) {
                classesMap.set(cls.id, {
                    id: cls.id,
                    name: cls.name,
                    icon: cls.icon ?? undefined,
                    role: "teacher",
                });
            }
        });

        return { ...teacher, classes: Array.from(classesMap.values()) };
    });

    const toggleTeacher = (teacherId: string) => {
        setExpandedTeachers((prev) => {
            const next = new Set(prev);
            if (next.has(teacherId)) {
                next.delete(teacherId);
            } else {
                next.add(teacherId);
            }
            return next;
        });
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

    const getClassInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleIcon = (role: ClassRole) => {
        switch (role) {
            case "owner":
                return Crown;
            case "admin":
                return ShieldCheck;
            case "teacher":
                return GraduationCap;
        }
    };

    const getRoleColor = (role: ClassRole) => {
        switch (role) {
            case "owner":
                return "text-amber-500";
            case "admin":
                return "text-violet-500";
            case "teacher":
                return "text-emerald-500";
        }
    };

    const getRoleLabel = (role: ClassRole) => {
        switch (role) {
            case "owner":
                return "Owner";
            case "admin":
                return "Admin";
            case "teacher":
                return "Teacher";
        }
    };

    if (teachers.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground/60 italic">
                    No teachers to manage
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {teachersWithClasses.map((teacher) => {
                const isExpanded = expandedTeachers.has(teacher.id);
                const teacherClasses = teacher.classes;
                const displayName = getUserDisplayName(teacher);
                const initials = getUserInitials(teacher);
                const avatarUrl =
                    teacher.imageURL || teacher.avatarURL || undefined;

                const isAdmin = adminIds.includes(teacher.id);

                return (
                    <Collapsible
                        key={teacher.id}
                        open={isExpanded}
                        onOpenChange={() => toggleTeacher(teacher.id)}
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
                                            {teacher.email && teacher.firstName && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {teacher.email}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <GraduationCap className="size-3" />
                                                {teacherClasses.length} class
                                                {teacherClasses.length !== 1
                                                    ? "es"
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
                                        userId={teacher.id}
                                        userName={displayName}
                                        currentRole="teacher"
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
                                    {/* Classes list */}
                                    {teacherClasses.length > 0 ? (
                                        <div className="space-y-2">
                                            {teacherClasses.map((cls) => {
                                                const RoleIcon = getRoleIcon(cls.role);
                                                const roleColor = getRoleColor(cls.role);
                                                const roleLabel = getRoleLabel(cls.role);

                                                return (
                                                    <div
                                                        key={cls.id}
                                                        className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
                                                    >
                                                        <Avatar className="size-8 rounded-lg">
                                                            {cls.icon ? (
                                                                <AvatarImage
                                                                    src={cls.icon}
                                                                    alt={cls.name}
                                                                    className="object-cover"
                                                                />
                                                            ) : null}
                                                            <AvatarFallback className="rounded-lg text-xs bg-linear-to-br from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400">
                                                                {getClassInitials(cls.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">
                                                                {cls.name}
                                                            </p>
                                                            <p className={`text-xs flex items-center gap-1 ${roleColor}`}>
                                                                <RoleIcon className="size-3" />
                                                                {roleLabel}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground/60 italic text-center py-2">
                                            Not in any classes yet
                                        </p>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                );
            })}
        </div>
    );
}

