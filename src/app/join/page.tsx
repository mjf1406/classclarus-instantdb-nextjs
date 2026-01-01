/** @format */

import { db } from "@/lib/db/db";
import { SignedOutView } from "../page";

export default function JoinPage() {
    const user = db.useUser();
    if (!user) {
        return <SignedOutView />;
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Join Page</h1>
            <p className="text-lg text-center">
                Welcome to the Join Page! Here you can join an organization.
            </p>
        </div>
    );
}
