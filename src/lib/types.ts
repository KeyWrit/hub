// KeyWrit Hub Storage Types

export interface KeyPair {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
    publicKeyHex: string;
    createdAt: number;
}

export interface RealmDefaults {
    iss?: string;
    aud?: string | string[];
    kind?: string;
    flags?: string[];
    features?: Record<string, unknown>;
    allowedDomains?: string[];
    expirationOffsetSeconds?: number;
}

export interface Realm {
    id: string;
    name: string;
    description?: string;
    keyPair: KeyPair;
    defaults: RealmDefaults;
    createdAt: number;
    updatedAt: number;
}

export interface KeyWritHubStorage {
    version: number;
    activeRealmId: string | null;
    realms: Record<string, Realm>;
}

export interface ExportedRealm {
    exportVersion: 1;
    exportedAt: number;
    realm: {
        name: string;
        description?: string;
        privateKey: JsonWebKey;
        publicKey: JsonWebKey;
        publicKeyHex: string;
        defaults: RealmDefaults;
    };
}
