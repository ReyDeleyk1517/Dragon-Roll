import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "@/components/sign-out-btn";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Sesión:", session);

  return (
    <div>
      <h1>Hola {session?.user.name}</h1>

      <SignOutButton />
    </div>
  );
}