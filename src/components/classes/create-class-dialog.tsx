/** @format */

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { id } from "@instantdb/react";
import { Loader2, Upload, ImageIcon, Plus, X, GraduationCap } from "lucide-react";

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
import { cn } from "@/lib/utils";

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Generate a random join code (6 characters, alphanumeric, uppercase)
function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars: I, O, 0, 1
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Zod schema for form validation
const createClassSchema = z.object({
    name: z
        .string()
        .min(1, "Class name is required")
        .max(100, "Name must be 100 characters or less"),
    description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
});

type CreateClassFormData = z.infer<typeof createClassSchema>;

interface CreateClassDialogProps {
    organizationId: string;
    trigger?: React.ReactNode;
}

export default function CreateClassDialog({
    organizationId,
    trigger,
}: CreateClassDialogProps) {
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [iconError, setIconError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = db.useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateClassFormData>({
        resolver: zodResolver(createClassSchema),
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

    const onSubmit = async (data: CreateClassFormData) => {
        if (!user?.id) {
            alert("You must be signed in to create a class.");
            return;
        }

        setIsCreating(true);

        try {
            const now = new Date();
            const classId = id();
            const joinCode = generateJoinCode();
            let iconUrl: string | undefined;

            // Upload icon if provided
            if (iconFile) {
                const fileName = `classes/${classId}/icon-${Date.now()}.${iconFile.name
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

            // Create the class and link it to the owner and organization
            const classTx = db.tx.classes[classId]
                .create({
                    name: data.name.trim(),
                    description: data.description?.trim() || undefined,
                    icon: iconUrl,
                    joinCode,
                    organizationId,
                    created: now,
                    updated: now,
                })
                .link({ owner: user.id })
                .link({ organization: organizationId });

            await db.transact(classTx);

            // Reset form and close dialog
            resetForm();
            setOpen(false);
        } catch (err) {
            console.error("Error creating class:", err);
            const errorMessage =
                err && typeof err === "object" && "body" in err
                    ? (err.body as { message?: string })?.message
                    : err instanceof Error
                    ? err.message
                    : "Unknown error";
            alert("Failed to create class: " + errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        reset();
        setIconFile(null);
        setIconPreview(null);
        setIconError(null);
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
                    <Button size="sm">
                        <Plus className="size-4" />
                        Add Class
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="size-5" />
                        Create New Class
                    </DialogTitle>
                    <DialogDescription>
                        Create a new class for your organization. Students can
                        join using the generated join code.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FieldGroup>
                        {/* Name Field */}
                        <Field data-invalid={!!errors.name}>
                            <FieldLabel htmlFor="class-name">
                                Class Name *
                            </FieldLabel>
                            <Input
                                id="class-name"
                                placeholder="e.g., Math 101, Biology A"
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
                            <FieldLabel htmlFor="class-description">
                                Description
                            </FieldLabel>
                            <Input
                                id="class-description"
                                placeholder="What is this class about?"
                                disabled={isCreating}
                                aria-invalid={!!errors.description}
                                {...register("description")}
                            />
                            <FieldDescription>
                                A brief description of the class (optional)
                            </FieldDescription>
                            {errors.description && (
                                <FieldError>
                                    {errors.description.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* Icon/Logo Upload Field */}
                        <Field data-invalid={!!iconError}>
                            <FieldLabel htmlFor="class-icon">
                                Class Icon
                            </FieldLabel>
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
                                                alt="Class icon preview"
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
                                            ? "Change Icon"
                                            : "Upload Icon"}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        id="class-icon"
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
                                "Create Class"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Also export the dialog with a simple trigger for convenience
export function CreateClassButton({
    organizationId,
}: {
    organizationId: string;
}) {
    return (
        <CreateClassDialog
            organizationId={organizationId}
            trigger={
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Class
                </Button>
            }
        />
    );
}