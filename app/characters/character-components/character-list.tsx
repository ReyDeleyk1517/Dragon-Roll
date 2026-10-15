"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import CharacterFormDialog from "./character-form-dialog";
import CharacterCard from "./character-card";
import { deleteCharacter, deleteMonster } from "../actions";
import type { CharacterData, MonsterData } from "./types";

type ListType = "characters" | "monsters";

type DialogState = {
  open: boolean;
  mode: "create" | "edit";
  type: ListType;
  entity: CharacterData | MonsterData | null;
};

type DeleteTarget = {
  type: ListType;
  id: string;
  name: string;
};

const MAX_SLOTS = 5;

type Props = {
  characters: CharacterData[];
  monsters: MonsterData[];
};

export default function CharacterList({ characters, monsters }: Props) {
  const router = useRouter();

  const [activeList, setActiveList] = useState<ListType>("characters");
  const [search, setSearch] = useState("");

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: "create",
    type: "characters",
    entity: null,
  });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isCharacters = activeList === "characters";
  const currentList = isCharacters ? characters : monsters;
  const currentCount = currentList.length;

  const filteredList = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return currentList;
    }

    return currentList.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }, [currentList, search]);

  function handleCreate() {
    if (currentCount >= MAX_SLOTS) {
      return;
    }

    setDialog({
      open: true,
      mode: "create",
      type: activeList,
      entity: null,
    });
  }

  function handleEdit(
    type: ListType,
    entity: CharacterData | MonsterData
  ) {
    setDialog({ open: true, mode: "edit", type, entity });
  }

  function handleDelete(type: ListType, entity: CharacterData | MonsterData) {
    setDeleteError("");
    setDeleteTarget({ type, id: entity.id, name: entity.name });
  }

  function handleDialogOpenChange(open: boolean) {
    setDialog((prev) => ({ ...prev, open }));
  }

  function handleSuccess() {
    setDialog((prev) => ({ ...prev, open: false }));
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      if (deleteTarget.type === "characters") {
        await deleteCharacter(deleteTarget.id);
      } else {
        await deleteMonster(deleteTarget.id);
      }

      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card shadow-[inset_0_1px_0_0_oklch(1_0_0/0.03),0_24px_50px_-32px_oklch(0_0_0/0.9)]">
        {/* Header */}
        <div className="border-b border-[color-mix(in_oklch,var(--gold),transparent_88%)] p-4">
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

            {/* Create + Slot counter */}
            <div className="flex items-center gap-3">
              <Button
                className="w-full sm:w-auto"
                onClick={handleCreate}
                disabled={currentCount >= MAX_SLOTS}
              >
                {isCharacters ? "Create character" : "Create monster"}
              </Button>

              <p className="font-heading text-sm text-muted-foreground tabular-nums">
                {currentCount}/{MAX_SLOTS} slots
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              size={18}
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isCharacters ? "Search characters..." : "Search monsters..."
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* List */}
        <div className="h-[70vh] overflow-y-auto p-4">
          {currentList.length === 0 ? (
            <div className="flex min-h-full items-center justify-center text-muted-foreground">
              {isCharacters ? "No characters yet." : "No monsters yet."}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex min-h-full items-center justify-center text-muted-foreground">
              No matches found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isCharacters
                ? filteredList.map((character) => (
                    <CharacterCard
                      key={character.id}
                      type="character"
                      data={character as CharacterData}
                      onEdit={() =>
                        handleEdit("characters", character as CharacterData)
                      }
                      onDelete={() =>
                        handleDelete("characters", character as CharacterData)
                      }
                    />
                  ))
                : filteredList.map((monster) => (
                    <CharacterCard
                      key={monster.id}
                      type="monster"
                      data={monster as MonsterData}
                      onEdit={() =>
                        handleEdit("monsters", monster as MonsterData)
                      }
                      onDelete={() =>
                        handleDelete("monsters", monster as MonsterData)
                      }
                    />
                  ))}
            </div>
          )}
        </div>
      </div>

      {/* Character / Monster Form Dialog */}
      <CharacterFormDialog
        open={dialog.open}
        onOpenChange={handleDialogOpenChange}
        type={dialog.type === "characters" ? "character" : "monster"}
        mode={dialog.mode}
        character={
          dialog.type === "characters" && dialog.entity
            ? (dialog.entity as CharacterData)
            : undefined
        }
        monster={
          dialog.type === "monsters" && dialog.entity
            ? (dialog.entity as MonsterData)
            : undefined
        }
        onSuccess={handleSuccess}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {deleteTarget?.type === "characters" ? "character" : "monster"}
            </DialogTitle>

            <DialogDescription>
              This permanently deletes &ldquo;{deleteTarget?.name}&rdquo;. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError ? (
            <p className="text-sm text-red-500">{deleteError}</p>
          ) : null}

          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
