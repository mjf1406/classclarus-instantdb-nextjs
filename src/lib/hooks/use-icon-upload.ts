/** @format */

import { db } from "@/lib/db/db";

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface IconValidationResult {
    isValid: boolean;
    error: string | null;
}

export function validateIconFile(file: File): IconValidationResult {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: "Only JPG, PNG, WEBP, or AVIF files are allowed",
        };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: "File size must be less than 5MB",
        };
    }

    return { isValid: true, error: null };
}

export interface UploadIconOptions {
    file: File;
    userId: string;
    /** Path prefix for the file, e.g., "orgs/123" or "classes/456" */
    pathPrefix: string;
    /** Organization ID to link the file to (for org icons) */
    organizationId?: string;
    /** Class ID to link the file to (for class icons) */
    classId?: string;
}

export interface UploadIconResult {
    url: string | undefined;
    fileId: string | undefined;
    error: string | null;
}

/**
 * Uploads an icon file to InstantDB storage, links it to the user as owner
 * and optionally to an organization or class, then returns the URL.
 */
export async function uploadIcon({
    file,
    userId,
    pathPrefix,
    organizationId,
    classId,
}: UploadIconOptions): Promise<UploadIconResult> {
    try {
        const fileName = `${pathPrefix}/icon-${Date.now()}.${file.name
            .split(".")
            .pop()}`;

        const uploadResult = await db.storage.uploadFile(fileName, file);

        const fileId = uploadResult.data?.id;
        if (!fileId) {
            return {
                url: undefined,
                fileId: undefined,
                error: "Failed to upload file - no file ID returned",
            };
        }

        // Build the link transaction - always link to owner
        let linkTx = db.tx.$files[fileId].link({ owner: userId });
        let linkOrgClass;

        // Additionally link to organization if provided
        if (organizationId) {
            linkOrgClass = db.tx.$files[fileId].link({
                organization: organizationId,
            });
        }
        // Additionally link to class if provided
        if (classId) {
            linkOrgClass = db.tx.$files[fileId].link({ class: classId });
        }

        if (linkOrgClass) {
            await db.transact([linkTx, linkOrgClass]);
        } else {
            await db.transact(linkTx);
        }

        // Fetch the URL from the database
        const { data: fileData } = await db.queryOnce({
            $files: {
                $: { where: { id: fileId } },
            },
        });

        const url = fileData?.$files?.[0]?.url;

        return {
            url,
            fileId,
            error: null,
        };
    } catch (err) {
        console.error("Error uploading icon:", err);
        return {
            url: undefined,
            fileId: undefined,
            error: err instanceof Error ? err.message : "Failed to upload icon",
        };
    }
}
