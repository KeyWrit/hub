import * as jose from "jose";
import type { License, Realm } from "@/lib/types";

export const KEYWRIT_VERSION = 1;
export const KEYWRIT_ISSUER = "keywrit";
export const KEYWRIT_TYPE = "KWL";

export interface LicenseParams {
    clientId: string;
    label?: string;
    kind?: string;
    flags?: string[];
    features?: Record<string, unknown>;
    allowedDomains?: string[];
    expiresAt?: number;
    notBefore: number;
}

export async function createLicense(
    realm: Realm,
    params: LicenseParams,
): Promise<License> {
    const privateKey = await jose.importJWK(realm.keyPair.privateKey, "EdDSA");

    if (!(privateKey instanceof CryptoKey)) {
        throw new Error("Failed to import private key");
    }

    const now = Math.floor(Date.now() / 1000);
    const id = crypto.randomUUID();

    // Merge realm defaults with provided params (params take precedence)
    const kind = params.kind ?? realm.defaults.kind;
    const flags = params.flags ?? realm.defaults.flags;
    const features = params.features ?? realm.defaults.features;
    const allowedDomains =
        params.allowedDomains ?? realm.defaults.allowedDomains;

    // Calculate expiration from offset if not explicitly provided
    let expiresAt = params.expiresAt;
    if (expiresAt === undefined && realm.defaults.expirationOffsetSeconds) {
        expiresAt = now + realm.defaults.expirationOffsetSeconds;
    }

    // Build JWT payload (uses JWT claim names for the token)
    const payload: jose.JWTPayload = {
        jti: id,
        sub: params.clientId,
        iss: KEYWRIT_ISSUER,
        aud: realm.id,
    };
    if (kind) payload.kind = kind;
    if (flags && flags.length > 0) payload.flags = flags;
    if (features && Object.keys(features).length > 0)
        payload.features = features;
    if (allowedDomains && allowedDomains.length > 0)
        payload.allowedDomains = allowedDomains;
    if (expiresAt) payload.exp = expiresAt;
    payload.nbf = params.notBefore;

    const token = await new jose.SignJWT(payload)
        .setProtectedHeader({
            alg: "EdDSA",
            typ: KEYWRIT_TYPE,
            kwv: KEYWRIT_VERSION,
        })
        .setIssuedAt(now)
        .sign(privateKey);

    const license: License = {
        id,
        kind,
        flags,
        features,
        allowedDomains,
        expiresAt,
        notBefore: params.notBefore,
        issuedAt: now,
        token,
        createdAt: Date.now(),
        label: params.label,
    };

    return license;
}
