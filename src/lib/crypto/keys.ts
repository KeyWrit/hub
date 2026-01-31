import * as jose from "jose";
import type { Ed25519KeyPair } from "@/lib/types";

export async function generateEd25519KeyPair(): Promise<Ed25519KeyPair> {
    const { publicKey, privateKey } = await jose.generateKeyPair("EdDSA", {
        crv: "Ed25519",
        extractable: true,
    });

    const privateJwk = await jose.exportJWK(privateKey);
    const publicJwk = await jose.exportJWK(publicKey);

    const publicKeyBytes = await jose.exportSPKI(publicKey);
    const publicKeyHex = spkiToHex(publicKeyBytes);

    return {
        privateKey: privateJwk,
        publicKey: publicJwk,
        publicKeyHex,
        createdAt: Date.now(),
    };
}

function spkiToHex(spki: string): string {
    const base64 = spki
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s/g, "");

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    // Ed25519 SPKI has a 12-byte header, the raw public key is the last 32 bytes
    const rawKey = bytes.slice(-32);
    return Array.from(rawKey)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function importKeyPair(
    privateJwk: JsonWebKey,
    publicJwk: JsonWebKey,
): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey }> {
    const privateKey = await jose.importJWK(privateJwk, "EdDSA");
    const publicKey = await jose.importJWK(publicJwk, "EdDSA");

    if (
        !(privateKey instanceof CryptoKey) ||
        !(publicKey instanceof CryptoKey)
    ) {
        throw new Error("Failed to import keys");
    }

    return { privateKey, publicKey };
}
