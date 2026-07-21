"use client";

import { createRoom } from "../actions";
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

export default function createRoomDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Create Room</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Room</DialogTitle>
        </DialogHeader>

        <form action={createRoom} className="space-y-4">
          <div>
            <Label htmlFor="name">Room Name</Label>

            <Input
              id="name"
              name="name"
              placeholder="Friday Campaign"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
