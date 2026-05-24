"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadCharacter, saveCharacter, deleteCharacter } from "../../../utils/db";
import CharacterSheet from "../../../components/CharacterSheet";
import { Character } from "../../../types/character";

export const dynamic = "force-dynamic"; // Forces this page to be dynamic

const CharacterPage = () => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? Number(params.id) : null; // Ensure it's a number

  // Load character data
  useEffect(() => {
    const loadCharacterData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const fetchedCharacter = await loadCharacter(id);
          setCharacter(fetchedCharacter);
        } catch (error) {
          console.error("Error loading character:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn("No id provided; skipping loadCharacter.");
        setIsLoading(false);
      }
    };

    loadCharacterData();
  }, [id]);


  // Auto-save character whenever it changes
  useEffect(() => {
    if (character) {
      const save = async () => {
        try {
          await saveCharacter(character);
        } catch (error) {
          console.error("Error saving character:", error);
        }
      };
      save();
    }
  }, [character]);


  const handleDelete = async () => {
    if (character) {
      try {
        await deleteCharacter(character.id);
        router.push("/"); // Redirect after deletion
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!character) return <p>Character not found.</p>;

  return (
    <div className="flex flex-col items-center py-4 md:py-8 px-0 overflow-x-clip w-full">
      <CharacterSheet 
        character={character} 
        setCharacter={setCharacter} 
        onDelete={handleDelete}
        onReturn={() => router.push("/")}
      />
    </div>
  );
};

export default CharacterPage;
