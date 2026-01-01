/** @format */

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { id } from "@instantdb/react";
import { Loader2, Plus, GraduationCap } from "lucide-react";

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
import {
    IconUploadField,
    type IconUploadFieldRef,
} from "@/components/ui/icon-upload-field";
import { uploadIcon } from "@/lib/hooks/use-icon-upload";

// Generate a random join code (8 characters, alphanumeric, uppercase)
function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars: I, O, 0, 1
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Check if a code exists in any of the three join code fields across all classes
async function isCodeInUse(code: string): Promise<boolean> {
    const { data } = await db.queryOnce({
        classes: {
            $: {
                where: {
                    or: [
                        { joinCodeStudent: code },
                        { joinCodeTeacher: code },
                        { joinCodeParent: code },
                    ],
                },
            },
        },
    });
    return (data?.classes?.length ?? 0) > 0;
}

// Generate a unique join code that doesn't exist in any code field
async function generateUniqueJoinCode(
    existingCodes: Set<string>
): Promise<string> {
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateJoinCode();
        // Check against codes we're about to use in this batch
        if (existingCodes.has(code)) {
            continue;
        }
        // Check against codes in the database
        const inUse = await isCodeInUse(code);
        if (!inUse) {
            return code;
        }
    }
    throw new Error(
        "Failed to generate unique join code after maximum attempts"
    );
}

// Generate all three unique join codes
async function generateAllJoinCodes(): Promise<{
    joinCodeStudent: string;
    joinCodeTeacher: string;
    joinCodeParent: string;
}> {
    const usedCodes = new Set<string>();

    const joinCodeStudent = await generateUniqueJoinCode(usedCodes);
    usedCodes.add(joinCodeStudent);

    const joinCodeTeacher = await generateUniqueJoinCode(usedCodes);
    usedCodes.add(joinCodeTeacher);

    const joinCodeParent = await generateUniqueJoinCode(usedCodes);

    return { joinCodeStudent, joinCodeTeacher, joinCodeParent };
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
    const iconFieldRef = useRef<IconUploadFieldRef>(null);

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

    const onSubmit = async (data: CreateClassFormData) => {
        if (!user?.id) {
            alert("You must be signed in to create a class.");
            return;
        }

        setIsCreating(true);

        try {
            const now = new Date();
            const classId = id();
            
            // Generate unique join codes for students, teachers, and parents
            const { joinCodeStudent, joinCodeTeacher, joinCodeParent } =
                await generateAllJoinCodes();
            
            let iconUrl: string | undefined;

            // Upload icon if provided
            if (iconFile) {
                const result = await uploadIcon({
                    file: iconFile,
                    userId: user.id,
                    pathPrefix: `classes/${classId}`,
                    classId: classId,
                });

                if (result.error) {
                    throw new Error(result.error);
                }
                iconUrl = result.url;
            }

            // Create the class and link it to the owner and organization
            // The owner is automatically a class admin
            const classTx = db.tx.classes[classId]
                .create({
                    name: data.name.trim(),
                    description: data.description?.trim() || undefined,
                    icon: iconUrl,
                    joinCodeStudent,
                    joinCodeTeacher,
                    joinCodeParent,
                    organizationId,
                    created: now,
                    updated: now,
                })
                .link({ owner: user.id })
                .link({ organization: organizationId })
                .link({ classAdmins: user.id }); // Owner is always a class admin

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
        iconFieldRef.current?.reset();
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
                        Create a new class for your organization. Unique join
                        codes will be generated for students, teachers, and
                        parents.
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
                        <IconUploadField
                            ref={iconFieldRef}
                            label="Icon"
                            disabled={isCreating}
                            onFileChange={setIconFile}
                            id="class-icon"
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
