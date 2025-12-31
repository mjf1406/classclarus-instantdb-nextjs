/** @format */

"use client";

import { useState } from "react";
import { id } from "@instantdb/react";

import { db } from "@/lib/db/db";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CreateClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    myOrg?: { id: string } | null;
}

export function CreateClassDialog({
    open,
    onOpenChange,
    myOrg,
}: CreateClassDialogProps) {
    const { user } = useUser();
    const [className, setClassName] = useState("");
    const [classDescription, setClassDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateClass = async () => {
        if (!user?.id) {
            alert("You must be signed in to create a class.");
            return;
        }

        if (!className.trim()) {
            alert("Please enter a class name.");
            return;
        }

        setIsCreating(true);

        try {
            const now = new Date();
            const orgId = myOrg?.id || id();

            // Create "My Org" if it doesn't exist
            const orgTxs = [];
            if (!myOrg) {
                orgTxs.push(
                    db.tx.organizations[orgId].create({
                        name: "My Org",
                        created: now,
                        updated: now,
                        memberIds: [user.id],
                        adminIds: [user.id],
                    })
                );
            }

            // Create the class and link it to user and organization
            const classId = id();
            const classTx = db.tx.classes[classId]
                .create({
                    name: className.trim(),
                    description: classDescription.trim() || undefined,
                    created: now,
                    updated: now,
                })
                .link({ user: user.id })
                .link({ organization: orgId });

            // Execute all transactions
            db.transact([...orgTxs, classTx]);

            // Reset form and close dialog
            setClassName("");
            setClassDescription("");
            onOpenChange(false);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isCreating && className.trim()) {
            e.preventDefault();
            handleCreateClass();
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
                        Create a new class in My Org. You can add a name and
                        optional description.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="org-name"
                            className="text-sm font-medium"
                        >
                            Organization
                        </label>
                        <Input
                            id="org-name"
                            value="My Org"
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            All classes are created in My Org
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="class-name"
                            className="text-sm font-medium"
                        >
                            Class Name *
                        </label>
                        <Input
                            id="class-name"
                            placeholder="e.g., Mathematics 101"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isCreating}
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="class-description"
                            className="text-sm font-medium"
                        >
                            Description (optional)
                        </label>
                        <Input
                            id="class-description"
                            placeholder="Add a description for your class"
                            value={classDescription}
                            onChange={(e) =>
                                setClassDescription(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={isCreating}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateClass}
                        disabled={isCreating || !className.trim()}
                    >
                        {isCreating ? "Creating..." : "Create Class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
