/** @format */

"use client";

import { ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasteCodeButtonProps {
    onPaste: (code: string) => void;
    codeLength: number;
    codeType?: "numeric" | "alphanumeric";
    disabled?: boolean;
    className?: string;
    buttonText?: string;
}

export function PasteCodeButton({
    onPaste,
    codeLength,
    codeType = "numeric",
    disabled = false,
    className,
    buttonText = "Paste Code",
}: PasteCodeButtonProps) {
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            let extractedCode: string;

            if (codeType === "numeric") {
                // Extract only digits
                extractedCode = text.replace(/\D/g, "").slice(0, codeLength);
            } else {
                // Extract alphanumeric characters and convert to uppercase
                extractedCode = text
                    .replace(/[^A-Za-z0-9]/g, "")
                    .toUpperCase()
                    .slice(0, codeLength);
            }

            if (extractedCode.length === codeLength) {
                onPaste(extractedCode);
            } else {
                alert(
                    `No valid ${codeLength}-${
                        codeType === "numeric" ? "digit" : "character"
                    } code found in clipboard`
                );
            }
        } catch (err) {
            alert("Failed to read from clipboard");
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handlePaste}
            className={cn("w-full", className)}
            disabled={disabled}
        >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            {buttonText}
        </Button>
    );
}

