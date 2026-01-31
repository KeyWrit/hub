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
          payload: { realm: string; updates: Partial<Realm> };
      }
    | { type: "DELETE_REALM"; payload: string }
    | { type: "IMPORT_REALM"; payload: Realm }
    | { type: "ADD_CLIENT"; payload: { realm: string; client: Client } }
    | {
          type: "UPDATE_CLIENT";
          payload: {
              realm: string;
              clientId: string;
              updates: Partial<Client>;
          };
      }
    | {
          type: "DELETE_CLIENT";
          payload: { realm: string; clientId: string };
      }
    | { type: "ADD_LICENSE"; payload: { realm: string; license: License } }
    | {
          type: "DELETE_LICENSE";
          payload: { realm: string; licenseId: string };
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
    return realms.map((r) => (r.realm === realmId ? updater(r) : r));
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
                    activeRealmId: action.payload.realm,
                    realms: [...state.storage.realms, action.payload],
                },
            };

        case "UPDATE_REALM": {
            const exists = state.storage.realms.some(
                (r) => r.realm === action.payload.realm,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realm,
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
                (r) => r.realm !== action.payload,
            );
            const newActiveId =
                state.storage.activeRealmId === action.payload
                    ? (remaining[0]?.realm ?? null)
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
                    activeRealmId: action.payload.realm,
                    realms: [...state.storage.realms, action.payload],
                },
            };

        case "ADD_CLIENT": {
            const exists = state.storage.realms.some(
                (r) => r.realm === action.payload.realm,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realm,
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
                (r) => r.realm === action.payload.realm,
            );
            if (!realm) return state;

            const clientIndex = realm.clients.findIndex(
                (c) => c.client === action.payload.clientId,
            );
            if (clientIndex === -1) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realm,
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
                (r) => r.realm === action.payload.realm,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realm,
                        (r) => ({
                            ...r,
                            clients: r.clients.filter(
                                (c) => c.client !== action.payload.clientId,
                            ),
                            updatedAt: Date.now(),
                        }),
                    ),
                },
            };
        }

        case "ADD_LICENSE": {
            const exists = state.storage.realms.some(
                (r) => r.realm === action.payload.realm,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realm,
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
                (r) => r.realm === action.payload.realm,
            );
            if (!exists) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: updateRealmInArray(
                        state.storage.realms,
                        action.payload.realm,
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
    createRealm: (realm: string, label?: string) => Promise<Realm>;
    updateRealm: (
        realm: string,
        updates: Partial<Omit<Realm, "realm">>,
    ) => void;
    deleteRealm: (realm: string) => void;
    setActiveRealm: (realm: string | null) => void;
    exportRealm: (realm: string, includeLicenses?: boolean) => string;
    importRealm: (json: string) => Promise<Realm>;
    updateRealmDefaults: (
        realm: string,
        defaults: Partial<RealmDefaults>,
    ) => void;
    addClient: (realm: string, client: Client) => void;
    updateClient: (
        realm: string,
        clientId: string,
        updates: Partial<Client>,
    ) => void;
    deleteClient: (realm: string, clientId: string) => void;
    addLicense: (realm: string, license: License) => void;
    deleteLicense: (realm: string, licenseId: string) => void;
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
                id?: string;
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
                realm: oldRealm.realm ?? oldRealm.name ?? oldRealm.id,
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
        async (realm: string, label?: string): Promise<Realm> => {
            const keyPair = await generateKeyPair();
            const now = Date.now();

            const newRealm: Realm = {
                realm,
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
        (realm: string, updates: Partial<Omit<Realm, "realm">>) => {
            dispatch({ type: "UPDATE_REALM", payload: { realm, updates } });
        },
        [],
    );

    const deleteRealm = useCallback((realm: string) => {
        dispatch({ type: "DELETE_REALM", payload: realm });
    }, []);

    const setActiveRealm = useCallback((realm: string | null) => {
        dispatch({ type: "SET_ACTIVE_REALM", payload: realm });
    }, []);

    const exportRealm = useCallback(
        (realmId: string, includeLicenses = false): string => {
            const realm = state.storage.realms.find((r) => r.realm === realmId);
            if (!realm) {
                throw new Error(`Realm not found: ${realmId}`);
            }

            const exported: ExportedRealm = {
                exportVersion: 1,
                exportedAt: Date.now(),
                realm: {
                    realm: realm.realm,
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
            realm: parsed.realm.realm,
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
            const realm = state.storage.realms.find((r) => r.realm === realmId);
            if (!realm) return;

            dispatch({
                type: "UPDATE_REALM",
                payload: {
                    realm: realmId,
                    updates: {
                        defaults: { ...realm.defaults, ...defaults },
                    },
                },
            });
        },
        [state.storage.realms],
    );

    const addClient = useCallback((realm: string, client: Client) => {
        dispatch({ type: "ADD_CLIENT", payload: { realm, client } });
    }, []);

    const updateClient = useCallback(
        (realm: string, clientId: string, updates: Partial<Client>) => {
            dispatch({
                type: "UPDATE_CLIENT",
                payload: { realm, clientId, updates },
            });
        },
        [],
    );

    const deleteClient = useCallback((realm: string, clientId: string) => {
        dispatch({
            type: "DELETE_CLIENT",
            payload: { realm, clientId },
        });
    }, []);

    const addLicense = useCallback((realm: string, license: License) => {
        dispatch({ type: "ADD_LICENSE", payload: { realm, license } });
    }, []);

    const deleteLicense = useCallback((realm: string, licenseId: string) => {
        dispatch({
            type: "DELETE_LICENSE",
            payload: { realm, licenseId },
        });
    }, []);

    const activeRealm = state.storage.activeRealmId
        ? (state.storage.realms.find(
              (r) => r.realm === state.storage.activeRealmId,
          ) ?? null)
        : null;

    const realms = [...state.storage.realms].sort((a, b) => {
        const aName = (a.label || a.realm).toLowerCase();
        const bName = (b.label || b.realm).toLowerCase();
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
