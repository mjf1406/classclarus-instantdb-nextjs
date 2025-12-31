/** @format */

// server\db-server.ts

import { init } from "@instantdb/admin";
import _schema from "@/instant.schema";

const dbAdmin = init({
    appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
    adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
    schema: _schema,
});

export default dbAdmin;
