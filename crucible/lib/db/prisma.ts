import { PrismaClient } from "@prisma/client";

declare global {
  var __cruciblePrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__cruciblePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__cruciblePrisma = prisma;
}
