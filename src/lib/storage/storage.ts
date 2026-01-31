import type { KeyWritHubStorage } from "@/lib/types";
import { createEmptyStorage, migrateStorage } from "./migrations";

const STORAGE_KEY = "keywrit-hub";

export function loadStorage(): KeyWritHubStorage {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return createEmptyStorage();
        }

        const parsed = JSON.parse(raw);
        return migrateStorage(parsed);
    } catch {
        console.warn("Failed to load storage, creating new");
        return createEmptyStorage();
    }
}

export function saveStorage(storage: KeyWritHubStorage): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
        console.error("Failed to save storage:", error);
    }
}

export function clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
}
