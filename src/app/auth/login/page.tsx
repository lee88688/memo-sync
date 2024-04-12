import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Login } from "@/app/auth/login/login";

export default async function Page() {
  const session = await auth();
  if (session) {
    redirect("/setting/auth");
  }

  return <Login />;
}
