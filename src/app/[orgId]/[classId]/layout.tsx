/** @format */

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ClassHeader } from "@/components/sidebar/inset-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function ClassLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NuqsAdapter>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <ClassHeader />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </NuqsAdapter>
    );
}
