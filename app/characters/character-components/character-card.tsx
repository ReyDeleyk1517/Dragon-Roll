"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CharacterData, MonsterData } from "./types";

type Props =
  | {
      type: "character";
      data: CharacterData;
      onEdit?: () => void;
      onDelete?: () => void;
    }
  | {
      type: "monster";
      data: MonsterData;
      onEdit?: () => void;
      onDelete?: () => void;
    };

export default function CharacterCard({
  type,
  data,
  onEdit,
  onDelete,
}: Props) {
  const isCharacter = type === "character";

  return (
    <div className="rounded-xl border border-[color-mix(in_oklch,var(--gold),transparent_84%)] bg-card p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.03),0_20px_44px_-30px_oklch(0_0_0/0.9)] transition-colors hover:border-[color-mix(in_oklch,var(--ember),transparent_60%)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold">
            {data.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {isCharacter ? `Level ${data.level}` : "Monster"}
          </p>
        </div>

        <div
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
            isCharacter
              ? "bg-[color-mix(in_oklch,var(--ember),transparent_88%)] text-[var(--ember)] ring-[color-mix(in_oklch,var(--ember),transparent_68%)]"
              : "bg-[color-mix(in_oklch,var(--arcane),transparent_88%)] text-[var(--arcane)] ring-[color-mix(in_oklch,var(--arcane),transparent_68%)]"
          )}
        >
          {isCharacter ? "Character" : "Monster"}
        </div>
      </div>

      {/* Combat stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <CombatStat label="AC" value={data.armorClass} />

        <CombatStat
          label="HP"
          value={isCharacter ? `${data.currentHp}/${data.maxHp}` : data.maxHp}
        />

        <CombatStat
          label="Initiative"
          value={
            data.initiativeBonus >= 0
              ? `+${data.initiativeBonus}`
              : data.initiativeBonus
          }
        />
      </div>

      {/* Ability scores */}
      <div className="mt-4 grid grid-cols-6 gap-2 border-t border-[color-mix(in_oklch,var(--gold),transparent_88%)] pt-4">
        <AbilityScore label="STR" value={data.strength} />

        <AbilityScore label="DEX" value={data.dexterity} />

        <AbilityScore label="CON" value={data.constitution} />

        <AbilityScore label="INT" value={data.intelligence} />

        <AbilityScore label="WIS" value={data.wisdom} />

        <AbilityScore label="CHA" value={data.charisma} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2 border-t border-[color-mix(in_oklch,var(--gold),transparent_88%)] pt-4">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}

        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

type CombatStatProps = {
  label: string;
  value: number | string;
};

function CombatStat({ label, value }: CombatStatProps) {
  return (
    <div className="rounded-lg bg-foreground/[0.03] p-2 ring-1 ring-inset ring-[color-mix(in_oklch,var(--gold),transparent_88%)]">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="font-heading text-base font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

type AbilityScoreProps = {
  label: string;
  value: number;
};

function AbilityScore({ label, value }: AbilityScoreProps) {
  return (
    <div className="rounded-md bg-foreground/[0.02] py-1.5 text-center">
      <p className="text-[10px] font-medium text-muted-foreground">
        {label}
      </p>

      <p className="text-sm font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}
