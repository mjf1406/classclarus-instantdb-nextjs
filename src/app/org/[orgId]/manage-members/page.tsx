/** @format */

"use client";

import { use, useState } from "react";
import {
    Users,
    GraduationCap,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { MemberList, type StatMember } from "../components/member-list";
import { ParentStudentManager } from "../components/parent-student-manager";
import { StudentParentManager } from "../components/student-parent-manager";
import { TeacherClassManager } from "../components/teacher-class-manager";
import type { MemberRole } from "../components/member-action-menu";
import { MemberActionMenu } from "../components/member-action-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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

interface ManageMembersPageProps {
    params: Promise<{ orgId: string }>;
}

export default function ManageMembersPage({ params }: ManageMembersPageProps) {
    const { orgId } = use(params);
    const { user, isLoading: isUserLoading } = useAuthContext();
    const [activeTab, setActiveTab] = useState<TabType>("students");

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
    const isAdmin = Boolean(
        isOwner ||
            (user?.id &&
                organization?.admins?.some((admin) => admin.id === user.id))
    );

    // Loading state
    if (isLoading || isUserLoading) {
        return <ManageMembersPageSkeleton />;
    }

    // Error or not found state
    if (error || !organization) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive font-medium">
                        Failed to load organization
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error?.message || "Organization not found"}
                    </p>
                </div>
            </div>
        );
    }

    // Check permissions
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center">
                    <p className="font-medium">Access Denied</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You must be an owner or admin to manage members.
                    </p>
                </div>
            </div>
        );
    }

    const students = (organization.orgStudents ?? []) as StatMember[];
    const parents = (organization.orgParents ?? []) as StatMember[];
    const teachers = (organization.orgTeachers ?? []) as StatMember[];
    const admins = (organization.admins ?? []) as StatMember[];
    const adminIds = admins.map((admin) => admin.id);

    const handleMemberChange = () => {
        // This will trigger a re-render when members change
        // InstantDB will automatically update the query
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
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Manage Members
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage organization members, roles, and permissions
                    </p>
                </div>

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
                                <span className="hidden sm:inline">
                                    {tab.label}
                                </span>
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
                    {/* Mobile-only tab label */}
                    <div className="mb-4 sm:hidden">
                        <h2 className="text-xl font-semibold">
                            {tabs.find((tab) => tab.id === activeTab)?.label}
                        </h2>
                    </div>
                    {activeTab === "students" && (
                        <StudentParentManager
                            students={students}
                            parents={parents}
                            organizationId={organization.id}
                            adminIds={adminIds}
                            onChange={handleMemberChange}
                        />
                    )}

                    {activeTab === "parents" && (
                        <div>
                            <ParentStudentManager
                                parents={parents}
                                students={students}
                                organizationId={organization.id}
                                adminIds={adminIds}
                                onChange={handleMemberChange}
                            />
                        </div>
                    )}

                    {activeTab === "teachers" && (
                        <TeacherClassManager
                            teachers={teachers}
                            organizationId={organization.id}
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
                            organizationId={organization.id}
                            adminIds={adminIds}
                            onMemberChange={handleMemberChange}
                        />
                    )}
                </div>
            </main>
        </div>
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

// Loading skeleton
function ManageMembersPageSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="mt-2 h-5 w-96 max-w-full" />
                </div>
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-10 flex-1 rounded-md"
                        />
                    ))}
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-20 rounded-lg"
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
