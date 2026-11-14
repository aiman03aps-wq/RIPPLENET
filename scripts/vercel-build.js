const { execSync } = require("child_process");

console.log("=== Vercel Build Pipeline Starting ===");

// 1. Ensure DIRECT_URL fallback if only DATABASE_URL is set
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  console.log("Setting DIRECT_URL = DATABASE_URL fallback for Prisma");
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// 2. Generate Prisma Client
console.log("Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
} catch (err) {
  console.error("Prisma generate failed:", err.message);
  process.exit(1);
}

// 3. Push schema to database if DATABASE_URL is available
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
  console.log("Syncing database schema with prisma db push...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env: process.env });
    console.log("Database schema synced successfully.");
  } catch (err) {
    console.warn("Notice: prisma db push warning during build (proceeding):", err.message);
  }
} else {
  console.log("Skipping prisma db push for local/dummy database URL during static build.");
}

// 4. Build Next.js Application with webpack
console.log("Building Next.js application with webpack...");
try {
  execSync("npx next build --webpack", { stdio: "inherit", env: process.env });
  console.log("=== Vercel Build Completed Successfully ===");
} catch (err) {
  console.error("Next.js build failed:", err.message);
  process.exit(1);
}
