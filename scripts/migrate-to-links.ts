/** @format */

/**
 * Migration script to convert JSON array fields to InstantDB links
 * 
 * This script migrates:
 * - organizations.memberIds -> orgMembers links
 * - organizations.adminIds -> orgAdmins links
 * - classes.admins -> classAdmins links
 * - classes.teachers -> classTeachers links
 * - classes.students -> classStudents links
 * 
 * Run this after pushing the schema changes that add the new links.
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-links.ts
 */

import dbAdmin from "../src/lib/db/db-admin";

async function migrateToLinks() {
    console.log("Starting migration from JSON arrays to links...\n");

    try {
        // Fetch all organizations with their JSON array fields
        console.log("Fetching organizations...");
        const { organizations } = await dbAdmin.query({
            organizations: {},
        });

        console.log(`Found ${organizations.length} organizations`);

        // Fetch all classes with their JSON array fields
        console.log("Fetching classes...");
        const { classes } = await dbAdmin.query({
            classes: {},
        });

        console.log(`Found ${classes.length} classes\n`);

        const orgTxs: any[] = [];
        const classTxs: any[] = [];

        // Migrate organization members and admins
        for (const org of organizations) {
            // Migrate members
            const memberIds = Array.isArray(org.memberIds) ? org.memberIds : [];
            // Filter out non-string values (emails, etc.) - only migrate actual user IDs
            const validMemberIds = memberIds.filter(
                (id: any) => typeof id === "string" && id.length > 0
            );

            for (const userId of validMemberIds) {
                orgTxs.push(
                    dbAdmin.tx.organizations[org.id].link({ members: userId })
                );
            }

            // Migrate admins
            const adminIds = Array.isArray(org.adminIds) ? org.adminIds : [];
            const validAdminIds = adminIds.filter(
                (id: any) => typeof id === "string" && id.length > 0
            );

            for (const userId of validAdminIds) {
                orgTxs.push(
                    dbAdmin.tx.organizations[org.id].link({ admins: userId })
                );
            }

            if (validMemberIds.length > 0 || validAdminIds.length > 0) {
                console.log(
                    `  Org "${org.name}": ${validMemberIds.length} members, ${validAdminIds.length} admins`
                );
            }
        }

        // Migrate class admins, teachers, and students
        for (const classItem of classes) {
            // Migrate class admins
            const classAdmins = Array.isArray(classItem.admins)
                ? classItem.admins
                : [];
            const validClassAdmins = classAdmins.filter(
                (id: any) => typeof id === "string" && id.length > 0
            );

            for (const userId of validClassAdmins) {
                classTxs.push(
                    dbAdmin.tx.classes[classItem.id].link({
                        classAdmins: userId,
                    })
                );
            }

            // Migrate teachers
            const teachers = Array.isArray(classItem.teachers)
                ? classItem.teachers
                : [];
            const validTeachers = teachers.filter(
                (id: any) => typeof id === "string" && id.length > 0
            );

            for (const userId of validTeachers) {
                classTxs.push(
                    dbAdmin.tx.classes[classItem.id].link({
                        classTeachers: userId,
                    })
                );
            }

            // Migrate students
            const students = Array.isArray(classItem.students)
                ? classItem.students
                : [];
            const validStudents = students.filter(
                (id: any) => typeof id === "string" && id.length > 0
            );

            for (const userId of validStudents) {
                classTxs.push(
                    dbAdmin.tx.classes[classItem.id].link({
                        classStudents: userId,
                    })
                );
            }

            if (
                validClassAdmins.length > 0 ||
                validTeachers.length > 0 ||
                validStudents.length > 0
            ) {
                console.log(
                    `  Class "${classItem.name}": ${validClassAdmins.length} admins, ${validTeachers.length} teachers, ${validStudents.length} students`
                );
            }
        }

        // Execute all transactions
        const allTxs = [...orgTxs, ...classTxs];
        if (allTxs.length === 0) {
            console.log("\nNo links to migrate. All data may already be migrated.");
            return;
        }

        console.log(`\nExecuting ${allTxs.length} link transactions...`);
        await dbAdmin.transact(allTxs);

        console.log("\n✅ Migration completed successfully!");
        console.log(
            "\nNext steps:"
        );
        console.log("1. Verify the links were created correctly");
        console.log("2. Update application code to use the new links");
        console.log("3. Remove old JSON fields from schema (cleanup-schema step)");
    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        throw error;
    }
}

// Run migration
migrateToLinks()
    .then(() => {
        console.log("\nMigration script finished.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });

