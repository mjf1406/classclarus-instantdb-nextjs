/** @format */

import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/auth/auth-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ClassClarus | App",
    description: "Gamify your classroom to motivate your students.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
            <html
                lang="en"
                suppressHydrationWarning
            >
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                        themes={["light", "dark", "classclarus"]}
                    >
                        <AuthProvider>
                            <div
                                vaul-drawer-wrapper=""
                                className="bg-background"
                            >
                                {" "}
                                {children} <Toaster richColors />
                            </div>
                        </AuthProvider>
                    </ThemeProvider>
                </body>
            </html>
        </GoogleOAuthProvider>
    );
}
