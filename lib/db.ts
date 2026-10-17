import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  globalDb.prisma ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL || "file:./dev.db" } },
  });
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
