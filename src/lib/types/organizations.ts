/** @format */

/**
 * User entity as returned from organization-related queries.
 * Based on $users entity from the schema with Date objects (useDateObjects: true).
 */
export type OrganizationMember = {
    id: string;
    email?: string;
    imageURL?: string;
    type?: string;
    avatarURL?: string;
    plan?: string;
    firstName?: string;
    lastName?: string;
    created?: Date;
    updated?: Date;
    polarCustomerId?: string;
    polarSubscriptionId?: string;
};

/**
 * Organization join code entity.
 */
export type OrgJoinCode = {
    id: string;
    code: string;
};

/**
 * Class join code entity.
 */
export type ClassJoinCode = {
    id: string;
    studentCode: string;
    teacherCode: string;
    parentCode: string;
};

/**
 * Base class entity.
 */
export type BaseClass = {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    created: Date;
    updated: Date;
};

/**
 * A class within an organization, including its owner and staff members.
 * Matches the query: classes: { owner: {}, classAdmins: {}, classTeachers: {} }
 */
export type OrganizationClass = BaseClass & {
    owner?: OrganizationMember;
    classAdmins: OrganizationMember[];
    classTeachers: OrganizationMember[];
};

/**
 * Base organization entity without any relations loaded.
 */
export type Organization = {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    created: Date;
    updated: Date;
};

/**
 * Organization with all relations loaded as used in the org-list query.
 * Includes owner, members (students, teachers, parents, admins),
 * join code entity, and classes with their members.
 */
export type OrganizationWithRelations = Organization & {
    owner?: OrganizationMember;
    orgStudents: OrganizationMember[];
    orgTeachers: OrganizationMember[];
    orgParents: OrganizationMember[];
    admins: OrganizationMember[];
    joinCodeEntity?: OrgJoinCode;
    classes: OrganizationClass[];
};
