import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "ph_admin_token";
const TOKEN_TTL = "7d";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  name: string;
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

/** Reads and verifies the admin JWT from a Next.js request's cookies. Returns null if absent/invalid. */
export async function requireAdmin(req: Request): Promise<AdminTokenPayload | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyAdminToken(decodeURIComponent(match[1]));
}
