import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import DashboardMenu from "./dashboard-components/dashboard-menu";
import SignOutButton from "@/components/sign-out-btn";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  return (
    <main className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-[0.01em]">
            Welcome {session.user.name}
          </h1>

          <span className="h-px w-24 bg-gradient-to-r from-[var(--ember)] to-transparent" />
        </div>

        <SignOutButton />
      </div>

      <DashboardMenu />
    </main>
  );
}