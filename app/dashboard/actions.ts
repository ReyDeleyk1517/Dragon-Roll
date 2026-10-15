"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateUniqueRoomCode } from "@/app/room/room-random-code-generator";

export async function createRoom(formData: FormData) {
  //obtiene la sesion
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }
  //nombre del formulario
  const roomName = formData.get("name")?.toString().trim();

  if (!roomName) {
    throw new Error("Room name required");
  }
  //metodo auxiliar para generar un codigo aleatorio
  const code = await generateUniqueRoomCode(prisma);
  //crea la sala
  const room = await prisma.room.create({
    data: {
      name: roomName,
      code,
      createdById: session.user.id,
    },
  });

  //agrega el usuario que creo el room como dm
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: session.user.id,
      isDM: true,
    },
  });

  redirect(`/room/${room.id}`);
}
