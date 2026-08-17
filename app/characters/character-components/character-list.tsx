"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ListType = "characters" | "monsters";

export default function CharacterList() {
  const [activeList, setActiveList] = useState<ListType>("characters");

  // temp variables
  const characterCount = 0;
  const monsterCount = 0;

  const currentCount =
    activeList === "characters" ? characterCount : monsterCount;

  const maxSlots = 5;

  const isCharacters = activeList === "characters";

  //temp functions
  const createCharacter = () => {
    console.log("create character");
  };
  const createMonster = () => {
    console.log("create monster");
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Selector */}
            <div className="flex gap-2">
              <Button
                variant={isCharacters ? "default" : "outline"}
                onClick={() => setActiveList("characters")}
              >
                Characters
              </Button>

              <Button
                variant={!isCharacters ? "default" : "outline"}
                onClick={() => setActiveList("monsters")}
              >
                Monsters
              </Button>
            </div>

            {/* Slot counter */}
            <div className="flex items-center gap-3">
              <Button className="bg-green-800 text-white"
                onClick={() =>
                  activeList === "characters"
                    ? createCharacter()
                    : createMonster()
                }
              >
                {activeList === "characters"
                  ? "Create character"
                  : "Create mosnter"}
              </Button>
              <p className="text-sm text-muted-foreground">
                {currentCount}/{maxSlots} slots
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />

            <Input
              placeholder={
                isCharacters ? "Search characters..." : "Search monsters..."
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* List */}
        <div className="h-[70vh] overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center text-muted-foreground">
            {isCharacters ? "No characters yet." : "No monsters yet."}
          </div>
        </div>
      </div>
    </div>
  );
}
