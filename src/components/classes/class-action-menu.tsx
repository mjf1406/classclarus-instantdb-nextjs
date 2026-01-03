/** @format */

"use client";

import { Edit, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassActionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
    variant?: "card" | "page";
    className?: string;
}

export function ClassActionMenu({
    onEdit,
    onDelete,
    variant = "page",
    className,
}: ClassActionMenuProps) {
    const EditIcon = variant === "card" ? Pencil : Edit;
    const buttonSize = variant === "card" ? "icon-sm" : "sm";
    const wrapperClassName =
        variant === "page" ? "absolute top-4 right-4 z-0" : className || "";

    const handleEdit = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        onEdit();
    };

    const handleDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        onDelete();
    };

    return (
        <div className={wrapperClassName}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size={buttonSize as any}
                        onClick={(e) => {
                            if (variant === "card") {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }}
                    >
                        <MoreVertical className="size-4" />
                        <span className="sr-only">
                            {variant === "card" ? "More options" : "Actions"}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                        <EditIcon className="size-4" />
                        Edit
                    </DropdownMenuItem>
                    {variant === "card" && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
