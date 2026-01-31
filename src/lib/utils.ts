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

/**
 * Sort comparator for items with id and optional label.
 * Sorts alphabetically by label (or id if no label) in a case-insensitive manner.
 */
export function sortByLabel<T extends { id: string; label?: string }>(
    a: T,
    b: T,
): number {
    const aName = (a.label || a.id).toLowerCase();
    const bName = (b.label || b.id).toLowerCase();
    return aName.localeCompare(bName);
}

/**
 * Downloads data as a JSON file.
 */
export function downloadJson(data: string, filename: string): void {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
