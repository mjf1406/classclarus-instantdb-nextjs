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
import { db } from "@/lib/db/db";

interface EditOrgDialogProps {
    organizationId: string;
    initialName: string;
    initialDescription?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditOrgDialog({
    organizationId,
    initialName,
    initialDescription,
    trigger,
    open,
    onOpenChange,
}: EditOrgDialogProps) {
    const [name, setName] = React.useState(initialName);
    const [description, setDescription] = React.useState(
        initialDescription ?? ""
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            setName(initialName);
            setDescription(initialDescription ?? "");
            setError(null);
        }
    }, [open, initialName, initialDescription]);

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
            await db.transact(
                db.tx.organizations[organizationId].update({
                    name: trimmedName,
                    description: description.trim() || undefined,
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
        <Credenza open={open} onOpenChange={onOpenChange}>
            {trigger && <CredenzaTrigger asChild>{trigger}</CredenzaTrigger>}
            <CredenzaContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-primary" />
                            Edit Organization
                        </CredenzaTitle>
                        <CredenzaDescription>
                            Update your organization&apos;s name and
                            description.
                        </CredenzaDescription>
                    </CredenzaHeader>

                    <CredenzaBody className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">
                                Name{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter organization name"
                                disabled={isSubmitting}
                                autoFocus
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
                        <Button type="submit" disabled={isSubmitting}>
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

