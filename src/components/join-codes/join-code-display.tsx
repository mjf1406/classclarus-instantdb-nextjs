/** @format */

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JoinCodeDisplayProps {
    code: string;
    label?: string;
    size?: "sm" | "default" | "lg";
    className?: string;
}

export function JoinCodeDisplay({
    code,
    label,
    size = "default",
    className,
}: JoinCodeDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy join code:", err);
        }
    };

    const sizeClasses = {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {label && (
                <span
                    className={cn(
                        "font-medium text-muted-foreground",
                        sizeClasses[size]
                    )}
                >
                    {label}:
                </span>
            )}
            <code
                className={cn(
                    "font-mono font-semibold tracking-wider bg-muted px-3 py-1.5 rounded-md",
                    sizeClasses[size]
                )}
            >
                {code}
            </code>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                className="shrink-0"
                aria-label={copied ? "Copied!" : "Copy join code"}
            >
                {copied ? (
                    <Check className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                    <Copy className="size-4" />
                )}
            </Button>
        </div>
    );
}

