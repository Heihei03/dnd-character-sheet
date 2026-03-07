"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Character } from "../types/character";
import { loadAllCharacters, deleteCharacter, saveCharacter, exportAllCharacters, importCharacters } from "../utils/db"; // Import backup functions

const HomePage = () => {
  // Specify the type of characters as an array of Character objects
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    // Load the characters from IndexedDB when the component mounts
    const loadData = async () => {
      try {
        const characterList = await loadAllCharacters();
        setCharacters(characterList); // Now it's type-safe
      } catch (error) {
        console.error("Error loading characters:", error);
      }
    };
    loadData();
  }, []); // The empty dependency array ensures this runs only once when the component mounts

  // Delete character by ID
  const handleDeleteCharacter = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter(id); // Delete the character from IndexedDB
        setCharacters(characters.filter((character) => character.id !== id)); // Update the character list
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  // Create a new character
  const createNewCharacter = () => {
    const newCharacter: Character = {
      id: Date.now(), // Unique ID based on timestamp
      name: "New Character", // Default name
      maxHp: 10,
      hp: 10,
      tempHp: 0,
      classes: [{ name: "Fighter", level: 1 }],
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      weaponProficiencies: [],
      armorProficiencies: [],
      toolProficiencies: [],
      languages: ["Common"],
      species: "",
      background: "",
    };

    // Save new character to IndexedDB
    saveCharacter(newCharacter).then(() => {
      setCharacters([...characters, newCharacter]); // Add the new character to the list
    }).catch((error) => {
      console.error("Error saving new character:", error);
    });
  };

  // Export all character data to a JSON file
  const handleExportData = async () => {
    try {
      const data = await exportAllCharacters();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dnd-characters-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export character data.");
    }
  };

  // Import character data from a JSON file
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        try {
          await importCharacters(content);
          // Refresh character list
          const updatedList = await loadAllCharacters();
          setCharacters(updatedList);
          alert("Characters imported successfully!");
        } catch (error) {
          console.error("Error importing data:", error);
          alert("Failed to import character data. Please ensure the file is a valid backup.");
        }
      }
    };
    reader.readAsText(file);
    // Reset input value so the same file can be selected again if needed
    event.target.value = "";
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Character Selection</h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={createNewCharacter}
          className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create New Character
        </button>
        <button
          onClick={handleExportData}
          className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Export Data
        </button>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="absolute inset-0 opacity-0 cursor-pointer"
            id="import-input"
          />
          <button
            className="py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Import Data
          </button>
        </div>
      </div>
      {characters.length > 0 ? (
        <div className="space-y-4">
          {characters.map((character) => (
            <div key={character.id} className="flex justify-between items-center w-full max-w-md">
              <Link
                href={`/characters/${character.id}`}
                className="w-full py-2 px-4 bg-gray-200 rounded-lg text-left hover:bg-gray-300"
              >
                {character.name}
              </Link>
              <button
                onClick={() => handleDeleteCharacter(character.id)}
                className="ml-4 py-1 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No characters found. Please create a character.</p>
      )}
    </div>
  );
};

export default HomePage;
