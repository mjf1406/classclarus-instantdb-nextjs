/** @format */

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { id } from "@instantdb/react";
import { Loader2, Upload, ImageIcon, Plus, X } from "lucide-react";

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
import { cn } from "@/lib/utils";

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [iconError, setIconError] = useState<string | null>(null);
    const [memberEmails, setMemberEmails] = useState<string[]>([]);
    const [adminEmails, setAdminEmails] = useState<string[]>([]);
    const [memberError, setMemberError] = useState<string | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const user = db.useUser();

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

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setIconError(null);

        if (!file) {
            setIconFile(null);
            setIconPreview(null);
            return;
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setIconError("Only JPG, PNG, WEBP, or AVIF files are allowed");
            setIconFile(null);
            setIconPreview(null);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setIconError("File size must be less than 5MB");
            setIconFile(null);
            setIconPreview(null);
            return;
        }

        setIconFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setIconPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeIcon = () => {
        setIconFile(null);
        setIconPreview(null);
        setIconError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

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

            // Upload icon if provided
            if (iconFile) {
                const fileName = `orgs/${orgId}/icon-${Date.now()}.${iconFile.name
                    .split(".")
                    .pop()}`;
                const uploadResult = await db.storage.uploadFile(
                    fileName,
                    iconFile
                );

                // Get the file ID from the upload result and fetch the URL
                const fileId = uploadResult.data?.id;
                if (fileId) {
                    const { data: fileData } = await db.queryOnce({
                        $files: {
                            $: { where: { id: fileId } },
                        },
                    });
                    iconUrl = fileData?.$files?.[0]?.url;
                }
            }

            // Prepare member and admin IDs
            // For now, we store emails directly - in production you'd want to look up user IDs
            // The current user is automatically included as an admin
            const allAdminIds = [user.id]; // Owner is always an admin
            const allMemberIds = [user.id]; // Owner is always a member

            // Create the organization and link it to the owner
            const orgTx = db.tx.organizations[orgId]
                .create({
                    name: data.name.trim(),
                    description: data.description?.trim() || undefined,
                    icon: iconUrl,
                    memberIds: [...allMemberIds, ...memberEmails], // Store emails for pending invites
                    adminIds: [...allAdminIds, ...adminEmails], // Store emails for pending invites
                    created: now,
                    updated: now,
                })
                .link({ owner: user.id });

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
        setIconPreview(null);
        setIconError(null);
        setMemberEmails([]);
        setAdminEmails([]);
        setMemberError(null);
        setAdminError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                        <Field data-invalid={!!iconError}>
                            <FieldLabel htmlFor="org-icon">Logo</FieldLabel>
                            <div className="flex items-start gap-4">
                                {/* Preview */}
                                <div
                                    className={cn(
                                        "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                                        iconPreview
                                            ? "border-primary bg-muted"
                                            : "border-muted-foreground/25 bg-muted/50",
                                        iconError && "border-destructive"
                                    )}
                                >
                                    {iconPreview ? (
                                        <>
                                            <img
                                                src={iconPreview}
                                                alt="Organization logo preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeIcon}
                                                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-md transition-transform hover:scale-110"
                                                disabled={isCreating}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                    )}
                                </div>

                                {/* Upload button */}
                                <div className="flex flex-1 flex-col gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isCreating}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {iconFile
                                            ? "Change Logo"
                                            : "Upload Logo"}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        id="org-icon"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,.avif"
                                        onChange={handleIconChange}
                                        disabled={isCreating}
                                        className="hidden"
                                    />
                                    <FieldDescription>
                                        JPG, PNG, WEBP, or AVIF. Max 5MB.
                                    </FieldDescription>
                                </div>
                            </div>
                            {iconError && <FieldError>{iconError}</FieldError>}
                        </Field>

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
