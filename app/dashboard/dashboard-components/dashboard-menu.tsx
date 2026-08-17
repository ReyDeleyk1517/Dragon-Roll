import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CreateRoomDialog from "./create-room-dialog";
import joinRoomDialog from "./join-room-dialog";
import JoinRoomDialog from "./join-room-dialog";

export default function DashboardMenu() {
  return (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold"> Create Room</h2>

        <p>Create a new game room.</p>

        <CreateRoomDialog />
      </Card>

      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold"> Join Room</h2>
        <p>Join an existing game room</p>

        <JoinRoomDialog/>
      </Card>

      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold"> My characters and npc's</h2>

         <Link href="/characters">
          <Button className="w-full">
            Manage Characters
          </Button>
        </Link>
      </Card>
    </div>
  );
}