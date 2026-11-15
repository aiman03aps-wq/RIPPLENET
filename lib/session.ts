import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getJwtSecret(): Uint8Array {
  const envSecret = process.env.AUTH_SECRET;
  if (!envSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: AUTH_SECRET environment variable is missing in production. Refusing to operate session authentication with insecure fallback."
      );
    }
    return new TextEncoder().encode("ripplenet-dev-secret-change-in-production");
  }
  return new TextEncoder().encode(envSecret);
}

export const SESSION_COOKIE = "ripplenet_session";

export type Role = "volunteer" | "camp_manager" | "admin";

export interface SessionUser {
  id: number;
  username: string;
  role: Role;
  name: string;
  campId: number | null;
}

export async function createSession(user: SessionUser) {
  const secretKey = getJwtSecret();
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    campId: user.campId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.id !== "number" || typeof payload.role !== "string") return null;
    return {
      id: payload.id,
      username: payload.username as string,
      role: payload.role as Role,
      name: payload.name as string,
      campId: (payload.campId as number | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireRole(role: Role): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.role !== role) return null;
  return session;
}

export const roleLabels: Record<Role, string> = {
  volunteer: "Volunteer",
  camp_manager: "Camp Manager",
  admin: "Admin",
};
