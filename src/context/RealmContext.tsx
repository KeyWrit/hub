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
    | { type: "UPDATE_REALM"; payload: { id: string; updates: Partial<Realm> } }
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
                    realms: {
                        ...state.storage.realms,
                        [action.payload.id]: action.payload,
                    },
                },
            };

        case "UPDATE_REALM": {
            const existing = state.storage.realms[action.payload.id];
            if (!existing) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.id]: {
                            ...existing,
                            ...action.payload.updates,
                            updatedAt: Date.now(),
                        },
                    },
                },
            };
        }

        case "DELETE_REALM": {
            const { [action.payload]: _, ...remainingRealms } =
                state.storage.realms;
            const realmIds = Object.keys(remainingRealms);
            const newActiveId =
                state.storage.activeRealmId === action.payload
                    ? (realmIds[0] ?? null)
                    : state.storage.activeRealmId;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    activeRealmId: newActiveId,
                    realms: remainingRealms,
                },
            };
        }

        case "IMPORT_REALM":
            return {
                ...state,
                storage: {
                    ...state.storage,
                    activeRealmId: action.payload.id,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.id]: action.payload,
                    },
                },
            };

        case "ADD_CLIENT": {
            const realm = state.storage.realms[action.payload.realmId];
            if (!realm) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.realmId]: {
                            ...realm,
                            clients: [...realm.clients, action.payload.client],
                            updatedAt: Date.now(),
                        },
                    },
                },
            };
        }

        case "UPDATE_CLIENT": {
            const realm = state.storage.realms[action.payload.realmId];
            if (!realm) return state;

            const clientIndex = realm.clients.findIndex(
                (c) => c.client === action.payload.clientId,
            );
            if (clientIndex === -1) return state;

            const updatedClients = [...realm.clients];
            updatedClients[clientIndex] = {
                ...updatedClients[clientIndex],
                ...action.payload.updates,
            };

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.realmId]: {
                            ...realm,
                            clients: updatedClients,
                            updatedAt: Date.now(),
                        },
                    },
                },
            };
        }

        case "DELETE_CLIENT": {
            const realm = state.storage.realms[action.payload.realmId];
            if (!realm) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.realmId]: {
                            ...realm,
                            clients: realm.clients.filter(
                                (c) => c.client !== action.payload.clientId,
                            ),
                            updatedAt: Date.now(),
                        },
                    },
                },
            };
        }

        case "ADD_LICENSE": {
            const realm = state.storage.realms[action.payload.realmId];
            if (!realm) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.realmId]: {
                            ...realm,
                            licenses: [
                                ...realm.licenses,
                                action.payload.license,
                            ],
                            updatedAt: Date.now(),
                        },
                    },
                },
            };
        }

        case "DELETE_LICENSE": {
            const realm = state.storage.realms[action.payload.realmId];
            if (!realm) return state;

            return {
                ...state,
                storage: {
                    ...state.storage,
                    realms: {
                        ...state.storage.realms,
                        [action.payload.realmId]: {
                            ...realm,
                            licenses: realm.licenses.filter(
                                (l) => l.jti !== action.payload.licenseId,
                            ),
                            updatedAt: Date.now(),
                        },
                    },
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
    createRealm: (name: string, description?: string) => Promise<Realm>;
    updateRealm: (id: string, updates: Partial<Omit<Realm, "id">>) => void;
    deleteRealm: (id: string) => void;
    setActiveRealm: (id: string | null) => void;
    exportRealm: (id: string, includeLicenses?: boolean) => string;
    importRealm: (json: string) => Promise<Realm>;
    updateRealmDefaults: (id: string, defaults: Partial<RealmDefaults>) => void;
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
        realms: {},
    },
    isLoading: true,
};

export function RealmProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(realmReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const storage = loadStorage();
        // Normalize realms to ensure they have clients and licenses
        const normalizedRealms: Record<string, Realm> = {};
        for (const [id, realm] of Object.entries(storage.realms)) {
            // Handle migration from Record to array format
            const clients = Array.isArray(realm.clients)
                ? realm.clients
                : Object.values(realm.clients ?? {});
            const licenses = Array.isArray(realm.licenses)
                ? realm.licenses
                : Object.values(realm.licenses ?? {});
            normalizedRealms[id] = {
                ...realm,
                clients,
                licenses,
            };
        }
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
        async (name: string, description?: string): Promise<Realm> => {
            const keyPair = await generateKeyPair();
            const now = Date.now();

            const realm: Realm = {
                id: crypto.randomUUID(),
                name,
                description,
                keyPair,
                defaults: {},
                clients: [],
                licenses: [],
                createdAt: now,
                updatedAt: now,
            };

            dispatch({ type: "CREATE_REALM", payload: realm });
            return realm;
        },
        [],
    );

    const updateRealm = useCallback(
        (id: string, updates: Partial<Omit<Realm, "id">>) => {
            dispatch({ type: "UPDATE_REALM", payload: { id, updates } });
        },
        [],
    );

    const deleteRealm = useCallback((id: string) => {
        dispatch({ type: "DELETE_REALM", payload: id });
    }, []);

    const setActiveRealm = useCallback((id: string | null) => {
        dispatch({ type: "SET_ACTIVE_REALM", payload: id });
    }, []);

    const exportRealm = useCallback(
        (id: string, includeLicenses = false): string => {
            const realm = state.storage.realms[id];
            if (!realm) {
                throw new Error(`Realm not found: ${id}`);
            }

            const exported: ExportedRealm = {
                exportVersion: 1,
                exportedAt: Date.now(),
                realm: {
                    name: realm.name,
                    description: realm.description,
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
            id: crypto.randomUUID(),
            name: parsed.realm.name,
            description: parsed.realm.description,
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
        (id: string, defaults: Partial<RealmDefaults>) => {
            const realm = state.storage.realms[id];
            if (!realm) return;

            dispatch({
                type: "UPDATE_REALM",
                payload: {
                    id,
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
        ? (state.storage.realms[state.storage.activeRealmId] ?? null)
        : null;

    const realms = Object.values(state.storage.realms).sort(
        (a, b) => b.createdAt - a.createdAt,
    );

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
