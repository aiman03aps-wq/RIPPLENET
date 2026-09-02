import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "ripplenet-dev-secret-change-in-production"
);

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
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
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
