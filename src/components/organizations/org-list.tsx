/** @format */

import { db } from "@/lib/db/db";

export default function OrgList() {
    const user = db.useUser();
    console.log("🚀 ~ OrgList ~ user:", user);
    const { data } = db.useQuery({
        organizations: {},
    });
    console.log("🚀 ~ OrgList ~ data:", data);

    return <div>Organization List Component</div>;
}
