/** @format */

import { redirect } from "next/navigation";
import { use } from "react";

interface OrgPageProps {
    params: Promise<{ orgId: string }>;
}

export default function OrgPage({ params }: OrgPageProps) {
    const { orgId } = use(params);
    redirect(`/org/${orgId}/home`);
}
