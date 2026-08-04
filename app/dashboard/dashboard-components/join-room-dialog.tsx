"use client";
import { useState } from "react";
import { useActionState } from "react";
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
  const [error, setError]= useState(false);
  const [message, setMessage]= useState("");

  async function handleSubmit(formData: FormData) {
    setError(false);

    const result = await joinRoom(formData);
    console.log(message);

    if (!result.success) {
      setError(result.error);
      setMessage(result.message);
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button>Join Room</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Room code</Label>

            <Input id="code" name="code" placeholder="abc1234" required />
          </div>

          <Button type="submit" className="w-full">
            Join
          </Button>
          <div>
            {error ==true ? (
              <Label className="text-red-500">
                {message}
              </Label>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
