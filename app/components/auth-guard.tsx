import { redirect } from "next/navigation";
import { getSession, type Role } from "../../lib/session";

export async function AuthGuard({
  role,
  roles,
  loginHref,
  children,
}: {
  role?: Role | Role[];
  roles?: Role[];
  loginHref: string;
  children: React.ReactNode;
}) {
  const session = await getSession();
  const allowedRoles: Role[] = roles ?? (Array.isArray(role) ? role : role ? [role] : []);
  if (!session || (allowedRoles.length > 0 && !allowedRoles.includes(session.role))) {
    redirect(loginHref);
  }
  return <>{children}</>;
}
