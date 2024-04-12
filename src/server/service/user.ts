import { eq, and } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db } from "@/db";
import { user } from "@/db/schema";

export function getPasswordHash(password: string) {
  const hash = createHash("sha256");
  return hash.update(password).digest("hex");
}

export async function isValidUser(email: string, password: string) {
  const passwordHash = getPasswordHash(password);
  const res = await db
    .select({
      id: user.id,
      email: user.email,
    })
    .from(user)
    .where(and(eq(user.email, email), eq(user.password, passwordHash)))
    .limit(1);

  if (!res.length) return null;

  return res[0];
}
