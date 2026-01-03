/** @format */

import { redirect } from "next/navigation";

interface ClassPageProps {
    params: Promise<{ orgId: string; classId: string }>;
}

export default async function ClassPage({ params }: ClassPageProps) {
    const { orgId, classId } = await params;
    redirect(`/${orgId}/${classId}/home`);
}
