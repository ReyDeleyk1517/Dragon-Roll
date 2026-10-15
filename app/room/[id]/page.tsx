import { cookies, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  GUEST_NAME_COOKIE,
  guestMemberCookieName,
} from "@/lib/guest";
import prisma from "@/lib/prisma";
import GuestJoinForm from "@/components/guest-join-form";

import JoinRoomButton from "./room-components/join-room-button";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoomPage({ params }: Props) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: {
      id,
    },
    include: {
      members: {
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!room) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const cookieStore = await cookies();
  const guestMemberId = cookieStore.get(guestMemberCookieName(room.id))?.value;
  const guestNickname = cookieStore.get(GUEST_NAME_COOKIE)?.value ?? "";

  const viewerMember = session
    ? (room.members.find((member) => member.userId === session.user.id) ??
      null)
    : guestMemberId
      ? (room.members.find((member) => member.id === guestMemberId) ?? null)
      : null;

  const viewerName = viewerMember
    ? (viewerMember.user?.name ?? viewerMember.guestName ?? "Guest")
    : null;

  const dms = room.members.filter((member) => member.isDM);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-[0.01em]">
          {room.name}
        </h1>

        <span className="h-px w-24 bg-gradient-to-r from-[var(--ember)] to-transparent" />
      </div>

      <div className="rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.03),0_24px_50px_-32px_oklch(0_0_0/0.9)]">
        <dl className="divide-y divide-[color-mix(in_oklch,var(--gold),transparent_88%)]">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="font-heading text-lg font-semibold">{room.name}</dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-medium text-muted-foreground">Code</dt>
            <dd className="font-mono text-lg tracking-widest text-[var(--ember)]">
              {room.code}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Game Master
            </dt>
            <dd className="text-sm">
              {dms.length > 0
                ? dms
                    .map(
                      (dm) => dm.user?.name ?? dm.guestName ?? "Guest"
                    )
                    .join(", ")
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Members */}
      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-semibold">
          In this room ({room.members.length})
        </h2>

        {room.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No one has joined yet.
          </p>
        ) : (
          <ul className="divide-y divide-[color-mix(in_oklch,var(--gold),transparent_88%)] rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card">
            {room.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="text-sm">
                  {member.user?.name ?? member.guestName ?? "Guest"}
                  {!member.userId ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      guest
                    </span>
                  ) : null}
                </span>

                {member.isDM ? (
                  <span className="rounded-full bg-[color-mix(in_oklch,var(--ember),transparent_84%)] px-2 py-0.5 text-xs font-medium text-[var(--ember)]">
                    DM
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Join / membership status */}
      <section className="mt-8">
        {viewerMember ? (
          <p className="rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card px-4 py-3 text-sm">
            You are in this room as{" "}
            <span className="font-medium text-[var(--ember)]">
              {viewerName}
            </span>
            {viewerMember.isDM ? " (DM)" : ""}.
          </p>
        ) : session ? (
          <div className="rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card p-6">
            <h2 className="mb-1 font-heading text-xl font-semibold">
              Join this room
            </h2>

            <p className="mb-4 text-sm text-muted-foreground">
              You are signed in as {session.user.name}.
            </p>

            <JoinRoomButton roomId={room.id} />
          </div>
        ) : (
          <div className="rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card p-6">
            <h2 className="mb-1 font-heading text-xl font-semibold">
              Join this room
            </h2>

            <p className="mb-4 text-sm text-muted-foreground">
              Pick a nickname to join as a guest. No account needed.
            </p>

            <GuestJoinForm roomId={room.id} defaultName={guestNickname} />

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Want to save characters and create rooms?{" "}
              <Link
                href="/login"
                className="font-medium text-[var(--ember)] underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
