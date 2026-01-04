/** @format */

"use client";

import { useState } from "react";
import {
    Users,
    GraduationCap,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
} from "@/components/ui/credenza";
import { cn } from "@/lib/utils";
import { MemberList, type StatMember } from "./member-list";
import { ParentStudentManager } from "./parent-student-manager";
import { StudentParentManager } from "./student-parent-manager";
import { TeacherClassManager } from "./teacher-class-manager";
import type { MemberRole } from "./member-action-menu";
import { MemberActionMenu } from "./member-action-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TabType = "students" | "parents" | "teachers" | "admins";

interface TabConfig {
    id: TabType;
    label: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}

const tabs: TabConfig[] = [
    {
        id: "students",
        label: "Students",
        icon: Users,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        id: "parents",
        label: "Parents",
        icon: Users,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        id: "teachers",
        label: "Teachers",
        icon: GraduationCap,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        id: "admins",
        label: "Admins",
        icon: ShieldCheck,
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
    },
];

interface MemberManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    students: StatMember[];
    parents: StatMember[];
    teachers: StatMember[];
    admins: StatMember[];
    adminIds: string[];
}

export function MemberManagementDialog({
    open,
    onOpenChange,
    organizationId,
    students,
    parents,
    teachers,
    admins,
    adminIds,
}: MemberManagementDialogProps) {
    const [activeTab, setActiveTab] = useState<TabType>("students");

    const handleMemberChange = () => {
        // This will trigger a re-render when members change
        // The parent component should refetch data
    };

    const getRoleFromTab = (tab: TabType): MemberRole => {
        switch (tab) {
            case "students":
                return "student";
            case "parents":
                return "parent";
            case "teachers":
                return "teacher";
            default:
                return "student";
        }
    };

    const getMembersForTab = (tab: TabType): StatMember[] => {
        switch (tab) {
            case "students":
                return students;
            case "parents":
                return parents;
            case "teachers":
                return teachers;
            case "admins":
                return admins;
        }
    };

    return (
        <Credenza
            open={open}
            onOpenChange={onOpenChange}
        >
            <CredenzaContent className="max-w-2xl">
                <CredenzaHeader>
                    <CredenzaTitle>Manage Members</CredenzaTitle>
                    <CredenzaDescription>
                        Manage organization members, roles, and permissions
                    </CredenzaDescription>
                </CredenzaHeader>

                <CredenzaBody>
                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const members = getMembersForTab(tab.id);
                            const count = members.length;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2",
                                        isActive
                                            ? "bg-background shadow-sm"
                                            : "hover:bg-background/50 text-muted-foreground"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "size-4",
                                            isActive
                                                ? tab.color
                                                : "text-muted-foreground"
                                        )}
                                    />
                                    <span>{tab.label}</span>
                                    <span
                                        className={cn(
                                            "text-xs px-1.5 py-0.5 rounded-full",
                                            isActive
                                                ? tab.bgColor + " " + tab.color
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-100">
                        {activeTab === "students" && (
                            <StudentParentManager
                                students={students}
                                parents={parents}
                                organizationId={organizationId}
                                adminIds={adminIds}
                                onChange={handleMemberChange}
                            />
                        )}

                        {activeTab === "parents" && (
                            <div>
                                <ParentStudentManager
                                    parents={parents}
                                    students={students}
                                    organizationId={organizationId}
                                    adminIds={adminIds}
                                    onChange={handleMemberChange}
                                />
                            </div>
                        )}

                        {activeTab === "teachers" && (
                            <TeacherClassManager
                                teachers={teachers}
                                organizationId={organizationId}
                                adminIds={adminIds}
                                onChange={handleMemberChange}
                            />
                        )}

                        {activeTab === "admins" && (
                            <AdminMemberList
                                members={admins}
                                students={students}
                                parents={parents}
                                teachers={teachers}
                                organizationId={organizationId}
                                adminIds={adminIds}
                                onMemberChange={handleMemberChange}
                            />
                        )}
                    </div>
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    );
}

// Special component for admins tab that determines role per member
function AdminMemberList({
    members,
    students,
    parents,
    teachers,
    organizationId,
    adminIds,
    onMemberChange,
}: {
    members: StatMember[];
    students: StatMember[];
    parents: StatMember[];
    teachers: StatMember[];
    organizationId: string;
    adminIds: string[];
    onMemberChange?: () => void;
}) {
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

    const getMemberRole = (member: StatMember): MemberRole => {
        // Check in order: teacher, parent, student (priority order)
        if (teachers.some((t) => t.id === member.id)) return "teacher";
        if (parents.some((p) => p.id === member.id)) return "parent";
        if (students.some((s) => s.id === member.id)) return "student";
        // Default to student if not found in any role
        return "student";
    };

    if (members.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground/60 italic">
                    No admins yet
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {members.map((member) => {
                const isAdmin = adminIds.includes(member.id);
                const role = getMemberRole(member);
                const displayName = getUserDisplayName(member);
                const initials = getUserInitials(member);
                const avatarUrl =
                    member.imageURL || member.avatarURL || undefined;

                return (
                    <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                    >
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
                            {member.email && member.firstName && (
                                <p className="text-xs text-muted-foreground truncate">
                                    {member.email}
                                </p>
                            )}
                        </div>
                        <MemberActionMenu
                            userId={member.id}
                            userName={displayName}
                            currentRole={role}
                            isAdmin={isAdmin}
                            organizationId={organizationId}
                            onRoleChange={onMemberChange}
                            onAdminToggle={onMemberChange}
                            onKick={onMemberChange}
                        />
                    </div>
                );
            })}
        </div>
    );
}
