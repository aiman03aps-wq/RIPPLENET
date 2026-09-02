import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, roleLabels, type Role } from "@/lib/session";

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

    const user =
      (await prisma.user.findUnique({ where: { username: identifier } })) ??
      (phoneTail.length >= 7
        ? await prisma.user.findFirst({ where: { phone: { contains: phoneTail } } })
        : null);

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
