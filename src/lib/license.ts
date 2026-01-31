import * as jose from "jose";
import type { License, Realm } from "@/lib/types";

export interface LicenseParams {
    sub: string;
    label?: string;
    iss?: string;
    aud?: string | string[];
    kind?: string;
    flags?: string[];
    features?: Record<string, unknown>;
    allowedDomains?: string[];
    exp?: number;
    nbf?: number;
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
    const jti = crypto.randomUUID();

    // Merge realm defaults with provided params (params take precedence)
    const iss = params.iss ?? realm.defaults.iss;
    const aud = params.aud ?? realm.defaults.aud;
    const kind = params.kind ?? realm.defaults.kind;
    const flags = params.flags ?? realm.defaults.flags;
    const features = params.features ?? realm.defaults.features;
    const allowedDomains =
        params.allowedDomains ?? realm.defaults.allowedDomains;

    // Calculate expiration from offset if not explicitly provided
    let exp = params.exp;
    if (exp === undefined && realm.defaults.expirationOffsetSeconds) {
        exp = now + realm.defaults.expirationOffsetSeconds;
    }

    // Build JWT payload
    const payload: jose.JWTPayload = {
        jti,
        sub: params.sub,
    };

    if (iss) payload.iss = iss;
    if (aud) payload.aud = aud;
    if (kind) payload.kind = kind;
    if (flags && flags.length > 0) payload.flags = flags;
    if (features && Object.keys(features).length > 0)
        payload.features = features;
    if (allowedDomains && allowedDomains.length > 0)
        payload.allowedDomains = allowedDomains;
    if (exp) payload.exp = exp;
    if (params.nbf) payload.nbf = params.nbf;

    const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "EdDSA" })
        .setIssuedAt(now)
        .sign(privateKey);

    const license: License = {
        id: crypto.randomUUID(),
        jti,
        sub: params.sub,
        iss,
        aud,
        kind,
        flags,
        features,
        allowedDomains,
        exp,
        nbf: params.nbf,
        iat: now,
        token,
        createdAt: Date.now(),
        label: params.label,
    };

    return license;
}
