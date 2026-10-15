import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

import CharacterList from "./character-components/character-list";

export default async function CharactersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [characters, monsters] = await Promise.all([
    prisma.character.findMany({
      where: { ownerId: session.user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        level: true,
        armorClass: true,
        maxHp: true,
        currentHp: true,
        initiativeBonus: true,
        strength: true,
        dexterity: true,
        constitution: true,
        intelligence: true,
        wisdom: true,
        charisma: true,
      },
    }),
    prisma.monsterTemplate.findMany({
      where: { ownerId: session.user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        armorClass: true,
        maxHp: true,
        initiativeBonus: true,
        strength: true,
        dexterity: true,
        constitution: true,
        intelligence: true,
        wisdom: true,
        charisma: true,
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-[0.01em]">
          My Characters and npc
        </h1>

        <span className="h-px w-24 bg-gradient-to-r from-[var(--ember)] to-transparent" />
      </div>

      <CharacterList characters={characters} monsters={monsters} />
    </main>
  );
}
