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
export async function joinRoom(formData: FormData) {
  //obtiene el usuario de la session actual
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to join a room.");
  }
  //del formulario obtiene el codigo de sala
  const roomCode = formData.get("code")?.toString().trim();

  if (!roomCode) {
    throw new Error("Room code is required.");
  }
  console.log("Código recibido:", roomCode);

  //query para buscar sala
  const room = await prisma.room.findUnique({
    where: {
      code: roomCode,
    },
  });

  //testear 
  //if (!room) {
    //throw new Error("Room not found.");
  //}
  //retornar en caso de que no exista sala
  if (!room) {
    return {
      success: false,
      message: 'Room not found.',
      error: true,

    };
  }

  //si el usuario ya entro a esa sala
  const existingMember = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: room.id,
        userId: session.user.id,
      },
    },
  });

  // Si ya pertenece a la sala simplemente redirige
  if (existingMember) {
    redirect(`/room/${room.id}`);
  }

  //si es nuevo usuario en la sala lo agrega como miembro de la sala
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: session.user.id,
      isDM: false,
    },
  });

  redirect(`/room/${room.id}`);
}