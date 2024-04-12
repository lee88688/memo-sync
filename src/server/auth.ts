import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubAuthProvider from "next-auth/providers/github";
import { db } from "@/db";
import { isValidUser } from "@/server/service/user";
import { env } from "@/env";
import { User } from "@/db/schema";
import { redirect } from "next/navigation";

declare module "next-auth" {
  interface Session {
    user: Pick<User, "id" | "email">;
  }
}

const OAuthProviders = [
  GithubAuthProvider({
    clientId: env.AUTH_GITHUB_ID,
    clientSecret: env.AUTH_GITHUB_SECRET,
  }),
];

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: env.NEXT_AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  // @ts-ignore
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      async authorize(credentials, req) {
        const email = credentials.email as string;
        const password = credentials.password as string;
        return isValidUser(email, password);
      },
    }),
    ...OAuthProviders,
  ],
});

export async function appPageAuth() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  return session;
}
