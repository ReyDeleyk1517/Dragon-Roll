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
    <main className="max-w-5xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Welcome {session.user.name}
        </h1>

        <SignOutButton />
      </div>

      <DashboardMenu />
    </main>
  );
}