/** @format */

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { id } from "@instantdb/react";
import { Loader2, Plus } from "lucide-react";

import { db } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";
import { EmailInput } from "@/components/organizations/email-input";
import {
    IconUploadField,
    type IconUploadFieldRef,
} from "@/components/ui/icon-upload-field";
import { uploadIcon } from "@/lib/hooks/use-icon-upload";
import { generateUniqueJoinCode } from "@/lib/helpers/join-codes";

// Zod schema for form validation
const createOrgSchema = z.object({
    name: z
        .string()
        .min(1, "Organization name is required")
        .max(100, "Name must be 100 characters or less"),
    description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;

interface CreateOrgDialogProps {
    trigger?: React.ReactNode;
}

export default function CreateOrganizationDialog({
    trigger,
}: CreateOrgDialogProps) {
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [memberEmails, setMemberEmails] = useState<string[]>([]);
    const [adminEmails, setAdminEmails] = useState<string[]>([]);
    const [memberError, setMemberError] = useState<string | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);
    const iconFieldRef = useRef<IconUploadFieldRef>(null);

    const { user } = db.useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateOrgFormData>({
        resolver: zodResolver(createOrgSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const validateEmails = (): boolean => {
        let isValid = true;

        // Check for duplicates between members and admins
        const duplicates = memberEmails.filter((email) =>
            adminEmails.includes(email)
        );
        if (duplicates.length > 0) {
            setMemberError(
                `These emails appear in both lists: ${duplicates.join(", ")}`
            );
            isValid = false;
        } else {
            setMemberError(null);
        }

        return isValid;
    };

    const onSubmit = async (data: CreateOrgFormData) => {
        if (!user?.id) {
            alert("You must be signed in to create an organization.");
            return;
        }

        if (!validateEmails()) {
            return;
        }

        setIsCreating(true);

        try {
            const now = new Date();
            const orgId = id();
            let iconUrl: string | undefined;

            // Generate unique join code
            const joinCode = await generateUniqueJoinCode();

            // Upload icon if provided
            if (iconFile) {
                const result = await uploadIcon({
                    file: iconFile,
                    userId: user.id,
                    pathPrefix: `orgs/${orgId}`,
                    organizationId: orgId,
                });

                if (result.error) {
                    throw new Error(result.error);
                }
                iconUrl = result.url;
            }

            // Create the organization and link it to the owner
            // The owner is automatically an admin (not a role-based member)
            // Note: Email invites (memberEmails, adminEmails) would need to be handled
            // by looking up user IDs from emails in production
            const orgTx = db.tx.organizations[orgId]
                .create({
                    name: data.name.trim(),
                    description: data.description?.trim() || undefined,
                    icon: iconUrl,
                    joinCode,
                    created: now,
                    updated: now,
                })
                .link({ owner: user.id })
                .link({ admins: user.id }); // Owner is always an admin

            await db.transact(orgTx);

            // Reset form and close dialog
            resetForm();
            setOpen(false);
        } catch (err) {
            console.error("Error creating organization:", err);
            const errorMessage =
                err && typeof err === "object" && "body" in err
                    ? (err.body as { message?: string })?.message
                    : err instanceof Error
                    ? err.message
                    : "Unknown error";
            alert("Failed to create organization: " + errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        reset();
        setIconFile(null);
        iconFieldRef.current?.reset();
        setMemberEmails([]);
        setAdminEmails([]);
        setMemberError(null);
        setAdminError(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        setOpen(newOpen);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="default">
                        <Plus className="size-4" />
                        Create Organization
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                        Create a new organization and invite members.
                        You&apos;ll be the owner and an admin automatically.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FieldGroup>
                        {/* Name Field */}
                        <Field data-invalid={!!errors.name}>
                            <FieldLabel htmlFor="org-name">
                                Organization Name *
                            </FieldLabel>
                            <Input
                                id="org-name"
                                placeholder="e.g., Acme Corporation"
                                disabled={isCreating}
                                aria-invalid={!!errors.name}
                                {...register("name")}
                            />
                            {errors.name && (
                                <FieldError>{errors.name.message}</FieldError>
                            )}
                        </Field>

                        {/* Description Field */}
                        <Field data-invalid={!!errors.description}>
                            <FieldLabel htmlFor="org-description">
                                Description
                            </FieldLabel>
                            <Input
                                id="org-description"
                                placeholder="What does your organization do?"
                                disabled={isCreating}
                                aria-invalid={!!errors.description}
                                {...register("description")}
                            />
                            <FieldDescription>
                                A brief description of your organization
                                (optional)
                            </FieldDescription>
                            {errors.description && (
                                <FieldError>
                                    {errors.description.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* Icon/Logo Upload Field */}
                        <IconUploadField
                            ref={iconFieldRef}
                            label="Logo"
                            disabled={isCreating}
                            onFileChange={setIconFile}
                            id="org-icon"
                        />

                        {/* Members Email Input */}
                        <EmailInput
                            label="Members"
                            emails={memberEmails}
                            onChange={setMemberEmails}
                            error={memberError ?? undefined}
                            disabled={isCreating}
                        />

                        {/* Admins Email Input */}
                        <EmailInput
                            label="Admins"
                            emails={adminEmails}
                            onChange={setAdminEmails}
                            error={adminError ?? undefined}
                            disabled={isCreating}
                        />
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Organization"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Also export the dialog with a simple trigger for convenience
export function CreateOrgButton() {
    return (
        <CreateOrganizationDialog
            trigger={
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
                </Button>
            }
        />
    );
}
