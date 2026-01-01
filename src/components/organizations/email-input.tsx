/** @format */

"use client";

import { useState, KeyboardEvent, ClipboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldDescription,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface EmailInputProps {
    label: string;
    emails: string[];
    onChange: (emails: string[]) => void;
    error?: string;
    disabled?: boolean;
}

export function EmailInput({
    label,
    emails,
    onChange,
    error,
    disabled,
}: EmailInputProps) {
    const [inputValue, setInputValue] = useState("");

    const parseEmails = (text: string): string[] => {
        // Split by comma, space, or newline, then trim and filter empty
        return text
            .split(/[,\s\n]+/)
            .map((email) => email.trim())
            .filter((email) => email.length > 0);
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const addEmails = (newEmails: string[]) => {
        const validEmails = newEmails.filter(
            (email) => isValidEmail(email) && !emails.includes(email)
        );
        if (validEmails.length > 0) {
            onChange([...emails, ...validEmails]);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (inputValue.trim()) {
                addEmails([inputValue.trim()]);
                setInputValue("");
            }
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const parsedEmails = parseEmails(pastedText);
        if (parsedEmails.length > 0) {
            addEmails(parsedEmails);
            setInputValue("");
        }
    };

    const removeEmail = (emailToRemove: string) => {
        onChange(emails.filter((email) => email !== emailToRemove));
    };

    return (
        <Field data-invalid={!!error}>
            <FieldLabel>{label}</FieldLabel>
            <div
                className={cn(
                    "flex min-h-9 w-full flex-wrap gap-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    error && "border-destructive ring-destructive/20",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                {emails.map((email) => (
                    <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-sm"
                    >
                        <span>{email}</span>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => removeEmail(email)}
                                className="ml-1 rounded-sm hover:bg-muted-foreground/20"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </span>
                ))}
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={
                        emails.length === 0
                            ? "Enter email and press Enter, or paste multiple emails"
                            : ""
                    }
                    disabled={disabled}
                    className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <FieldError errors={error ? [{ message: error }] : undefined} />
            <FieldDescription>
                Press Enter to add, or paste multiple emails separated by commas,
                spaces, or new lines
            </FieldDescription>
        </Field>
    );
}

