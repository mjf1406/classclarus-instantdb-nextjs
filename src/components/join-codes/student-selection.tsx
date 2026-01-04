/** @format */

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Student {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    imageURL?: string;
    avatarURL?: string;
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
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
        if (selectedIds.size === 0) return;
        setShowConfirmDialog(true);
    };

    const confirmSubmit = () => {
        setShowConfirmDialog(false);
        onSelect(Array.from(selectedIds));
    };

    const getStudentDisplayName = (student: Student): string => {
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`;
        }
        if (student.firstName) return student.firstName;
        if (student.email) return student.email;
        return `Student ${student.id.slice(0, 8)}`;
    };

    const getStudentInitials = (student: Student): string => {
        if (student.firstName && student.lastName) {
            return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
        }
        if (student.firstName) return student.firstName[0].toUpperCase();
        if (student.email) return student.email[0].toUpperCase();
        return "?";
    };

    const getSelectedStudents = (): Student[] => {
        return students.filter((s) => selectedIds.has(s.id));
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
                    const displayName = getStudentDisplayName(student);
                    const initials = getStudentInitials(student);
                    const avatarUrl = student.imageURL || student.avatarURL || undefined;

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
                                    "flex items-center justify-center w-5 h-5 rounded border-2 transition-colors shrink-0",
                                    isSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-input"
                                )}
                            >
                                {isSelected && (
                                    <Check className="size-3.5" />
                                )}
                            </div>
                            <Avatar className="size-8 shrink-0">
                                {avatarUrl ? (
                                    <AvatarImage
                                        src={avatarUrl}
                                        alt={displayName}
                                    />
                                ) : null}
                                <AvatarFallback className="text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {displayName}
                                </p>
                                {student.email && student.firstName && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        {student.email}
                                    </p>
                                )}
                            </div>
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

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Student Selection</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please confirm that you have selected the correct student(s). You will be linked as a parent to:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 py-4">
                        {getSelectedStudents().map((student) => {
                            const displayName = getStudentDisplayName(student);
                            const initials = getStudentInitials(student);
                            const avatarUrl = student.imageURL || student.avatarURL || undefined;

                            return (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
                                >
                                    <Avatar className="size-8">
                                        {avatarUrl ? (
                                            <AvatarImage
                                                src={avatarUrl}
                                                alt={displayName}
                                            />
                                        ) : null}
                                        <AvatarFallback className="text-xs">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {displayName}
                                        </p>
                                        {student.email && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {student.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmit}>
                            Confirm and Join
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

