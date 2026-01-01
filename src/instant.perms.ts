/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const dataBind = [
    // Authenticated user
    "isAuthenticated",
    "auth.id != null",
    // User is the owner of the data
    "isOwner",
    "data.owner == auth.id",
    // User is a premium user
    "isPremium",
    "auth.ref('$user.profile.plan').exists(p, p in ['basic', 'plus', 'pro'])",
    // User is a member of the data
    "isMember",
    "auth.id in data.memberIds",
    // User is still a member of the data
    "isStillMember",
    "auth.id in newData.memberIds",
    // User is an admin of the data
    "isAdmin",
    "auth.id in data.adminIds",
    // User is still an admin of the data
    "isStillAdmin",
    "auth.id in newData.adminIds",
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
            update: "isAuthenticated && isOwner",
            delete: "isAuthenticated && isOwner",
        },
        bind: dataBind,
    },
    $users: {
        allow: {
            view: "isAuthenticated && auth.id == data.id",
            create: "false",
            update: "isAuthenticated && auth.id == data.id",
            delete: "false",
        },
        bind: dataBind,
    },
    organizations: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isMember || isAdmin)",
            update: "isAuthenticated && isAdmin",
            delete: "isAuthenticated && isAdmin",
        },
        bind: dataBind,
    },
    classes: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isOwner || isMember || isAdmin)",
            update: "isAuthenticated && (isOwner || isAdmin)",
            delete: "isAuthenticated && (isOwner || isAdmin)",
        },
        bind: dataBind,
    },
} satisfies InstantRules;

export default rules;
