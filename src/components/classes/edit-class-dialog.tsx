/** @format */

"use client";

import * as React from "react";
import { Pencil, Loader2 } from "lucide-react";

import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/components/auth/auth-provider";
import {
    IconUploadField,
    type IconUploadFieldRef,
} from "@/components/ui/icon-upload-field";
import { uploadIcon } from "@/lib/hooks/use-icon-upload";
import { db } from "@/lib/db/db";

interface EditClassDialogProps {
    classId: string;
    initialName: string;
    initialDescription?: string;
    initialIcon?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditClassDialog({
    classId,
    initialName,
    initialDescription,
    initialIcon,
    trigger,
    open,
    onOpenChange,
}: EditClassDialogProps) {
    const { user } = useAuthContext();
    const [name, setName] = React.useState(initialName);
    const [description, setDescription] = React.useState(
        initialDescription ?? ""
    );
    const [iconFile, setIconFile] = React.useState<File | null>(null);
    const [removeIcon, setRemoveIcon] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const iconFieldRef = React.useRef<IconUploadFieldRef>(null);

    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            setName(initialName);
            setDescription(initialDescription ?? "");
            setIconFile(null);
            setRemoveIcon(false);
            setError(null);
            iconFieldRef.current?.reset();
        }
    }, [open, initialName, initialDescription, initialIcon]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Class name is required");
            return;
        }

        setIsSubmitting(true);

        try {
            let iconUrl: string | undefined = undefined;

            // Upload new icon if provided
            if (iconFile && user?.id) {
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
            } else if (removeIcon) {
                // Explicitly remove icon
                iconUrl = undefined;
            } else {
                // Keep existing icon (don't update)
                iconUrl = initialIcon;
            }

            await db.transact(
                db.tx.classes[classId].update({
                    name: trimmedName,
                    description: description.trim() || undefined,
                    icon: iconUrl,
                    updated: new Date(),
                })
            );
            onOpenChange?.(false);
        } catch (err) {
            console.error("Failed to update class:", err);
            setError("Failed to update class. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Credenza
            open={open}
            onOpenChange={onOpenChange}
        >
            {trigger && <CredenzaTrigger asChild>{trigger}</CredenzaTrigger>}
            <CredenzaContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-primary" />
                            Edit Class
                        </CredenzaTitle>
                        <CredenzaDescription>
                            Update your class&apos;s name, description, and
                            icon.
                        </CredenzaDescription>
                    </CredenzaHeader>

                    <CredenzaBody className="space-y-4 py-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="class-name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="class-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter class name"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="class-description">
                                Description
                            </Label>
                            <Input
                                id="class-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a brief description (optional)"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Icon Upload */}
                        <IconUploadField
                            ref={iconFieldRef}
                            label="Icon"
                            initialPreview={initialIcon}
                            disabled={isSubmitting}
                            onFileChange={setIconFile}
                            onRemove={() => setRemoveIcon(true)}
                            size="sm"
                        />

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </CredenzaBody>

                    <CredenzaFooter className="gap-2">
                        <CredenzaClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </CredenzaClose>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
