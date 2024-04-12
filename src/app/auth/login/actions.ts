"use server";

import { signIn } from "@/server/auth";

export async function oauthSignIn(type: Parameters<typeof signIn>[0]) {
  await signIn(type, { redirectTo: "/setting/auth" });
}
