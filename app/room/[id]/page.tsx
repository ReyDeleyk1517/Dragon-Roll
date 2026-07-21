import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

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
  });

  if (!room) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        Room
      </h1>

      <div className="space-y-4 text-lg">
        <p>
          <strong>Name:</strong> {room.name}
        </p>

        <p>
          <strong>Code:</strong> {room.code}
        </p>

        <p>
          <strong>ID:</strong> {room.id}
        </p>
      </div>
    </main>
  );
}