import {
  pgTable,
  text,
  integer,
  serial,
  pgEnum,
  date,
  jsonb,
  timestamp,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

export const user = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  password: varchar("password", { length: 64 }),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const account = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const oauthType = pgEnum("oauth_type", ["github", "weibo"]);

export const oauth = pgTable("oauth", {
  id: serial("id").primaryKey(),
  type: oauthType("type"),
  userId: text("user_id").references(() => user.id),
});

export type HookType = "x" | "weibo";

export const hook = pgTable("hook", {
  id: serial("id").primaryKey(),
  typeList: jsonb("type_list").$type<HookType[]>().notNull(),
  userId: text("user_id").references(() => user.id),
});

export const filterType = pgEnum("filter_type", ["tag", "none"]);

export const filter = pgTable("filter", {
  id: serial("id").primaryKey(),
  type: filterType("type").notNull(),
  userId: text("user_id").references(() => user.id),
});

export const token = pgTable("token", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  expireAt: date("expire_at", { mode: "date" }).notNull(),
  description: text("description").notNull().notNull(),
  createdAt: date("created_at", { mode: "date" }).notNull(),
});

export type User = typeof user.$inferSelect;
export type OAuth = typeof oauth.$inferSelect;
export type Hook = typeof hook.$inferSelect;
export type Filter = typeof filter.$inferSelect;
export type Token = typeof token.$inferSelect;
