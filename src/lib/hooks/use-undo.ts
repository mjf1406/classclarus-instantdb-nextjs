/** @format */

"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { db } from "@/lib/instant";

export type UndoAction =
    | { type: "delete"; entityType: string; entityId: string; data: any }
    | {
          type: "update";
          entityType: string;
          entityId: string;
          previousData: any;
      }
    | { type: "create"; entityType: string; entityId: string }
    | {
          type: "link";
          entityType: string;
          entityId: string;
          linkLabel: string;
          targetIds: string[];
      }
    | {
          type: "unlink";
          entityType: string;
          entityId: string;
          linkLabel: string;
          targetIds: string[];
      };

interface UndoState {
    action: UndoAction;
    message: string;
    toastId: string | number;
}

export function useUndo() {
    const [undoState, setUndoState] = useState<UndoState | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearUndo = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (undoState) {
            toast.dismiss(undoState.toastId);
        }
        setUndoState(null);
    }, [undoState]);

    const executeUndo = useCallback(async (action: UndoAction) => {
        try {
            switch (action.type) {
                case "delete": {
                    // Restore deleted entity with same ID
                    const { entityType, entityId, data } = action;
                    const entity = entityType as keyof typeof db.tx;
                    // ID is specified in transaction path, not in data
                    const restoreData = { ...data };
                    delete restoreData.id; // Remove id from data if present
                    const tx = (db.tx[entity] as any)[entityId].create(
                        restoreData
                    );
                    await db.transact(tx);
                    toast.success("Action undone", {
                        description: `${entityType} restored`,
                    });
                    break;
                }
                case "update": {
                    // Restore previous values
                    const { entityType, entityId, previousData } = action;
                    const entity = entityType as keyof typeof db.tx;
                    const tx = (db.tx[entity] as any)[entityId].update(
                        previousData
                    );
                    await db.transact(tx);
                    toast.success("Action undone", {
                        description: `${entityType} restored to previous values`,
                    });
                    break;
                }
                case "create": {
                    // Delete created entity
                    const { entityType, entityId } = action;
                    const entity = entityType as keyof typeof db.tx;
                    const tx = (db.tx[entity] as any)[entityId].delete();
                    await db.transact(tx);
                    toast.success("Action undone", {
                        description: `${entityType} removed`,
                    });
                    break;
                }
                case "link": {
                    // Unlink what was linked
                    const { entityType, entityId, linkLabel, targetIds } =
                        action;
                    const entity = entityType as keyof typeof db.tx;
                    const unlinkMap: Record<string, string[]> = {
                        [linkLabel]: targetIds,
                    };
                    const tx = (db.tx[entity] as any)[entityId].unlink(
                        unlinkMap
                    );
                    await db.transact(tx);
                    toast.success("Action undone", {
                        description: "Link removed",
                    });
                    break;
                }
                case "unlink": {
                    // Link what was unlinked
                    const { entityType, entityId, linkLabel, targetIds } =
                        action;
                    const entity = entityType as keyof typeof db.tx;
                    const linkMap: Record<string, string[]> = {
                        [linkLabel]: targetIds,
                    };
                    const tx = (db.tx[entity] as any)[entityId].link(linkMap);
                    await db.transact(tx);
                    toast.success("Action undone", {
                        description: "Link restored",
                    });
                    break;
                }
            }
        } catch (error) {
            console.error("Failed to undo action:", error);
            toast.error("Failed to undo action", {
                description: "Please try again",
            });
        }
    }, []);

    const registerUndo = useCallback(
        (action: UndoAction, message: string, duration: number = 5000) => {
            // Clear any existing undo state
            clearUndo();

            // Show toast with undo button
            const toastId = toast.success(message, {
                duration: duration,
                action: {
                    label: "Undo",
                    onClick: () => {
                        executeUndo(action);
                        clearUndo();
                    },
                },
            });

            const newState: UndoState = {
                action,
                message,
                toastId,
            };

            setUndoState(newState);

            // Auto-dismiss after duration
            timeoutRef.current = setTimeout(() => {
                clearUndo();
            }, duration);
        },
        [clearUndo, executeUndo]
    );

    return {
        registerUndo,
        clearUndo,
        undoState,
    };
}
