import CharacterList from "./character-components/character-list";

export default function CharactersPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">My Characters and npc</h1>
      <CharacterList/>
    </main>
  );
}