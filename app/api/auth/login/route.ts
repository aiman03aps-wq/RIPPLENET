import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, roleLabels, type Role } from "@/lib/session";

// Explicitly development-only mock credentials for offline testing.
// Requires: process.env.NODE_ENV === "development" AND process.env.ENABLE_LOCAL_DEMO_AUTH === "true"
// NEVER active or reachable in production.
const LOCAL_DEMO_ACCOUNTS: Record<
  string,
  { id: number; role: Role; name: string; campId: number | null; passwordHash: string }
> = {
  "admin@alkhidmat.org": {
    id: 1,
    role: "admin",
    name: "System Administrator (Demo)",
    campId: null,
    // bcrypt hash for "admin2025"
    passwordHash: "$2b$10$p54X0msVkDt6f6IGIdDcPuy3YlN9udXKHWcdTURgx4KjEtNNnmnfG",
  },
  "volunteer@alkhidmat.org": {
    id: 3,
    role: "volunteer",
    name: "Field Volunteer (Demo)",
    campId: null,
    // bcrypt hash for "volunteer2025"
    passwordHash: "$2b$10$Wb.ebCfm4Z6rHB1I9s/OPulpUHqdOj8wrZzSPOGTwTexjjhE3Wc5G",
  },
  "camp@alkhidmat.org": {
    id: 2,
    role: "camp_manager",
    name: "Camp Manager (Demo Dadu)",
    campId: 1,
    // bcrypt hash for "camp2025"
    passwordHash: "$2b$10$W/ygdGvDboAPvwR7dtfl1.0nexUbcxfSLrT6nWe4ZMQCHVbm5fbNO",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "") as Role;

    if (!identifier || !password || !role) {
      return Response.json({ error: "Missing credentials" }, { status: 400 });
    }

    const digits = identifier.replace(/\D/g, "");
    const phoneTail = digits.length >= 10 ? digits.slice(-10) : digits;

    const isLocalDemoAuth =
      process.env.NODE_ENV === "development" &&
      process.env.ENABLE_LOCAL_DEMO_AUTH === "true";

    let user = null;
    let dbLookupError: Error | null = null;

    try {
      user =
        (await prisma.user.findUnique({ where: { username: identifier } })) ??
        (phoneTail.length >= 7
          ? await prisma.user.findFirst({ where: { phone: { contains: phoneTail } } })
          : null);
    } catch (err) {
      dbLookupError = err as Error;
      console.error("Database authentication query error:", dbLookupError.message);
    }

    // Fail closed: If database lookup failed and demo mode is NOT explicitly enabled in development,
    // refuse authentication immediately. No session may be issued on database failure.
    if (dbLookupError && !isLocalDemoAuth) {
      return Response.json(
        { error: "Authentication service temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    // Separate, explicitly development-only demonstration mechanism
    if (!user && isLocalDemoAuth) {
      const demoAccount = LOCAL_DEMO_ACCOUNTS[identifier];
      if (demoAccount) {
        if (demoAccount.role !== role) {
          return Response.json(
            {
              error: `Wrong portal — these are ${roleLabels[demoAccount.role]} credentials. Please use the ${roleLabels[demoAccount.role]} login.`,
              actualRole: demoAccount.role,
            },
            { status: 403 }
          );
        }

        // Strict password verification — zero unauthenticated access
        const demoPasswordOk = await bcrypt.compare(password, demoAccount.passwordHash);
        if (!demoPasswordOk) {
          return Response.json({ error: "Incorrect password. Please try again." }, { status: 401 });
        }

        const demoSessionUser = {
          id: demoAccount.id,
          username: identifier,
          role: demoAccount.role,
          name: demoAccount.name,
          campId: demoAccount.campId,
        };

        await createSession(demoSessionUser);
        return Response.json({ user: demoSessionUser });
      }
    }

    if (!user) {
      return Response.json(
        { error: "No account found for this ID. Please check and try again." },
        { status: 401 }
      );
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return Response.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    if (user.role !== role) {
      return Response.json(
        {
          error: `Wrong portal — these are ${roleLabels[user.role as Role]} credentials. Please use the ${roleLabels[user.role as Role]} login.`,
          actualRole: user.role,
        },
        { status: 403 }
      );
    }

    await createSession({
      id: user.id,
      username: user.username,
      role: user.role as Role,
      name: user.name,
      campId: user.campId,
    });

    return Response.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role, campId: user.campId },
    });
  } catch {
    return Response.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
