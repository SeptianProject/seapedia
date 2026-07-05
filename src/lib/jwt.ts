import { SignJWT, jwtVerify, type JWTPayload } from "jose";

function getSecretKey() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return new TextEncoder().encode(jwtSecret);
}

export interface UserTokenPayload extends JWTPayload {
  sub: string;
  username: string;
  roles: string[];
  activeRole?: string;
}

export async function signToken(
  payload: UserTokenPayload,
  expiresIn: string = "2h",
): Promise<string> {
  const secretKey = getSecretKey();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyToken(
  token: string,
): Promise<UserTokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as UserTokenPayload;
  } catch (error) {
    console.error("[JWT] Verification failed:", (error as Error).message);
    return null;
  }
}
