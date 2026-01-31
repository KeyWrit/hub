import { describe, expect, it } from "vitest";
import { generateKeyPair, importKeyPair } from "@/lib/crypto/keys";

describe("key pair generation", () => {
    it("generates a valid key pair", async () => {
        const keyPair = await generateKeyPair();

        expect(keyPair.privateKey).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.publicKeyHex).toBeDefined();
        expect(keyPair.createdAt).toBeGreaterThan(0);
    });

    it("generates hex public key of correct length", async () => {
        const keyPair = await generateKeyPair();

        // Current implementation uses Ed25519: 32 bytes = 64 hex characters
        expect(keyPair.publicKeyHex).toHaveLength(64);
        expect(keyPair.publicKeyHex).toMatch(/^[0-9a-f]+$/);
    });

    it("generates unique keys each time", async () => {
        const keyPair1 = await generateKeyPair();
        const keyPair2 = await generateKeyPair();

        expect(keyPair1.publicKeyHex).not.toBe(keyPair2.publicKeyHex);
    });

    it("can import generated keys", async () => {
        const keyPair = await generateKeyPair();
        const imported = await importKeyPair(
            keyPair.privateKey,
            keyPair.publicKey,
        );

        expect(imported.privateKey).toBeInstanceOf(CryptoKey);
        expect(imported.publicKey).toBeInstanceOf(CryptoKey);
    });

    it("private key has correct JWK format", async () => {
        const keyPair = await generateKeyPair();

        expect(keyPair.privateKey.kty).toBe("OKP");
        expect(keyPair.privateKey.d).toBeDefined();
    });

    it("public key has correct JWK format", async () => {
        const keyPair = await generateKeyPair();

        expect(keyPair.publicKey.kty).toBe("OKP");
        expect(keyPair.publicKey.x).toBeDefined();
        expect(keyPair.publicKey.d).toBeUndefined();
    });
});
