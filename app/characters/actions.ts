"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const MAX_SLOTS = 5;

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

// ==========================================
// CHARACTER
// ==========================================

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

  return {
    success: true,
    character: updatedCharacter,
  };
}

// ==========================================
// MONSTER
// ==========================================

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

  return {
    success: true,
    monster: updatedMonster,
  };
}