"use server";

import { v4 as uuid } from "uuid";
import { z } from "zod";
import { withSessionAction } from "@/server/auth";
import { db } from "@/db";
import { token } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createToken = withSessionAction(
  z.object({ description: z.string().min(1) }),
  async ({ description }, session) => {
    const userId = session.user.id;
    const t = await db
      .insert(token)
      .values({ userId, description, createdAt: new Date(), token: uuid() });
  },
);

export const deleteToken = withSessionAction(
  z.object({ id: z.number() }),
  async ({ id }, session) => {
    await db.delete(token).where(eq(token.id, id));
  },
);

export const getTokenList = withSessionAction(null, async (_, session) => {
  const list = await db
    .select({
      createdAt: token.createdAt,
      id: token.id,
      expireAt: token.expireAt,
      token: token.token,
      description: token.description,
    })
    .from(token)
    .where(eq(token.userId, session.user.id));

  return list;
});
