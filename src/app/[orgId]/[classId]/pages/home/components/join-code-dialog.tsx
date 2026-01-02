/** @format */

"use client";

import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { JoinCodeType, codeLabels, codeColors } from "./types";

interface JoinCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    className: string;
    selectedCodeType: JoinCodeType;
    joinCodes: {
        student: string;
        teacher: string;
        parent: string;
    };
    onCopyJoinCode: (codeType: JoinCodeType) => void;
    onOpenInNewWindow: (codeType: JoinCodeType) => void;
}

export function JoinCodeDialog({
    open,
    onOpenChange,
    className,
    selectedCodeType,
    joinCodes,
    onCopyJoinCode,
    onOpenInNewWindow,
}: JoinCodeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none! w-screen! h-screen! m-0! rounded-none! top-0! left-0! translate-x-0! translate-y-0! flex flex-col p-8!">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-center text-3xl">
                        {className}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center justify-center flex-1 gap-8 lg:gap-16">
                    {/* Join Code */}
                    <div className="flex flex-col items-center">
                        <p
                            className={cn(
                                "text-lg md:text-xl mb-3 uppercase tracking-wider font-semibold",
                                codeColors[selectedCodeType]
                            )}
                        >
                            {codeLabels[selectedCodeType]} Join Code
                        </p>
                        <div
                            className={cn(
                                "rounded-2xl border-4 bg-muted/50 px-8 py-6 md:px-16 md:py-12",
                                selectedCodeType === "student" &&
                                    "border-blue-500",
                                selectedCodeType === "teacher" &&
                                    "border-emerald-500",
                                selectedCodeType === "parent" &&
                                    "border-amber-500"
                            )}
                        >
                            <p
                                className="font-bold font-mono tracking-[0.15em] text-center"
                                style={{
                                    fontSize: "clamp(3rem, 10vw, 12rem)",
                                }}
                            >
                                {joinCodes[selectedCodeType]}
                            </p>
                        </div>
                    </div>

                    {/* Procedure Steps */}
                    <div className="flex flex-col items-start bg-muted/30 rounded-2xl p-6 md:p-10 border">
                        <p className="text-2xl md:text-3xl font-semibold mb-6">
                            How to Join
                        </p>
                        <ol className="space-y-4 text-xl md:text-2xl">
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    1
                                </span>
                                <span>
                                    Go to{" "}
                                    <span
                                        className={cn(
                                            "font-mono font-semibold",
                                            codeColors[selectedCodeType]
                                        )}
                                    >
                                        www.classclarus.com/join
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    2
                                </span>
                                <span>
                                    Input the code you see on the screen
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    3
                                </span>
                                <span>
                                    Click the{" "}
                                    <span className="font-semibold">
                                        Join Class
                                    </span>{" "}
                                    button
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span
                                    className={cn(
                                        "shrink-0 flex items-center justify-center size-10 md:size-12 rounded-full text-white font-bold text-lg md:text-xl",
                                        selectedCodeType === "student" &&
                                            "bg-blue-500",
                                        selectedCodeType === "teacher" &&
                                            "bg-emerald-500",
                                        selectedCodeType === "parent" &&
                                            "bg-amber-500"
                                    )}
                                >
                                    4
                                </span>
                                <span>All done!</span>
                            </li>
                        </ol>
                    </div>
                </div>
                <div className="flex justify-center gap-3 pt-4">
                    <Button
                        onClick={() => onCopyJoinCode(selectedCodeType)}
                        variant="outline"
                        size="lg"
                    >
                        <Copy className="size-5 mr-2" />
                        Copy Code
                    </Button>
                    <Button
                        onClick={() => onOpenInNewWindow(selectedCodeType)}
                        variant="outline"
                        size="lg"
                    >
                        <ExternalLink className="size-5 mr-2" />
                        Open in New Window
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

