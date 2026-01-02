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

interface EditOrgDialogProps {
    organizationId: string;
    initialName: string;
    initialDescription?: string;
    initialIcon?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditOrgDialog({
    organizationId,
    initialName,
    initialDescription,
    initialIcon,
    trigger,
    open,
    onOpenChange,
}: EditOrgDialogProps) {
    const { user } = useAuthContext();
    const [name, setName] = React.useState(initialName);
    const [description, setDescription] = React.useState(
        initialDescription ?? ""
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Icon state
    const [iconFile, setIconFile] = React.useState<File | null>(null);
    const [iconRemoved, setIconRemoved] = React.useState(false);
    const iconFieldRef = React.useRef<IconUploadFieldRef>(null);

    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            setName(initialName);
            setDescription(initialDescription ?? "");
            setIconFile(null);
            setIconRemoved(false);
            setError(null);
            iconFieldRef.current?.reset();
        }
    }, [open, initialName, initialDescription, initialIcon]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Organization name is required");
            return;
        }

        setIsSubmitting(true);

        try {
            let iconUrl: string | undefined = initialIcon;

            // Upload new icon if provided
            if (iconFile && user?.id) {
                const result = await uploadIcon({
                    file: iconFile,
                    userId: user.id,
                    pathPrefix: `orgs/${organizationId}`,
                    organizationId: organizationId,
                });

                if (result.error) {
                    throw new Error(result.error);
                }
                iconUrl = result.url;
            } else if (iconRemoved) {
                // Icon was removed
                iconUrl = undefined;
            }

            await db.transact(
                db.tx.organizations[organizationId].update({
                    name: trimmedName,
                    description: description.trim() || undefined,
                    icon: iconUrl,
                    updated: new Date(),
                })
            );
            onOpenChange?.(false);
        } catch (err) {
            console.error("Failed to update organization:", err);
            setError("Failed to update organization. Please try again.");
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
                            Edit Organization
                        </CredenzaTitle>
                        <CredenzaDescription>
                            Update your organization&apos;s details.
                        </CredenzaDescription>
                    </CredenzaHeader>

                    <CredenzaBody className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter organization name"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-description">Description</Label>
                            <Input
                                id="org-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a brief description (optional)"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Icon/Logo Upload Field */}
                        <IconUploadField
                            ref={iconFieldRef}
                            label="Logo"
                            initialPreview={initialIcon}
                            disabled={isSubmitting}
                            onFileChange={setIconFile}
                            onRemove={() => setIconRemoved(true)}
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
