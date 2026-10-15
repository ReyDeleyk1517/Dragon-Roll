"use client";

import { useActionState } from "react";

import { joinRoomAsUser } from "../../actions";
import { Button } from "@/components/ui/button";

type Props = {
  roomId: string;
};

export default function JoinRoomButton({ roomId }: Props) {
  const [state, formAction, isPending] = useActionState(joinRoomAsUser, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="roomId" value={roomId} />

      {state?.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Joining..." : "Join this room"}
      </Button>
    </form>
  );
}
