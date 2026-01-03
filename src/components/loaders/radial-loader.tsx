/** @format */

import { Loader2 } from "lucide-react";

export default function RadialGradientLoader() {
    return (
        <div className="min-h-screen w-full bg-radial from-foreground/30 to-background flex items-center justify-center">
            <Loader2
                className="animate-spin"
                size={64}
            />
        </div>
    );
}
