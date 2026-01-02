/** @format */

import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";
import type { OrganizationMember } from "./organizations";

/**
 * Base class entity without any relations loaded.
 * Uses InstaQLEntity utility type matching the schema.
 */
export type BaseClass = InstaQLEntity<AppSchema, "classes">;

/**
 * Class join code entity.
 * Uses InstaQLEntity utility type matching the schema.
 */
export type ClassJoinCodeType = InstaQLEntity<AppSchema, "classJoinCodes">;

/**
 * Organization within a class context, including owner and admins.
 * Matches the query: organization: { owner: {}, admins: {} }
 */
export type OrganizationInClass = InstaQLEntity<
    AppSchema,
    "organizations",
    {
        owner: {};
        admins: {};
    }
>;

/**
 * Query shape for class with all relations loaded.
 */
type ClassQueryShape = {
    owner: {};
    classAdmins: {};
    classTeachers: {};
    classStudents: {};
    classParents: {};
    joinCodeEntity: {};
    organization: {
        owner: {};
        admins: {};
    };
};

/**
 * Class with all relations loaded as used in the class detail page.
 * Matches the query:
 * classes: {
 *   owner: {},
 *   classAdmins: {},
 *   classTeachers: {},
 *   classStudents: {},
 *   classParents: {},
 *   joinCodeEntity: {},
 *   organization: {
 *     owner: {},
 *     admins: {},
 *   },
 * }
 */
export type ClassWithRelations = InstaQLEntity<
    AppSchema,
    "classes",
    ClassQueryShape
>;

