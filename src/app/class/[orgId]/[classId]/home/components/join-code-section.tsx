/** @format */

"use client";

import { Check, Copy, ExternalLink, Fullscreen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { JoinCodeType, codeLabels, codeColors } from "../types";

interface JoinCodeSectionProps {
    joinCodes: {
        student: string;
        teacher: string;
        parent: string;
    } | null;
    selectedCodeType: JoinCodeType;
    isRevealed: boolean;
    copied: JoinCodeType | null;
    onSelectCodeType: (type: JoinCodeType) => void;
    onRevealCode: () => void;
    onCopyJoinCode: (codeType: JoinCodeType) => void;
    onOpenFullscreen: () => void;
    onOpenInNewWindow: (codeType: JoinCodeType) => void;
}

export function JoinCodeSection({
    joinCodes,
    selectedCodeType,
    isRevealed,
    copied,
    onSelectCodeType,
    onRevealCode,
    onCopyJoinCode,
    onOpenFullscreen,
    onOpenInNewWindow,
}: JoinCodeSectionProps) {
    if (!joinCodes) return null;

    return (
        <div className="space-y-2">
            {/* Code type tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                {(["student", "teacher", "parent"] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => onSelectCodeType(type)}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                            selectedCodeType === type
                                ? "bg-background shadow-sm"
                                : "hover:bg-background/50 text-muted-foreground"
                        )}
                    >
                        <span className={codeColors[type]}>
                            {codeLabels[type]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Selected code display */}
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => {
                                if (!isRevealed) {
                                    onRevealCode();
                                } else {
                                    onCopyJoinCode(selectedCodeType);
                                }
                            }}
                            className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 transition-colors hover:bg-muted group relative overflow-hidden"
                        >
                            <span
                                className={cn(
                                    "text-sm transition-colors",
                                    codeColors[selectedCodeType]
                                )}
                            >
                                {codeLabels[selectedCodeType]} Code
                            </span>
                            <span className="flex items-center gap-2 font-mono text-lg font-bold relative">
                                <span
                                    className={cn(
                                        "transition-all duration-500 ease-out",
                                        !isRevealed && "blur-sm select-none"
                                    )}
                                >
                                    {joinCodes[selectedCodeType]}
                                </span>
                                {!isRevealed && (
                                    <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                                        Click to reveal
                                    </span>
                                )}
                                {isRevealed &&
                                    (copied === selectedCodeType ? (
                                        <Check className="size-4 text-green-500" />
                                    ) : (
                                        <Copy className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    ))}
                            </span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {!isRevealed
                            ? "Click to reveal code"
                            : copied === selectedCodeType
                            ? "Copied!"
                            : "Click to copy join code"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onOpenFullscreen();
                            }}
                            className="h-10 w-10"
                        >
                            <Fullscreen className="size-4" />
                            <span className="sr-only">Fullscreen</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>View in fullscreen</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onOpenInNewWindow(selectedCodeType);
                            }}
                            className="h-10 w-10"
                        >
                            <ExternalLink className="size-4" />
                            <span className="sr-only">Open in new window</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open in new window</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
