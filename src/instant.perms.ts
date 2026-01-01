/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const dataBind = [
    // Authenticated user
    "isAuthenticated",
    "auth.id != null",
    // User is a guest
    "isGuest",
    "auth.isGuest == true",
    // User is not a guest
    "isNotGuest",
    "auth.isGuest == false",
    // User is the owner of the data
    "isOwner",
    "data.owner == auth.id || auth.id == data.user",
    // User is still the owner of the data
    "isStillOwner",
    "auth.id == newData.owner || auth.id == newData.user",
    // User is a premium user
    "isPremium",
    "auth.ref('$user.profile.plan').exists(p, p in ['basic', 'plus', 'pro'])",
    // User is a teacher in a class
    "isTeacher",
    "auth.id in data.ref('classTeachers.id')",
    // User is still a teacher in a class
    "isStillTeacher",
    "auth.id in newData.ref('classTeachers.id')",
    // User is a member of the org
    "isOrgMember",
    "auth.id in data.ref('orgStudents.id') || auth.id in data.ref('orgTeachers.id') || auth.id in data.ref('orgParents.id')",
    // User is still a member of the org
    "isStillOrgMember",
    "auth.id in newData.ref('orgStudents.id') || auth.id in newData.ref('orgTeachers.id') || auth.id in newData.ref('orgParents.id')",
    // User is a class member
    "isClassMember",
    "auth.id in data.ref('classStudents.id') || auth.id in data.ref('classTeachers.id')",
    // User is still a class member
    "isStillClassMember",
    "auth.id in newData.ref('classStudents.id') || auth.id in newData.ref('classTeachers.id')",
    // User is an admin of the data (organization admins)
    "isAdmin",
    "auth.id in data.ref('admins.id')",
    // User is still an admin of the data
    "isStillAdmin",
    "auth.id in newData.ref('admins.id')",
    // User is a class admin
    "isClassAdmin",
    "auth.id in data.ref('classAdmins.id')",
    // User is still a class admin
    "isStillClassAdmin",
    "auth.id in newData.ref('classAdmins.id')",
];

const rules = {
    attrs: {
        allow: {
            $default: "false",
        },
    },
    $files: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && isOwner",
            update: "isAuthenticated && (data.ref('owner.id') == [] || (isOwner && isStillOwner))", // Allow update if: no owner yet (new file) OR you are the owner
            delete: "isAuthenticated && isOwner",
        },
        bind: dataBind,
    },
    $users: {
        allow: {
            view: "isAuthenticated",
            create: "false",
            update: "isAuthenticated && isOwner",
            delete: "false",
        },
        bind: dataBind,
    },
    organizations: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isOwner || isAdmin || isOrgMember)",
            update: "isAuthenticated && (isOwner || isAdmin) && (isStillOwner || isStillAdmin)",
            delete: "isAuthenticated && (isOwner || isAdmin)",
        },
        bind: dataBind,
    },
    classes: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isOwner || isClassAdmin || isClassMember)",
            update: "isAuthenticated && (isOwner || isClassAdmin) && (isStillOwner || isStillClassAdmin)",
            delete: "isAuthenticated && (isOwner || isClassAdmin)",
        },
        bind: dataBind,
    },
} satisfies InstantRules;

export default rules;
