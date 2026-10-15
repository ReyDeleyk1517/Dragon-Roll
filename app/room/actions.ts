"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  GUEST_COOKIE_MAX_AGE,
  GUEST_NAME_COOKIE,
  guestMemberCookieName,
  normalizeGuestName,
  type RoomJoinState,
} from "@/lib/guest";

const GUEST_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: GUEST_COOKIE_MAX_AGE,
} as const;

/** Looks up a room by its id (preferred) or by its join code. */
async function findRoom(formData: FormData) {
  const roomId = formData.get("roomId")?.toString().trim();
  const code = formData.get("code")?.toString().trim();

  if (roomId) {
    return prisma.room.findUnique({ where: { id: roomId } });
  }

  if (code) {
    return prisma.room.findUnique({ where: { code } });
  }

  return null;
}

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Joins a room as a guest. The guest picks a nickname; no account is needed.
 * Membership is stored as a RoomMember with `guestName` and a cookie remembers
 * it so the guest stays identified while browsing.
 */
export async function joinRoomAsGuest(
  _prevState: RoomJoinState,
  formData: FormData
): Promise<RoomJoinState> {
  const nickname = normalizeGuestName(formData.get("nickname"));

  if (!nickname) {
    return {
      error: "Choose a nickname between 2 and 32 characters.",
    };
  }

  const room = await findRoom(formData);

  if (!room) {
    return {
      error: "Room not found. Check the code and try again.",
    };
  }

  // A signed-in user joins as themselves instead of as a guest.
  const session = await getSession();

  if (session) {
    const existing = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: session.user.id,
        },
      },
    });

    if (!existing) {
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: session.user.id,
          isDM: false,
        },
      });
    }

    redirect(`/room/${room.id}`);
  }

  const member = await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: null,
      guestName: nickname,
      isDM: false,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(guestMemberCookieName(room.id), member.id, GUEST_COOKIE_OPTIONS);
  cookieStore.set(GUEST_NAME_COOKIE, nickname, GUEST_COOKIE_OPTIONS);

  redirect(`/room/${room.id}`);
}

/**
 * Joins a room as an authenticated member (requires a session).
 */
export async function joinRoomAsUser(
  _prevState: RoomJoinState,
  formData: FormData
): Promise<RoomJoinState> {
  const session = await getSession();

  if (!session) {
    return {
      error: "You must sign in to join a room as a member.",
    };
  }

  const room = await findRoom(formData);

  if (!room) {
    return {
      error: "Room not found. Check the code and try again.",
    };
  }

  const existing = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: room.id,
        userId: session.user.id,
      },
    },
  });

  if (!existing) {
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        isDM: false,
      },
    });
  }

  redirect(`/room/${room.id}`);
}
