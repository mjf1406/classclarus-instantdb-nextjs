/** @format */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberActionMenu, type MemberRole } from "./member-action-menu";
import { cn } from "@/lib/utils";

export type StatMember = {
    id: string;
    email?: string;
    imageURL?: string;
    avatarURL?: string;
    firstName?: string;
    lastName?: string;
};

interface MemberListProps {
    members: StatMember[];
    role: MemberRole;
    organizationId: string;
    adminIds: string[];
    onMemberChange?: () => void;
    className?: string;
}

export function MemberList({
    members,
    role,
    organizationId,
    adminIds,
    onMemberChange,
    className,
}: MemberListProps) {
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

    if (members.length === 0) {
        return (
            <div className={cn("py-8 text-center", className)}>
                <p className="text-sm text-muted-foreground/60 italic">
                    No {role}s yet
                </p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {members.map((member) => {
                const isAdmin = adminIds.includes(member.id);
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
