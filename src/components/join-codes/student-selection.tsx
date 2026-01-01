/** @format */

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Student {
    id: string;
    email?: string;
}

interface StudentSelectionProps {
    students: Student[];
    onSelect: (selectedIds: string[]) => void;
    isLoading?: boolean;
    className?: string;
}

export function StudentSelection({
    students,
    onSelect,
    isLoading = false,
    className,
}: StudentSelectionProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleStudent = (studentId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        const allIds = new Set(students.map((s) => s.id));
        setSelectedIds(allIds);
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleSubmit = () => {
        onSelect(Array.from(selectedIds));
    };

    if (students.length === 0) {
        return (
            <div className={cn("text-center py-8", className)}>
                <p className="text-muted-foreground">
                    No students found in this class.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Select Students to Link
                </h3>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAll}
                        disabled={isLoading}
                    >
                        Select All
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={deselectAll}
                        disabled={isLoading}
                    >
                        Deselect All
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                {students.map((student) => {
                    const isSelected = selectedIds.has(student.id);
                    return (
                        <button
                            key={student.id}
                            type="button"
                            onClick={() => toggleStudent(student.id)}
                            disabled={isLoading}
                            className={cn(
                                "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent transition-colors",
                                isSelected && "bg-accent"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center w-5 h-5 rounded border-2 transition-colors",
                                    isSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-input"
                                )}
                            >
                                {isSelected && (
                                    <Check className="size-3.5" />
                                )}
                            </div>
                            <span className="flex-1">
                                {student.email || `Student ${student.id.slice(0, 8)}`}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSubmit}
                    disabled={selectedIds.size === 0 || isLoading}
                >
                    {isLoading ? "Linking..." : `Link ${selectedIds.size} Student${selectedIds.size !== 1 ? "s" : ""}`}
                </Button>
            </div>
        </div>
    );
}

