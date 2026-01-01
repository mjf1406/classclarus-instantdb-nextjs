/** @format */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, User, Save } from "lucide-react";

import { db } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";
import {
    IconUploadField,
    type IconUploadFieldRef,
} from "@/components/ui/icon-upload-field";
import { uploadIcon } from "@/lib/hooks/use-icon-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Zod schema for account validation
const accountSchema = z.object({
    firstName: z.string().max(50, "First name must be 50 characters or less"),
    lastName: z.string().max(50, "Last name must be 50 characters or less"),
});

type AccountFormData = z.infer<typeof accountSchema>;

function AccountPageContent() {
    const router = useRouter();
    const { user, isLoading: authLoading } = db.useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarRemoved, setAvatarRemoved] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const avatarFieldRef = useRef<IconUploadFieldRef>(null);

    // Query user data for firstName, lastName, avatarURL
    const { data, isLoading: dataLoading } = db.useQuery(
        user?.id
            ? {
                  $users: {
                      $: { where: { id: user.id } },
                  },
              }
            : null
    );

    const userData = data?.$users?.[0];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
        },
    });

    // Sync form with user data when it loads
    useEffect(() => {
        if (userData) {
            reset({
                firstName: userData.firstName ?? "",
                lastName: userData.lastName ?? "",
            });
        }
    }, [userData, reset]);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (saveSuccess) {
            const timer = setTimeout(() => setSaveSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveSuccess]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [authLoading, user, router]);

    const hasChanges = isDirty || avatarFile !== null || avatarRemoved;

    const onSubmit = async (data: AccountFormData) => {
        if (!user?.id) return;

        setIsSubmitting(true);
        setSaveSuccess(false);

        try {
            let avatarUrl: string | undefined =
                userData?.avatarURL ?? undefined;

            // Upload new avatar if provided
            if (avatarFile) {
                const result = await uploadIcon({
                    file: avatarFile,
                    userId: user.id,
                    pathPrefix: `users/${user.id}/avatar`,
                });

                if (result.error) {
                    throw new Error(result.error);
                }
                avatarUrl = result.url;
            } else if (avatarRemoved) {
                avatarUrl = undefined;
            }

            const trimmedFirstName = data.firstName.trim() || undefined;
            const trimmedLastName = data.lastName.trim() || undefined;

            await db.transact(
                db.tx.$users[user.id].update({
                    firstName: trimmedFirstName,
                    lastName: trimmedLastName,
                    avatarURL: avatarUrl,
                    updated: new Date(),
                })
            );

            // Reset avatar state after successful save
            setAvatarFile(null);
            setAvatarRemoved(false);
            setSaveSuccess(true);
        } catch (err) {
            console.error("Failed to update account:", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || dataLoading) {
        return <AccountSkeleton />;
    }

    if (!user) {
        return null;
    }

    // Get user initials for avatar fallback
    const initials =
        [userData?.firstName?.[0], userData?.lastName?.[0]]
            .filter(Boolean)
            .join("")
            .toUpperCase() ||
        user.email?.[0]?.toUpperCase() ||
        "U";

    // Determine avatar to display (prioritize custom avatar, then OAuth image)
    const displayAvatar = userData?.avatarURL || user.imageURL;

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <User className="size-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Account Settings
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your profile and preferences
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <Avatar className="size-20 border-4 border-border shadow-sm">
                                <AvatarImage
                                    src={displayAvatar ?? undefined}
                                    alt={`${
                                        userData?.firstName ?? "User"
                                    }'s avatar`}
                                />
                                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center sm:text-left">
                                <CardTitle className="text-xl">
                                    {[userData?.firstName, userData?.lastName]
                                        .filter(Boolean)
                                        .join(" ") || "Your Profile"}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {user.email}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="pt-6">
                            <FieldGroup>
                                {/* Avatar Upload */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <IconUploadField
                                        ref={avatarFieldRef}
                                        label="Profile Picture"
                                        initialPreview={displayAvatar ?? null}
                                        disabled={isSubmitting}
                                        onFileChange={(file) => {
                                            setAvatarFile(file);
                                            setAvatarRemoved(false);
                                        }}
                                        onRemove={() => {
                                            setAvatarRemoved(true);
                                            setAvatarFile(null);
                                        }}
                                        id="avatar-upload"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        This will be displayed on your profile
                                        and across the application.
                                    </p>
                                </div>

                                {/* First Name */}
                                <Field data-invalid={!!errors.firstName}>
                                    <FieldLabel htmlFor="first-name">
                                        First Name
                                    </FieldLabel>
                                    <Input
                                        id="first-name"
                                        placeholder="Enter your first name"
                                        disabled={isSubmitting}
                                        aria-invalid={!!errors.firstName}
                                        {...register("firstName")}
                                    />
                                    <FieldDescription>
                                        Your first name as it will appear to
                                        others
                                    </FieldDescription>
                                    {errors.firstName && (
                                        <FieldError>
                                            {errors.firstName.message}
                                        </FieldError>
                                    )}
                                </Field>

                                {/* Last Name */}
                                <Field data-invalid={!!errors.lastName}>
                                    <FieldLabel htmlFor="last-name">
                                        Last Name
                                    </FieldLabel>
                                    <Input
                                        id="last-name"
                                        placeholder="Enter your last name"
                                        disabled={isSubmitting}
                                        aria-invalid={!!errors.lastName}
                                        {...register("lastName")}
                                    />
                                    <FieldDescription>
                                        Your last name or family name
                                    </FieldDescription>
                                    {errors.lastName && (
                                        <FieldError>
                                            {errors.lastName.message}
                                        </FieldError>
                                    )}
                                </Field>

                                {/* Email (Read-only) */}
                                <Field data-disabled>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        value={user.email ?? ""}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <FieldDescription>
                                        Your email address cannot be changed
                                        here
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </CardContent>

                        <Separator />

                        <CardFooter className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-center sm:text-left">
                                {saveSuccess && (
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        ✓ Changes saved successfully
                                    </p>
                                )}
                                {!saveSuccess && hasChanges && (
                                    <p className="text-sm text-muted-foreground">
                                        You have unsaved changes
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !hasChanges}
                                className="min-w-35"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 size-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Account Info Card */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Account Type
                                </dt>
                                <dd className="font-medium capitalize text-foreground">
                                    {userData?.type ?? "Standard"}
                                </dd>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Plan</dt>
                                <dd className="font-medium capitalize text-foreground">
                                    {userData?.plan ?? "Free"}
                                </dd>
                            </div>
                            {userData?.created && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Member Since
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {new Date(
                                                userData.created
                                            ).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </dd>
                                    </div>
                                </>
                            )}
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function AccountSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Skeleton className="mb-4 h-9 w-20" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="size-12 rounded-xl" />
                        <div>
                            <Skeleton className="mb-2 h-7 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                            <Skeleton className="size-20 rounded-full" />
                            <div>
                                <Skeleton className="mb-2 h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="pt-6">
                        <Skeleton className="ml-auto h-10 w-35" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return <AccountPageContent />;
}
