/** @format */

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ClassHeader } from "@/components/sidebar/inset-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ClassLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <ClassHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
