import { redirect } from "next/navigation";
import { getSession, type Role } from "../../lib/session";

export async function AuthGuard({
  role,
  loginHref,
  children,
}: {
  role: Role;
  loginHref: string;
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== role) {
    redirect(loginHref);
  }
  return <>{children}</>;
}
