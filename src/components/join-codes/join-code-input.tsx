/** @format */

"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface JoinCodeInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    disabled?: boolean;
    error?: string;
    label?: string;
    placeholder?: string;
    description?: string;
    className?: string;
}

export function JoinCodeInput({
    value,
    onChange,
    onSubmit,
    disabled = false,
    error,
    label = "Join Code",
    placeholder = "Enter 6-character code",
    description,
    className,
}: JoinCodeInputProps) {
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Auto-uppercase and limit to 6 characters
        const newValue = e.target.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6);
        setLocalValue(newValue);
        onChange(newValue);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSubmit && localValue.length === 6) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <Field
            data-invalid={!!error}
            className={className}
        >
            {label && (
                <FieldLabel htmlFor="join-code-input">
                    {label}
                </FieldLabel>
            )}
            <Input
                id="join-code-input"
                type="text"
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder}
                maxLength={6}
                className={cn(
                    "font-mono tracking-widest text-center text-lg",
                    error && "aria-invalid"
                )}
                aria-invalid={!!error}
            />
            {description && !error && (
                <FieldDescription>{description}</FieldDescription>
            )}
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}

