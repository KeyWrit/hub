// KeyWrit Hub Storage Types

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

export interface RevocationEntry {
    id: string;
    type: "jti" | "sub";
    value: string;
    reason?: string;
    revokedAt: number;
}

export interface Realm {
    id: string;
    name: string;
    description?: string;
    keyPair: KeyPair;
    defaults: RealmDefaults;
    licenses: Record<string, License>;
    revocations: RevocationEntry[];
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
        licenses?: Record<string, License>;
        revocations?: RevocationEntry[];
    };
}
