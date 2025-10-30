import { PrismaClient } from "@/generated/prisma";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const createClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error", "warn"],
  });

export const prisma = global.prismaGlobal ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal ??= prisma;
}
