import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    CURRENT_STORAGE_VERSION,
    createEmptyStorage,
    migrateStorage,
} from "@/lib/storage/migrations";
import { clearStorage, loadStorage, saveStorage } from "@/lib/storage/storage";
import type { KeyWritHubStorage } from "@/lib/types";

describe("migrations", () => {
    it("creates empty storage with correct version", () => {
        const storage = createEmptyStorage();
        expect(storage.version).toBe(CURRENT_STORAGE_VERSION);
        expect(storage.activeRealmId).toBeNull();
        expect(storage.realms).toEqual({});
    });

    it("returns empty storage for null data", () => {
        const storage = migrateStorage(null);
        expect(storage.version).toBe(CURRENT_STORAGE_VERSION);
    });

    it("returns empty storage for non-object data", () => {
        const storage = migrateStorage("invalid");
        expect(storage.version).toBe(CURRENT_STORAGE_VERSION);
    });

    it("returns data as-is for current version", () => {
        const data: KeyWritHubStorage = {
            version: CURRENT_STORAGE_VERSION,
            activeRealmId: "test-id",
            realms: {},
        };
        const storage = migrateStorage(data);
        expect(storage).toEqual(data);
    });
});

describe("storage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns empty storage when nothing saved", () => {
        const storage = loadStorage();
        expect(storage.version).toBe(CURRENT_STORAGE_VERSION);
        expect(storage.activeRealmId).toBeNull();
        expect(storage.realms).toEqual({});
    });

    it("saves and loads storage correctly", () => {
        const data: KeyWritHubStorage = {
            version: CURRENT_STORAGE_VERSION,
            activeRealmId: "realm-1",
            realms: {
                "realm-1": {
                    id: "realm-1",
                    name: "Test Realm",
                    keyPair: {
                        privateKey: { kty: "OKP" },
                        publicKey: { kty: "OKP" },
                        publicKeyHex: "abc123",
                        createdAt: Date.now(),
                    },
                    defaults: {},
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            },
        };

        saveStorage(data);
        const loaded = loadStorage();
        expect(loaded).toEqual(data);
    });

    it("clears storage correctly", () => {
        const data: KeyWritHubStorage = {
            version: CURRENT_STORAGE_VERSION,
            activeRealmId: null,
            realms: {},
        };
        saveStorage(data);
        clearStorage();
        const loaded = loadStorage();
        expect(loaded.activeRealmId).toBeNull();
    });

    it("handles corrupted JSON gracefully", () => {
        localStorage.setItem("keywrit-hub", "not-json");
        const warnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        const storage = loadStorage();
        expect(storage.version).toBe(CURRENT_STORAGE_VERSION);
        warnSpy.mockRestore();
    });
});
