import type { KeyWritHubStorage } from "@/lib/types";

export const CURRENT_STORAGE_VERSION = 1;

type Migration = (data: unknown) => KeyWritHubStorage;

const migrations: Record<number, Migration> = {
    // Add future migrations here as needed
    // 1: (data) => migrateV0ToV1(data),
};

export function migrateStorage(data: unknown): KeyWritHubStorage {
    if (!data || typeof data !== "object") {
        return createEmptyStorage();
    }

    const storage = data as Partial<KeyWritHubStorage>;
    const version = storage.version ?? 0;

    if (version >= CURRENT_STORAGE_VERSION) {
        return storage as KeyWritHubStorage;
    }

    let current = data;
    for (let v = version; v < CURRENT_STORAGE_VERSION; v++) {
        const migrate = migrations[v + 1];
        if (migrate) {
            current = migrate(current);
        }
    }

    return current as KeyWritHubStorage;
}

export function createEmptyStorage(): KeyWritHubStorage {
    return {
        version: CURRENT_STORAGE_VERSION,
        activeRealmId: null,
        realms: [],
    };
}
