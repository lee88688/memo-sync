import NextAuth, { Session } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubAuthProvider from "next-auth/providers/github";
import { db } from "@/db";
import { isValidUser } from "@/server/service/user";
import { env } from "@/env";
import { User } from "@/db/schema";
import { redirect } from "next/navigation";
import { TypeOf, ZodError, ZodTypeAny } from "zod";

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// this error is used for transferring error from server to client
export class RequestError extends Error {
  constructor(
    message: string,
    public error?: unknown,
  ) {
    super(message);
  }
}

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

export function withSessionAction<
  H extends (params: null, session: Session) => unknown,
>(
  schema: null,
  handler: H,
): () => Promise<{ isSuccess: true; data: UnwrapPromise<ReturnType<H>> }>;

export function withSessionAction<
  Z extends ZodTypeAny,
  H extends (params: TypeOf<Z>, session: Session) => unknown,
>(
  schema: Z,
  handler: H,
): (
  params: TypeOf<Z>,
) => Promise<{ isSuccess: true; data: UnwrapPromise<ReturnType<H>> }>;

export function withSessionAction<
  Z extends ZodTypeAny,
  H extends (params: TypeOf<Z>, session: Session) => unknown,
>(schema: Z | null, handler: H) {
  return async function action(params: TypeOf<Z>) {
    const session = await auth();
    if (!session?.user) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    let data;
    try {
      const parsedParams = (await schema?.parseAsync(
        params,
      )) as TypeOf<Z> | null;
      data = await handler(parsedParams ?? params, session);
    } catch (e) {
      // ZodError and RequestError need to be transferred to client
      if (e instanceof ZodError) {
        return {
          isSuccess: false,
          data: undefined,
          message: e.errors[0]?.message ?? "",
          error: e.errors,
        };
      } else if (e instanceof RequestError) {
        return {
          isSuccess: false,
          data: undefined,
          message: e.message,
          error: e.error,
        };
      }
    }

    return { isSuccess: true, data };
  };
}
