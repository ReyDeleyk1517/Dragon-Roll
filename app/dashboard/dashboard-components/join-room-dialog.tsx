"use client";

import { createRoom } from "../actions";
import { joinRoom } from "../actions";
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
  return (
    <Dialog>
      <DialogTrigger render={<Button>Join Room</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>

        <form action={joinRoom} className="space-y-4">
          <div>
            <Label htmlFor="code">Room code</Label>

            <Input id="code" name="code" placeholder="abc1234" required />
          </div>

          <Button type="submit" className="w-full">
            Join
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
