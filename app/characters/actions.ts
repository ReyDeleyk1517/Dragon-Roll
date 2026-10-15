"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getOpen5eMonster, searchOpen5eMonsters } from "@/lib/open5e";

const MAX_SLOTS = 5;
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 60;
const OPEN5E_SLUG_PATTERN = /^[a-z0-9-]+$/i;

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

function getNumber(formData: FormData, name: string): number {
  const value = Number(formData.get(name));

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid value for ${name}`);
  }

  return value;
}

// CHARACTER
export async function createCharacter(formData: FormData) {
  const user = await getCurrentUser();

  // Verificar límite de personajes
  const count = await prisma.character.count({
    where: {
      ownerId: user.id,
    },
  });

  if (count >= MAX_SLOTS) {
    throw new Error("You can only have 5 characters.");
  }

  const name = formData.get("name")?.toString().trim();

  if (!name) {
    throw new Error("Character name is required.");
  }

  const character = await prisma.character.create({
    data: {
      ownerId: user.id,

      name,

      level: getNumber(formData, "level"),

      armorClass: getNumber(formData, "armorClass"),

      maxHp: getNumber(formData, "maxHp"),

      currentHp: getNumber(formData, "currentHp"),

      initiativeBonus: getNumber(formData, "initiativeBonus"),

      strength: getNumber(formData, "strength"),
      dexterity: getNumber(formData, "dexterity"),
      constitution: getNumber(formData, "constitution"),
      intelligence: getNumber(formData, "intelligence"),
      wisdom: getNumber(formData, "wisdom"),
      charisma: getNumber(formData, "charisma"),
    },
  });

  revalidatePath("/characters");

  return {
    success: true,
    character,
  };
}

export async function updateCharacter(
  characterId: string,
  formData: FormData
) {
  const user = await getCurrentUser();

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      ownerId: user.id,
    },
  });

  if (!character) {
    throw new Error("Character not found.");
  }

  const name = formData.get("name")?.toString().trim();

  if (!name) {
    throw new Error("Character name is required.");
  }

  const updatedCharacter = await prisma.character.update({
    where: {
      id: characterId,
    },
    data: {
      name,

      level: getNumber(formData, "level"),

      armorClass: getNumber(formData, "armorClass"),

      maxHp: getNumber(formData, "maxHp"),

      currentHp: getNumber(formData, "currentHp"),

      initiativeBonus: getNumber(formData, "initiativeBonus"),

      strength: getNumber(formData, "strength"),
      dexterity: getNumber(formData, "dexterity"),
      constitution: getNumber(formData, "constitution"),
      intelligence: getNumber(formData, "intelligence"),
      wisdom: getNumber(formData, "wisdom"),
      charisma: getNumber(formData, "charisma"),
    },
  });

  revalidatePath("/characters");

  return {
    success: true,
    character: updatedCharacter,
  };
}

// MONSTER

export async function createMonster(formData: FormData) {
  const user = await getCurrentUser();

  // Verificar límite de monstruos
  const count = await prisma.monsterTemplate.count({
    where: {
      ownerId: user.id,
    },
  });

  if (count >= MAX_SLOTS) {
    throw new Error("You can only have 5 monsters.");
  }

  const name = formData.get("name")?.toString().trim();

  if (!name) {
    throw new Error("Monster name is required.");
  }

  const monster = await prisma.monsterTemplate.create({
    data: {
      ownerId: user.id,

      name,

      armorClass: getNumber(formData, "armorClass"),

      maxHp: getNumber(formData, "maxHp"),

      initiativeBonus: getNumber(formData, "initiativeBonus"),

      strength: getNumber(formData, "strength"),
      dexterity: getNumber(formData, "dexterity"),
      constitution: getNumber(formData, "constitution"),
      intelligence: getNumber(formData, "intelligence"),
      wisdom: getNumber(formData, "wisdom"),
      charisma: getNumber(formData, "charisma"),
    },
  });

  revalidatePath("/characters");

  return {
    success: true,
    monster,
  };
}

export async function updateMonster(
  monsterId: string,
  formData: FormData
) {
  const user = await getCurrentUser();

  const monster = await prisma.monsterTemplate.findFirst({
    where: {
      id: monsterId,
      ownerId: user.id,
    },
  });

  if (!monster) {
    throw new Error("Monster not found.");
  }

  const name = formData.get("name")?.toString().trim();

  if (!name) {
    throw new Error("Monster name is required.");
  }

  const updatedMonster = await prisma.monsterTemplate.update({
    where: {
      id: monsterId,
    },
    data: {
      name,

      armorClass: getNumber(formData, "armorClass"),

      maxHp: getNumber(formData, "maxHp"),

      initiativeBonus: getNumber(formData, "initiativeBonus"),

      strength: getNumber(formData, "strength"),
      dexterity: getNumber(formData, "dexterity"),
      constitution: getNumber(formData, "constitution"),
      intelligence: getNumber(formData, "intelligence"),
      wisdom: getNumber(formData, "wisdom"),
      charisma: getNumber(formData, "charisma"),
    },
  });

  revalidatePath("/characters");

  return {
    success: true,
    monster: updatedMonster,
  };
}

// DELETE

export async function deleteCharacter(characterId: string) {
  const user = await getCurrentUser();

  if (typeof characterId !== "string" || !characterId) {
    throw new Error("Invalid character.");
  }

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      ownerId: user.id,
    },
  });

  if (!character) {
    throw new Error("Character not found.");
  }

  await prisma.character.delete({
    where: {
      id: characterId,
    },
  });

  revalidatePath("/characters");

  return { success: true };
}

export async function deleteMonster(monsterId: string) {
  const user = await getCurrentUser();

  if (typeof monsterId !== "string" || !monsterId) {
    throw new Error("Invalid monster.");
  }

  const monster = await prisma.monsterTemplate.findFirst({
    where: {
      id: monsterId,
      ownerId: user.id,
    },
  });

  if (!monster) {
    throw new Error("Monster not found.");
  }

  await prisma.monsterTemplate.delete({
    where: {
      id: monsterId,
    },
  });

  revalidatePath("/characters");

  return { success: true };
}

// OPEN5E LIBRARY

export async function searchMonsterLibrary(query: string) {
  await getCurrentUser();

  const term =
    typeof query === "string"
      ? query.trim().slice(0, MAX_SEARCH_LENGTH)
      : "";

  if (term.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  return searchOpen5eMonsters(term);
}

export async function loadMonsterFromLibrary(slug: string) {
  await getCurrentUser();

  if (typeof slug !== "string" || !OPEN5E_SLUG_PATTERN.test(slug)) {
    throw new Error("Invalid monster reference.");
  }

  return getOpen5eMonster(slug);
}