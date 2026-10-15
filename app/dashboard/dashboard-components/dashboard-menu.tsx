import Link from "next/link";
import { LogIn, Plus, ScrollText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CreateRoomDialog from "./create-room-dialog";
import JoinRoomDialog from "./join-room-dialog";

const panelClass =
  "p-6 flex flex-col gap-4 transition-colors hover:ring-[color-mix(in_oklch,var(--ember),transparent_62%)]";

const emblemClass =
  "flex size-10 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--ember),transparent_86%)] text-[var(--ember)] ring-1 ring-[color-mix(in_oklch,var(--ember),transparent_70%)]";

export default function DashboardMenu() {
  return (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      <Card className={panelClass}>
        <span className={emblemClass}>
          <Plus className="size-5" strokeWidth={1.75} />
        </span>

        <h2 className="text-xl font-semibold"> Create Room</h2>

        <p className="text-sm text-muted-foreground">Create a new game room.</p>

        <CreateRoomDialog />
      </Card>

      <Card className={panelClass}>
        <span className={emblemClass}>
          <LogIn className="size-5" strokeWidth={1.75} />
        </span>

        <h2 className="text-xl font-semibold"> Join Room</h2>
        <p className="text-sm text-muted-foreground">Join an existing game room</p>

        <JoinRoomDialog />
      </Card>

      <Card className={panelClass}>
        <span className={emblemClass}>
          <ScrollText className="size-5" strokeWidth={1.75} />
        </span>

        <h2 className="text-xl font-semibold"> My characters and npc&apos;s</h2>

        <Link href="/characters">
          <Button className="w-full">Manage Characters</Button>
        </Link>
      </Card>
    </div>
  );
}
