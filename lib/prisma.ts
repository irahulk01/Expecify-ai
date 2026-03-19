import { PrismaClient } from "@prisma/client";
// Force client reload after schema change

// This helps ensure we always have the latest client in the global scope across hot reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
