"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createCharacter,
  updateCharacter,
  createMonster,
  updateMonster,
  searchMonsterLibrary,
  loadMonsterFromLibrary,
} from "../actions";
import type { Open5eMonsterOption } from "@/lib/open5e";
import type { CharacterData, MonsterData } from "./types";

type EntityType = "character" | "monster";
type FormMode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  type: EntityType;
  mode: FormMode;

  character?: CharacterData;
  monster?: MonsterData;

  onSuccess?: () => void;
};

export default function CharacterFormDialog({
  open,
  onOpenChange,
  type,
  mode,
  character,
  monster,
  onSuccess,
}: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Open5e autofill (available only when creating a monster).
  const [draft, setDraft] = useState<MonsterData | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Open5eMonsterOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [importingSlug, setImportingSlug] = useState<string | null>(null);
  const [autofilledName, setAutofilledName] = useState<string | null>(null);

  const isCharacter = type === "character";
  const showImporter = !isCharacter && mode === "create";
  const hasQuery = query.trim().length >= 2;

  // Dependiendo del tipo, utilizamos character o monster
  const data = isCharacter ? character : (draft ?? monster);

  const title =
    mode === "create"
      ? isCharacter
        ? "Create character"
        : "Create monster"
      : isCharacter
        ? "Edit character"
        : "Edit monster";

  // Reset everything when the dialog closes.
  function resetImporter() {
    setDraft(null);
    setFormKey(0);
    setQuery("");
    setResults([]);
    setSearching(false);
    setSearchError("");
    setImportingSlug(null);
    setAutofilledName(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setError("");
      resetImporter();
    }

    onOpenChange(nextOpen);
  }

  function handleQueryChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setSearchError("");
      setSearching(false);
    }
  }

  // Debounced Open5e search.
  useEffect(() => {
    if (!showImporter || !open) {
      return;
    }

    const term = query.trim();

    if (term.length < 2) {
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        const options = await searchMonsterLibrary(term);

        if (!active) {
          return;
        }

        setResults(options);
        setSearchError("");
      } catch {
        if (!active) {
          return;
        }

        setResults([]);
        setSearchError("Could not reach the Open5e library. Try again.");
      } finally {
        if (active) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, showImporter, open]);

  async function handleImport(slug: string) {
    setImportingSlug(slug);
    setSearchError("");

    try {
      const detail = await loadMonsterFromLibrary(slug);

      if (!detail) {
        setSearchError("That monster could not be found.");
        return;
      }

      setDraft({
        id: "",
        name: detail.name,
        armorClass: detail.armorClass,
        maxHp: detail.maxHp,
        initiativeBonus: detail.initiativeBonus,
        strength: detail.strength,
        dexterity: detail.dexterity,
        constitution: detail.constitution,
        intelligence: detail.intelligence,
        wisdom: detail.wisdom,
        charisma: detail.charisma,
      });
      setAutofilledName(detail.name);
      setFormKey((key) => key + 1);
      setResults([]);
      setQuery("");
    } catch {
      setSearchError("Could not load that monster. Try again.");
    } finally {
      setImportingSlug(null);
    }
  }

  async function handleSubmit(formData: FormData) {
    try {
      setLoading(true);
      setError("");

      if (type === "character") {
        if (mode === "create") {
          await createCharacter(formData);
        } else {
          if (!character) {
            throw new Error("Character data is missing.");
          }

          await updateCharacter(character.id, formData);
        }
      } else {
        if (mode === "create") {
          await createMonster(formData);
        } else {
          if (!monster) {
            throw new Error("Monster data is missing.");
          }

          await updateMonster(monster.id, formData);
        }
      }

      // Cerrar modal
      onOpenChange(false);

      // Avisar al componente padre
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {showImporter ? (
          <div className="space-y-3 rounded-lg border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-foreground/[0.02] p-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">
                Autofill from Open5e
              </h3>

              <p className="text-xs text-muted-foreground">
                Search the Open5e library to fill the fields, or skip this and
                enter custom values below.
              </p>
            </div>

            <Input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search monsters (e.g. goblin, dragon)"
              autoComplete="off"
            />

            {autofilledName && !searchError ? (
              <p className="text-xs text-[var(--ember)]">
                Autofilled from &ldquo;{autofilledName}&rdquo;. Adjust any value
                before creating.
              </p>
            ) : null}

            {hasQuery && searching ? (
              <p className="text-xs text-muted-foreground">Searching…</p>
            ) : null}

            {hasQuery && searchError ? (
              <p className="text-xs text-red-500">{searchError}</p>
            ) : null}

            {hasQuery && !searching && results.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto rounded-md border border-[color-mix(in_oklch,var(--gold),transparent_88%)]">
                {results.map((option) => (
                  <li key={option.slug}>
                    <button
                      type="button"
                      onClick={() => handleImport(option.slug)}
                      disabled={importingSlug !== null}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-foreground/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate">{option.name}</span>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        CR {option.challengeRating} · {option.size}{" "}
                        {option.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <form key={formKey} action={handleSubmit} className="space-y-6">
          {/* ========================= */}
          {/* BASIC INFORMATION */}
          {/* ========================= */}

          <div className="space-y-4">
            <h3 className="font-semibold">Basic information</h3>

            <div className="space-y-2">
              <label htmlFor="name">Name</label>

              <Input
                id="name"
                name="name"
                placeholder={isCharacter ? "Character name" : "Monster name"}
                defaultValue={data?.name ?? ""}
                required
              />
            </div>

            {/* Level solamente existe en Character */}
            {isCharacter && (
              <div className="space-y-2">
                <label htmlFor="level">Level</label>

                <Input
                  id="level"
                  name="level"
                  type="number"
                  min="1"
                  defaultValue={character?.level ?? 1}
                  required
                />
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* COMBAT */}
          {/* ========================= */}

          <div className="space-y-4">
            <h3 className="font-semibold">Combat</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="armorClass">Armor Class</label>

                <Input
                  id="armorClass"
                  name="armorClass"
                  type="number"
                  defaultValue={data?.armorClass ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="maxHp">Max HP</label>

                <Input
                  id="maxHp"
                  name="maxHp"
                  type="number"
                  min="1"
                  defaultValue={data?.maxHp ?? 1}
                  required
                />
              </div>

              {/* Character tiene currentHp.
                  MonsterTemplate no. */}
              {isCharacter && (
                <div className="space-y-2">
                  <label htmlFor="currentHp">Current HP</label>

                  <Input
                    id="currentHp"
                    name="currentHp"
                    type="number"
                    min="0"
                    defaultValue={character?.currentHp ?? 1}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="initiativeBonus">Initiative Bonus</label>

                <Input
                  id="initiativeBonus"
                  name="initiativeBonus"
                  type="number"
                  defaultValue={data?.initiativeBonus ?? 0}
                  required
                />
              </div>
            </div>
          </div>

          {/* ABILITY SCORES */}

          <div className="space-y-4">
            <h3 className="font-semibold">Ability Scores</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="strength">Strength</label>

                <Input
                  id="strength"
                  name="strength"
                  type="number"
                  defaultValue={data?.strength ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dexterity">Dexterity</label>

                <Input
                  id="dexterity"
                  name="dexterity"
                  type="number"
                  defaultValue={data?.dexterity ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="constitution">Constitution</label>

                <Input
                  id="constitution"
                  name="constitution"
                  type="number"
                  defaultValue={data?.constitution ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="intelligence">Intelligence</label>

                <Input
                  id="intelligence"
                  name="intelligence"
                  type="number"
                  defaultValue={data?.intelligence ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="wisdom">Wisdom</label>

                <Input
                  id="wisdom"
                  name="wisdom"
                  type="number"
                  defaultValue={data?.wisdom ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="charisma">Charisma</label>

                <Input
                  id="charisma"
                  name="charisma"
                  type="number"
                  defaultValue={data?.charisma ?? 10}
                  required
                />
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* SUBMIT */}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "create"
                ? isCharacter
                  ? "Create character"
                  : "Create monster"
                : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
