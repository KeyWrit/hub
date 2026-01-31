// KeyWrit Hub Storage Types

export interface Client {
    client: string;
    label?: string;
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
    jti: string;
    sub: string;
    iss?: string;
    aud?: string | string[];
    kind?: string;
    flags?: string[];
    features?: Record<string, unknown>;
    allowedDomains?: string[];
    exp?: number;
    nbf?: number;
    iat: number;
    token: string;
    createdAt: number;
    label?: string;
}

export interface Realm {
    realm: string;
    label?: string;
    keyPair: KeyPair;
    defaults: RealmDefaults;
    clients: Client[];
    licenses: License[];
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
        realm: string;
        label?: string;
        privateKey: JsonWebKey;
        publicKey: JsonWebKey;
        publicKeyHex: string;
        defaults: RealmDefaults;
        clients?: Client[];
        licenses?: License[];
    };
}
