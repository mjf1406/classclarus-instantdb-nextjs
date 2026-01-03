/** @format */

import { Logo } from "@/components/brand/logo";
import { NavUserNavbar } from "@/components/navbar/nav-user-navbar";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrgLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* Header with back button, logo, and nav */}
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Back to Organizations</span>
                    </Link>

                    <div className="absolute left-1/2 -translate-x-1/2">
                        <Logo />
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeSwitch />
                        <NavUserNavbar />
                    </div>
                </div>
            </header>
            {children}
        </>
    );
}
