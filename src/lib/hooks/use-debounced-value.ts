/** @format */

import { useEffect, useState } from "react";

/**
 * Debounces a value with a configurable delay.
 * Returns the debounced value that updates after the specified delay.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 100ms)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 100): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

