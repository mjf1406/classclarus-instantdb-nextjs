/** @format */

"use client";

import * as React from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export function ThemeSwitch() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Map resolved theme to our theme options
    // If theme is "system", use resolvedTheme, otherwise use theme
    const currentTheme = React.useMemo(() => {
        if (!mounted) return "light";
        if (theme === "system") {
            // When system is selected, show the resolved theme (light or dark)
            // but we'll map it to one of our three options
            return resolvedTheme === "dark" ? "dark" : "light";
        }
        return theme || "light";
    }, [theme, resolvedTheme, mounted]);

    const handleThemeChange = React.useCallback(
        (value: string) => {
            setTheme(value);
        },
        [setTheme]
    );

    if (!mounted) {
        return (
            <div className="inline-flex items-center rounded-md border border-input bg-background p-1">
                <div className="h-8 w-8" />
            </div>
        );
    }

    return (
        <RadioGroup
            value={currentTheme}
            onValueChange={handleThemeChange}
            className="inline-flex items-center gap-0.5 rounded-md border border-input bg-background p-0.5 shadow-sm"
            aria-label="Theme selection"
            role="radiogroup"
        >
            <label
                htmlFor="theme-light"
                className={cn(
                    "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                    "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
                    currentTheme === "light" &&
                        "bg-accent text-accent-foreground shadow-sm"
                )}
            >
                <RadioGroupItem
                    value="light"
                    id="theme-light"
                    className="sr-only"
                />
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Light theme</span>
            </label>
            <label
                htmlFor="theme-dark"
                className={cn(
                    "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                    "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
                    currentTheme === "dark" &&
                        "bg-accent text-accent-foreground shadow-sm"
                )}
            >
                <RadioGroupItem
                    value="dark"
                    id="theme-dark"
                    className="sr-only"
                />
                <Moon className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Dark theme</span>
            </label>
            <label
                htmlFor="theme-classclarus"
                className={cn(
                    "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                    "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
                    currentTheme === "classclarus" &&
                        "bg-accent text-accent-foreground shadow-sm"
                )}
            >
                <RadioGroupItem
                    value="classclarus"
                    id="theme-classclarus"
                    className="sr-only"
                />
                <Sparkles className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">ClassClarus theme</span>
            </label>
        </RadioGroup>
    );
}
