import { describe, expect, it } from "vitest";
import { generateEd25519KeyPair, importKeyPair } from "@/lib/crypto/keys";

describe("Ed25519 key generation", () => {
    it("generates a valid key pair", async () => {
        const keyPair = await generateEd25519KeyPair();

        expect(keyPair.privateKey).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.publicKeyHex).toBeDefined();
        expect(keyPair.createdAt).toBeGreaterThan(0);
    });

    it("generates hex public key of correct length", async () => {
        const keyPair = await generateEd25519KeyPair();

        // Ed25519 public key is 32 bytes = 64 hex characters
        expect(keyPair.publicKeyHex).toHaveLength(64);
        expect(keyPair.publicKeyHex).toMatch(/^[0-9a-f]+$/);
    });

    it("generates unique keys each time", async () => {
        const keyPair1 = await generateEd25519KeyPair();
        const keyPair2 = await generateEd25519KeyPair();

        expect(keyPair1.publicKeyHex).not.toBe(keyPair2.publicKeyHex);
    });

    it("can import generated keys", async () => {
        const keyPair = await generateEd25519KeyPair();
        const imported = await importKeyPair(
            keyPair.privateKey,
            keyPair.publicKey,
        );

        expect(imported.privateKey).toBeInstanceOf(CryptoKey);
        expect(imported.publicKey).toBeInstanceOf(CryptoKey);
    });

    it("private key has correct JWK format", async () => {
        const keyPair = await generateEd25519KeyPair();

        expect(keyPair.privateKey.kty).toBe("OKP");
        expect(keyPair.privateKey.crv).toBe("Ed25519");
        expect(keyPair.privateKey.d).toBeDefined();
    });

    it("public key has correct JWK format", async () => {
        const keyPair = await generateEd25519KeyPair();

        expect(keyPair.publicKey.kty).toBe("OKP");
        expect(keyPair.publicKey.crv).toBe("Ed25519");
        expect(keyPair.publicKey.x).toBeDefined();
        expect(keyPair.publicKey.d).toBeUndefined();
    });
});
