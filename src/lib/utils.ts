import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Sanitizes an identifier to only allow lowercase letters, numbers, dashes, and underscores.
 * Automatically converts to lowercase and removes invalid characters.
 */
export function sanitizeIdentifier(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
}
