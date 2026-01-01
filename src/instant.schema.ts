/** @format */

// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
        }),
        $users: i.entity({
            // System Columns
            email: i.string().unique().indexed().optional(),
            imageURL: i.string().optional(),
            type: i.string().optional(),
            // Custom Columns
            avatarURL: i.string().optional(),
            plan: i.string().optional(),
            firstName: i.string().optional(),
            lastName: i.string().optional(),
            created: i.date().optional(),
            updated: i.date().optional(),
            // Billing fields (updated via Polar webhook)
            polarCustomerId: i.string().indexed().optional(),
            polarSubscriptionId: i.string().optional(),
        }),
        organizations: i.entity({
            name: i.string().indexed(),
            description: i.string().optional(),
            icon: i.string().optional(),
            memberIds: i.json().optional(), // array of user ids
            adminIds: i.json().optional(), // array of user ids
            created: i.date(),
            updated: i.date(),
        }),
        classes: i.entity({
            name: i.string(),
            description: i.string().optional(),
            icon: i.string().optional(),
            joinCode: i.string().unique().indexed(),
            organizationId: i.string().indexed().optional(),
            created: i.date(),
            updated: i.date(),
        }),
    },
    links: {
        userClasses: {
            forward: {
                on: "classes",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            }, // Each class has one owner who created it, which is a user id
            reverse: {
                on: "$users",
                has: "many",
                label: "classes",
            }, // Each user can have many classes
        },
        userOrganizations: {
            forward: {
                on: "organizations",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            }, // Each organization has one owner who created it, which is a user id
            reverse: {
                on: "$users",
                has: "many",
                label: "organizations",
            }, // Each user can have many organizations
        },
        classOrganization: {
            forward: {
                on: "classes",
                has: "one",
                label: "organization",
                onDelete: "cascade",
            }, // Each class has one organization
            reverse: {
                on: "organizations",
                has: "many",
                label: "classes",
            }, // Each organization can have many classes
        },
        userFiles: {
            forward: {
                on: "$files",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            }, // Each file has one owner, which is a user id
            reverse: {
                on: "$users",
                has: "many",
                label: "files",
            }, // Each user can have many files
        },
    },
    rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
