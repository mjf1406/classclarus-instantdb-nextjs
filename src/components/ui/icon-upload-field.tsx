/** @format */

"use client";

import * as React from "react";
import { Upload, ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateIconFile } from "@/lib/hooks/use-icon-upload";

export interface IconUploadFieldRef {
    /** Reset the field to its initial state */
    reset: () => void;
    /** Get the currently selected file */
    getFile: () => File | null;
}

export interface IconUploadFieldProps {
    /** Label for the field */
    label?: string;
    /** Initial preview URL (for edit dialogs) */
    initialPreview?: string | null;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Callback when file changes */
    onFileChange?: (file: File | null) => void;
    /** Callback when icon is explicitly removed (not just changed) */
    onRemove?: () => void;
    /** Preview size - "sm" (64px) or "md" (80px) */
    size?: "sm" | "md";
    /** ID for the input element */
    id?: string;
}

export const IconUploadField = React.forwardRef<
    IconUploadFieldRef,
    IconUploadFieldProps
>(
    (
        {
            label = "Icon",
            initialPreview = null,
            disabled = false,
            onFileChange,
            onRemove,
            size = "md",
            id,
        },
        ref
    ) => {
        const [file, setFile] = React.useState<File | null>(null);
        const [preview, setPreview] = React.useState<string | null>(
            initialPreview
        );
        const [error, setError] = React.useState<string | null>(null);
        const fileInputRef = React.useRef<HTMLInputElement>(null);

        // Reset preview when initialPreview changes (e.g., dialog reopens)
        React.useEffect(() => {
            setPreview(initialPreview);
            setFile(null);
            setError(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, [initialPreview]);

        // Expose methods to parent via ref
        React.useImperativeHandle(ref, () => ({
            reset: () => {
                setFile(null);
                setPreview(initialPreview);
                setError(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
            getFile: () => file,
        }));

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            setError(null);

            if (!selectedFile) {
                setFile(null);
                setPreview(initialPreview);
                onFileChange?.(null);
                return;
            }

            const validation = validateIconFile(selectedFile);
            if (!validation.isValid) {
                setError(validation.error);
                setFile(null);
                setPreview(initialPreview);
                onFileChange?.(null);
                return;
            }

            setFile(selectedFile);
            onFileChange?.(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        };

        const handleRemove = () => {
            setFile(null);
            setPreview(null);
            setError(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onFileChange?.(null);
            onRemove?.();
        };

        const sizeClasses = size === "sm" ? "h-16 w-16" : "h-20 w-20";
        const iconSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

        return (
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
                <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div
                        className={cn(
                            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                            sizeClasses,
                            preview
                                ? "border-primary bg-muted"
                                : "border-muted-foreground/25 bg-muted/50",
                            error && "border-destructive"
                        )}
                    >
                        {preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt={`${label} preview`}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-md transition-transform hover:scale-110"
                                    disabled={disabled}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </>
                        ) : (
                            <ImageIcon
                                className={cn(
                                    "text-muted-foreground/50",
                                    iconSize
                                )}
                            />
                        )}
                    </div>

                    {/* Upload button */}
                    <div className="flex flex-1 flex-col gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {preview ? `Change ${label}` : `Upload ${label}`}
                        </Button>
                        <input
                            ref={fileInputRef}
                            id={id}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.avif"
                            onChange={handleFileChange}
                            disabled={disabled}
                            className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG, WEBP, or AVIF. Max 5MB.
                        </p>
                    </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        );
    }
);

IconUploadField.displayName = "IconUploadField";
