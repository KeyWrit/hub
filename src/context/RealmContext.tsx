import {
    createContext,
    type ReactNode,
    useCallback,
    useEffect,
    useReducer,
} from "react";
import { generateKeyPair } from "@/lib/crypto/keys";
import { CURRENT_STORAGE_VERSION } from "@/lib/storage/migrations";
import { loadStorage, saveStorage } from "@/lib/storage/storage";
import type {
    Client,
    ExportedRealm,
    KeyWritHubStorage,
    License,
    Realm,
    RealmDefaults,
} from "@/lib/types";

type RealmAction =
    | { type: "LOAD_SUCCESS"; payload: KeyWritHubStorage }
    | { type: "SET_ACTIVE_REALM"; payload: string | null }
    | { type: "CREATE_REALM"; payload: Realm }
    | {
          type: "UPDATE_REALM";
          payload: { realmId: string; updates: Partial<Realm> };
      }
    | { type: "DELETE_REALM"; payload: string }
    | { type: "IMPORT_REALM"; payload: Realm }
    | { type: "ADD_CLIENT"; payload: { realmId: string; client: Client } }
    | {
          type: "UPDATE_CLIENT";
          payload: {
              realmId: string;
              clientId: string;
              updates: Partial<Client>;
          };
      }
    | {
          type: "DELETE_CLIENT";
          payload: { realmId: string; clientId: string };
      }
    | { type: "ADD_LICENSE"; payload: { realmId: string; license: License } }
    | {
          type: "DELETE_LICENSE";
          payload: { realmId: string; licenseId: string };
      };

interface RealmState {
    storage: KeyWritHubStorage;
    isLoading: boolean;
}

function updateRealmInArray(
    realms: Realm[],
    realmId: string,
    updater: (realm: Realm) => Realm,
): Realm[] {
    return realms.map((r) => (r.id === realmId ? updater(r) : r));
}

function realmReducer(state: RealmState, action: RealmAction): RealmState {
    switch (action.type) {
        case "LOAD_SUCCESS":
            return {
                ...state,
                storage: action.payload,
                isLoading: false,
            };

        case "SET_ACTIVE_REALM":
            return {
                ...state,
                storage: {
                    ...state.storage,
                    activeRealmId: action.payload,
                },
            };

        case "CREATE_REALM":
            return {
                ...state,
                storage: {
                    ...state.storage,
                    activeRealmId: action.payload.id,
                    realms: [...state.storage.realms, action.payload],
                },
            };

        case "UPDATE_REALM": {
            const exists = state.storage.realms.some(
                (r) => r.id === action.payload.realmId,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realmId,
                        (r) => ({
                            ...r,
                            ...action.payload.updates,
                            updatedAt: Date.now(),
                        }),
                    ),
                },
            };
        }

        case "DELETE_REALM": {
            const remaining = state.storage.realms.filter(
                (r) => r.id !== action.payload,
            );
            const newActiveId =
                state.storage.activeRealmId === action.payload
                    ? (remaining[0]?.id ?? null)
                    : state.storage.activeRealmId;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    activeRealmId: newActiveId,
                    realms: remaining,
                },
            };
        }

        case "IMPORT_REALM":
            return {
                ...state,
                storage: {
                    ...state.storage,
                    activeRealmId: action.payload.id,
                    realms: [...state.storage.realms, action.payload],
                },
            };

        case "ADD_CLIENT": {
            const exists = state.storage.realms.some(
                (r) => r.id === action.payload.realmId,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realmId,
                        (r) => ({
                            ...r,
                            clients: [...r.clients, action.payload.client],
                            updatedAt: Date.now(),
                        }),
                    ),
                },
            };
        }

        case "UPDATE_CLIENT": {
            const realm = state.storage.realms.find(
                (r) => r.id === action.payload.realmId,
            );
            if (!realm) return state;

            const clientIndex = realm.clients.findIndex(
                (c) => c.id === action.payload.clientId,
            );
            if (clientIndex === -1) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realmId,
                        (r) => {
                            const updatedClients = [...r.clients];
                            updatedClients[clientIndex] = {
                                ...updatedClients[clientIndex],
                                ...action.payload.updates,
                            };
                            return {
                                ...r,
                                clients: updatedClients,
                                updatedAt: Date.now(),
                            };
                        },
                    ),
                },
            };
        }

        case "DELETE_CLIENT": {
            const exists = state.storage.realms.some(
                (r) => r.id === action.payload.realmId,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realmId,
                        (r) => ({
                            ...r,
                            clients: r.clients.filter(
                                (c) => c.id !== action.payload.clientId,
                            ),
                            updatedAt: Date.now(),
                        }),
                    ),
                },
            };
        }

        case "ADD_LICENSE": {
            const exists = state.storage.realms.some(
                (r) => r.id === action.payload.realmId,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realmId,
                        (r) => ({
                            ...r,
                            licenses: [...r.licenses, action.payload.license],
                            updatedAt: Date.now(),
                        }),
                    ),
                },
            };
        }

        case "DELETE_LICENSE": {
            const exists = state.storage.realms.some(
                (r) => r.id === action.payload.realmId,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realmId,
                        (r) => ({
                            ...r,
                            licenses: r.licenses.filter(
                                (l) => l.jti !== action.payload.licenseId,
                            ),
                            updatedAt: Date.now(),
                        }),
                    ),
                },
            };
        }

        default:
            return state;
    }
}

