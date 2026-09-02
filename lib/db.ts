import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function resolveSqliteDatabaseUrl(): string {
  // If user configured a non-sqlite or custom cloud DB URL, respect it
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith("file:.") &&
    !process.env.DATABASE_URL.startsWith("file:dev.db")
  ) {
    return process.env.DATABASE_URL;
  }

  // Detect serverless environment (Vercel / AWS Lambda / read-only filesystem)
  const isServerless =
    process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.LAMBDA_TASK_ROOT !== undefined;

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    // Copy bundled seed database to /tmp so SQLite has full read/write permissions
    if (!fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
          try {
            fs.copyFileSync(/*turbopackIgnore: true*/ candidate, tmpDbPath);
            break;
          } catch (e) {
            console.warn("Failed to copy sqlite db to /tmp from", candidate, e);
          }
        }
      }
    }

    const resolvedUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = resolvedUrl;
    return resolvedUrl;
  }

  // Local development environment
  const localDb = path.join(process.cwd(), "prisma", "dev.db");
  const localUrl = `file:${localDb}`;
  process.env.DATABASE_URL = localUrl;
  return localUrl;
}

const dbUrl = resolveSqliteDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
