/** @format */

import { db } from "@/lib/db/db";
import { User } from "@/lib/types/user";
import { useEffect, useState } from "react";

export default function GuestDataDeletionCountdown() {
    const user: User = db.useUser() as User;
    const joined = user?.created_at || 0;
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const [isExpired, setIsExpired] = useState<boolean>(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = Date.now();
            const joinedTime = new Date(user?.created_at || 0).getTime();
            const deletionTime = joinedTime + 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
            const remaining = deletionTime - now;

            if (remaining <= 0) {
                setIsExpired(true);
                setTimeRemaining("");
                return;
            }

            setIsExpired(false);
            const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor(
                (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
            );

            setTimeRemaining(`${days}d ${hours}h`);
        };

        // Calculate immediately
        calculateTimeRemaining();

        // Update every second
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [joined]);

    return (
        <p className="text-xs font-mono mb-3">
            {isExpired
                ? "Your data will be deleted within the next 24 hours."
                : `Your data will be deleted in about: ${timeRemaining}`}
        </p>
    );
}
