// KeyWrit Hub Storage Types

export interface Client {
    id: string;
    label?: string;
    licenses: License[];
    createdAt: number;
}

export interface KeyPair {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
    publicKeyHex: string;
    createdAt: number;
}

export interface RealmDefaults {
    kind?: string;
    flags?: string[];
    features?: Record<string, unknown>;
    allowedDomains?: string[];
    expirationOffsetSeconds?: number;
}

export interface License {
    id: string;
    kind?: string;
    flags?: string[];
    features?: Record<string, unknown>;
    allowedDomains?: string[];
    expiresAt?: number;
    notBefore: number;
    issuedAt: number;
    token: string;
    createdAt: number;
    label?: string;
}

export interface Realm {
    id: string;
    label?: string;
    keyPair: KeyPair;
    defaults: RealmDefaults;
    clients: Client[];
    createdAt: number;
    updatedAt: number;
}

export interface KeyWritHubStorage {
    version: number;
    activeRealmId: string | null;
    realms: Realm[];
}

export interface ExportedRealm {
    exportVersion: 1;
    exportedAt: number;
    realm: {
        id: string;
        label?: string;
        privateKey: JsonWebKey;
        publicKey: JsonWebKey;
        publicKeyHex: string;
        defaults: RealmDefaults;
        clients?: Client[];
    };
}
