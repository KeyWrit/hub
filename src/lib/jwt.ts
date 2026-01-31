import * as jose from 'jose'

export async function generateJWT(
  payload: Record<string, unknown>,
  privateKey: string,
  algorithm: string = 'RS256'
): Promise<string> {
  const key = await jose.importPKCS8(privateKey, algorithm)

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .sign(key)

  return jwt
}
