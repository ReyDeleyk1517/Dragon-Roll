"use client";

import { useActionState } from "react";

import { joinRoomAsUser } from "@/app/room/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinRoomDialog() {
  const [state, formAction, isPending] = useActionState(joinRoomAsUser, null);

  return (
    <Dialog>
      <DialogTrigger render={<Button>Join Room</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="code">Room code</Label>

            <Input id="code" name="code" placeholder="abc1234" required />
          </div>

          {state?.error ? (
            <p className="text-sm text-red-500">{state.error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Joining..." : "Join"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
