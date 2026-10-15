import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

import { auth } from "@/lib/auth";
import { GUEST_NAME_COOKIE } from "@/lib/guest";
import { BrandMark } from "@/components/brand-mark";
import GuestJoinForm from "@/components/guest-join-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Signed-in users go straight to their dashboard.
  if (session) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const guestNickname = cookieStore.get(GUEST_NAME_COOKIE)?.value ?? "";

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 p-6 md:p-10">
      <BrandMark className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700" />

      <div className="w-full max-w-md space-y-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 motion-safe:duration-700">
        <Card>
          <CardHeader>
            <CardTitle>Enter a game room</CardTitle>
            <CardDescription>
              Join a session as a guest with a nickname, or sign in to create
              rooms and save characters.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <GuestJoinForm defaultName={guestNickname} />

            <div className="relative flex items-center">
              <span className="h-px flex-1 bg-[color-mix(in_oklch,var(--gold),transparent_82%)]" />
              <span className="px-3 text-xs tracking-widest text-muted-foreground uppercase">
                or
              </span>
              <span className="h-px flex-1 bg-[color-mix(in_oklch,var(--gold),transparent_82%)]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <LogIn className="size-4" strokeWidth={1.75} />
                  Sign in
                </Button>
              </Link>

              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  <UserPlus className="size-4" strokeWidth={1.75} />
                  Create account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Guests can join rooms and take part in a session. Creating rooms,
          characters, and saved monsters requires an account.
        </p>
      </div>
    </div>
  );
}
