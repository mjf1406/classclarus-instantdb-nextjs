/** @format */

import { OrgSidebar } from "@/components/sidebar/org-sidebar";
import { OrgHeader } from "@/components/sidebar/org-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function OrgLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <OrgSidebar />
            <SidebarInset>
                <OrgHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
