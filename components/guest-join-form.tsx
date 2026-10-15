"use client";

import { useActionState } from "react";

import { joinRoomAsGuest } from "@/app/room/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GUEST_NAME_MAX_LENGTH } from "@/lib/guest";

type Props = {
  /** When provided, the guest is joining this room directly (code not asked). */
  roomId?: string;
  /** Prefills the nickname, e.g. from a previous guest session. */
  defaultName?: string;
};

export default function GuestJoinForm({ roomId, defaultName = "" }: Props) {
  const [state, formAction, isPending] = useActionState(joinRoomAsGuest, null);

  return (
    <form action={formAction} className="space-y-4">
      {roomId ? (
        <input type="hidden" name="roomId" value={roomId} />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="guest-room-code">Room code</Label>

          <Input
            id="guest-room-code"
            name="code"
            placeholder="abc1234"
            autoComplete="off"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="guest-nickname">Nickname</Label>

        <Input
          id="guest-nickname"
          name="nickname"
          placeholder="e.g. Brave Rogue"
          defaultValue={defaultName}
          maxLength={GUEST_NAME_MAX_LENGTH}
          autoComplete="off"
          required
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Joining..." : "Join as guest"}
      </Button>
    </form>
  );
}