export interface RealmContextValue {
    activeRealm: Realm | null;
    realms: Realm[];
    isLoading: boolean;
    createRealm: (realmId: string, label?: string) => Promise<Realm>;
    updateRealm: (realmId: string, updates: Partial<Omit<Realm, "id">>) => void;
    deleteRealm: (realmId: string) => void;
    setActiveRealm: (realmId: string | null) => void;
    exportRealm: (realmId: string, includeLicenses?: boolean) => string;
    importRealm: (json: string) => Promise<Realm>;
    updateRealmDefaults: (
        realmId: string,
        defaults: Partial<RealmDefaults>,
    ) => void;
    addClient: (realmId: string, client: Client) => void;
    updateClient: (
        realmId: string,
        clientId: string,
        updates: Partial<Client>,
    ) => void;
    deleteClient: (realmId: string, clientId: string) => void;
    addLicense: (realmId: string, license: License) => void;
    deleteLicense: (realmId: string, licenseId: string) => void;
}

export const RealmContext = createContext<RealmContextValue | null>(null);

const initialState: RealmState = {
    storage: {
        version: CURRENT_STORAGE_VERSION,
        activeRealmId: null,
        realms: [],
    },
    isLoading: true,
};

export function RealmProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(realmReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const storage = loadStorage();
        // Handle migration from Record to array format
        const oldRealms = storage.realms as unknown;
        const realmsArray: Realm[] = Array.isArray(oldRealms)
            ? oldRealms
            : Object.values(oldRealms ?? {});

        // Normalize realms to ensure they have all fields
        const normalizedRealms: Realm[] = realmsArray.map((r) => {
            // Handle migration from old field names
            const oldRealm = r as Realm & {
                realm?: string;
                name?: string;
                description?: string;
            };
            const clients = Array.isArray(r.clients)
                ? r.clients
                : Object.values(r.clients ?? {});
            const licenses = Array.isArray(r.licenses)
                ? r.licenses
                : Object.values(r.licenses ?? {});
            return {
                id: oldRealm.id ?? oldRealm.realm ?? oldRealm.name,
                label: oldRealm.label ?? oldRealm.description,
                keyPair: r.keyPair,
                defaults: r.defaults ?? {},
                clients,
                licenses,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
            };
        });

        dispatch({
            type: "LOAD_SUCCESS",
            payload: { ...storage, realms: normalizedRealms },
        });
    }, []);

    // Save to localStorage on changes (skip initial load)
    useEffect(() => {
        if (!state.isLoading) {
            saveStorage(state.storage);
        }
    }, [state.storage, state.isLoading]);

    const createRealm = useCallback(
        async (realmId: string, label?: string): Promise<Realm> => {
            const keyPair = await generateKeyPair();
            const now = Date.now();

            const newRealm: Realm = {
                id: realmId,
                label,
                keyPair,
                defaults: {},
                clients: [],
                licenses: [],
                createdAt: now,
                updatedAt: now,
            };

            dispatch({ type: "CREATE_REALM", payload: newRealm });
            return newRealm;
        },
        [],
    );

    const updateRealm = useCallback(
        (realmId: string, updates: Partial<Omit<Realm, "id">>) => {
            dispatch({ type: "UPDATE_REALM", payload: { realmId, updates } });
        },
        [],
    );

    const deleteRealm = useCallback((realmId: string) => {
        dispatch({ type: "DELETE_REALM", payload: realmId });
    }, []);

    const setActiveRealm = useCallback((realmId: string | null) => {
        dispatch({ type: "SET_ACTIVE_REALM", payload: realmId });
    }, []);

    const exportRealm = useCallback(
        (realmId: string, includeLicenses = false): string => {
            const realm = state.storage.realms.find((r) => r.id === realmId);
            if (!realm) {
                throw new Error(`Realm not found: ${realmId}`);
            }

            const exported: ExportedRealm = {
                exportVersion: 1,
                exportedAt: Date.now(),
                realm: {
                    id: realm.id,
                    label: realm.label,
                    privateKey: realm.keyPair.privateKey,
                    publicKey: realm.keyPair.publicKey,
                    publicKeyHex: realm.keyPair.publicKeyHex,
                    defaults: realm.defaults,
                    ...(includeLicenses && {
                        clients: realm.clients,
                        licenses: realm.licenses,
                    }),
                },
            };

            return JSON.stringify(exported, null, 2);
        },
        [state.storage.realms],
    );

    const importRealm = useCallback(async (json: string): Promise<Realm> => {
        const parsed = JSON.parse(json) as ExportedRealm;

        if (parsed.exportVersion !== 1) {
            throw new Error(
                `Unsupported export version: ${parsed.exportVersion}`,
            );
        }

        const now = Date.now();
        const realm: Realm = {
            id: parsed.realm.id,
            label: parsed.realm.label,
            keyPair: {
                privateKey: parsed.realm.privateKey,
                publicKey: parsed.realm.publicKey,
                publicKeyHex: parsed.realm.publicKeyHex,
                createdAt: parsed.exportedAt,
            },
            defaults: parsed.realm.defaults,
            clients: parsed.realm.clients ?? [],
            licenses: parsed.realm.licenses ?? [],
            createdAt: now,
            updatedAt: now,
        };

        dispatch({ type: "IMPORT_REALM", payload: realm });
        return realm;
    }, []);

    const updateRealmDefaults = useCallback(
        (realmId: string, defaults: Partial<RealmDefaults>) => {
            const realm = state.storage.realms.find((r) => r.id === realmId);
            if (!realm) return;

            dispatch({
                type: "UPDATE_REALM",
                payload: {
                    realmId,
                    updates: {
                        defaults: { ...realm.defaults, ...defaults },
                    },
                },
            });
        },
        [state.storage.realms],
    );

    const addClient = useCallback((realmId: string, client: Client) => {
        dispatch({ type: "ADD_CLIENT", payload: { realmId, client } });
    }, []);

    const updateClient = useCallback(
        (realmId: string, clientId: string, updates: Partial<Client>) => {
            dispatch({
                type: "UPDATE_CLIENT",
                payload: { realmId, clientId, updates },
            });
        },
        [],
    );

    const deleteClient = useCallback((realmId: string, clientId: string) => {
        dispatch({
            type: "DELETE_CLIENT",
            payload: { realmId, clientId },
        });
    }, []);

    const addLicense = useCallback((realmId: string, license: License) => {
        dispatch({ type: "ADD_LICENSE", payload: { realmId, license } });
    }, []);

    const deleteLicense = useCallback((realmId: string, licenseId: string) => {
        dispatch({
            type: "DELETE_LICENSE",
            payload: { realmId, licenseId },
        });
    }, []);

    const activeRealm = state.storage.activeRealmId
        ? (state.storage.realms.find(
              (r) => r.id === state.storage.activeRealmId,
          ) ?? null)
        : null;

    const realms = [...state.storage.realms].sort((a, b) => {
        const aName = (a.label || a.id).toLowerCase();
        const bName = (b.label || b.id).toLowerCase();
        return aName.localeCompare(bName);
    });

    const value: RealmContextValue = {
        activeRealm,
        realms,
        isLoading: state.isLoading,
        createRealm,
        updateRealm,
        deleteRealm,
        setActiveRealm,
        exportRealm,
        importRealm,
        updateRealmDefaults,
        addClient,
        updateClient,
        deleteClient,
        addLicense,
        deleteLicense,
    };

    return (
        <RealmContext.Provider value={value}>{children}</RealmContext.Provider>
    );
}
