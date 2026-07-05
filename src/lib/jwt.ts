import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

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
    const { payload } = await jwtVerify(token, secretKey);
    return payload as UserTokenPayload;
  } catch (error) {
    console.error("[JWT] Verification failed:", (error as Error).message);
    return null;
  }
}
